"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/config";
import {
  BookOpen, Copy, Check, Download, Loader2, AlertTriangle, FileText,
} from "lucide-react";

/**
 * The full user manual, in the app.
 *
 * Fetched from the server rather than bundled, because the manual has one home:
 * docs/user-guide.md, the same file `npm run guide` turns into the Word
 * document. A copy pasted into the client would be a second version nobody
 * remembers to update.
 *
 * The copy buttons exist for a specific job — getting this into Word to format
 * as a printed book — so the headings are copied as real <h1>/<h2>/<h3>. Word
 * maps those to its own Heading 1/2/3 styles, which is what makes its navigation
 * pane and automatic table of contents work. Copying plain text would lose all
 * of that and leave every heading to be re-applied by hand.
 */

// ── Markdown → HTML ──────────────────────────────────────────────────────────
// A small renderer for the subset the manual actually uses. Deliberately not a
// library: the output has to be shaped for Word's paste behaviour, which means
// semantic tags and table borders rather than whatever a general-purpose
// renderer emits.

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Inline formatting. Code first, so ** inside backticks is left alone. */
const inline = (text) => {
  let out = esc(text);
  const codes = [];
  out = out.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = out
    // Lazy, not [^*]+: the manual nests italics inside bold ("**… *manager*
    // …**"), and a character class that excludes asterisks stops at the inner
    // pair and leaves the literal ** on the page. Lazy closes at the first
    // following **, which is the right one either way.
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1"); // links flatten — a printed book has no hrefs
  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
  return out;
};

const TABLE_STYLE =
  'border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;border:1px solid #999"';
const TH_STYLE = 'style="border:1px solid #999;background:#eef2f7;text-align:left;padding:6px"';
const TD_STYLE = 'style="border:1px solid #999;padding:6px;vertical-align:top"';

function renderMarkdown(md) {
  const lines = String(md || "").split(/\r?\n/);
  const html = [];
  let i = 0;

  const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
  const cells = (l) =>
    l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i];

    // Blank
    if (!line.trim()) { i++; continue; }

    // Fenced code
    if (/^```/.test(line.trim())) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) buf.push(lines[i++]);
      i++;
      html.push(
        `<pre style="background:#f4f6f8;border:1px solid #ddd;padding:8px;white-space:pre-wrap"><code>${esc(
          buf.join("\n")
        )}</code></pre>`
      );
      continue;
    }

    // Horizontal rule
    if (/^\s*---+\s*$/.test(line)) { html.push("<hr />"); i++; continue; }

    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      html.push(`<h${level}>${inline(h[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    // Table — a row, then a separator row
    if (isTableRow(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const body = [];
      while (i < lines.length && isTableRow(lines[i])) body.push(cells(lines[i++]));
      html.push(
        `<table ${TABLE_STYLE}><thead><tr>${head
          .map((c) => `<th ${TH_STYLE}>${inline(c)}</th>`)
          .join("")}</tr></thead><tbody>${body
          .map(
            (r) =>
              `<tr>${r.map((c) => `<td ${TD_STYLE}>${inline(c)}</td>`).join("")}</tr>`
          )
          .join("")}</tbody></table>`
      );
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      html.push(
        `<blockquote style="border-left:3px solid #1a71f6;margin:8px 0;padding:4px 12px;color:#334">${inline(
          buf.join(" ")
        )}</blockquote>`
      );
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      html.push(`<ul>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      html.push(`<ol>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</ol>`);
      continue;
    }

    // Paragraph — runs until a blank line or the start of another block
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|\s*[-*+]\s|\s*\d+\.\s|\s*>|```|\s*---+\s*$)/.test(lines[i]) &&
      !isTableRow(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) html.push(`<p>${inline(para.join(" "))}</p>`);
  }

  return html.join("\n");
}

/** Strip markdown syntax for the plain-text flavour. */
const toPlainText = (md) =>
  String(md || "")
    .replace(/^\s*\|[\s:|-]+\|\s*$/gm, "")
    .replace(/`{3}[\s\S]*?`{3}/g, (b) => b.replace(/```/g, ""))
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*>\s?/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n");

/**
 * Put rich HTML on the clipboard so Word receives headings and tables, not a
 * wall of text.
 *
 * The modern API carries both flavours, which lets the target choose; the
 * fallback selects an offscreen contenteditable node, which is how this worked
 * before ClipboardItem existed and still covers browsers that block it.
 */
async function copyRich(html, plain) {
  try {
    if (navigator.clipboard && typeof window !== "undefined" && window.ClipboardItem) {
      await navigator.clipboard.write([
        new window.ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
      return true;
    }
  } catch {
    // Fall through — a blocked write is not a reason to give up.
  }

  try {
    const node = document.createElement("div");
    node.setAttribute("contenteditable", "true");
    node.innerHTML = html;
    node.style.cssText = "position:fixed;left:-99999px;top:0;white-space:pre-wrap";
    document.body.appendChild(node);

    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    const ok = document.execCommand("copy");
    sel.removeAllRanges();
    document.body.removeChild(node);
    return ok;
  } catch {
    return false;
  }
}

async function copyPlain(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-99999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function UserManual() {
  const [markdown, setMarkdown] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chapter, setChapter] = useState("all");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/api/support/user-guide");
        if (!alive) return;
        setMarkdown(res.data?.data?.markdown || "");
        setUpdatedAt(res.data?.data?.updatedAt || null);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || "Could not load the manual.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Split on "## " so a chapter can be copied on its own — a 90-page paste is
  // hard to format; one chapter at a time is how a book actually gets built.
  const chapters = useMemo(() => {
    if (!markdown) return [];
    const out = [];
    const lines = markdown.split(/\r?\n/);
    let current = null;
    let preamble = [];
    for (const l of lines) {
      const m = l.match(/^##\s+(.*)$/);
      if (m) {
        if (current) out.push(current);
        current = { title: m[1].trim(), lines: [l] };
      } else if (current) {
        current.lines.push(l);
      } else {
        preamble.push(l);
      }
    }
    if (current) out.push(current);
    if (preamble.join("").trim()) {
      out.unshift({ title: "Cover & Contents", lines: preamble });
    }
    return out.map((c, idx) => ({ ...c, id: String(idx), body: c.lines.join("\n") }));
  }, [markdown]);

  const activeMarkdown = useMemo(() => {
    if (chapter === "all") return markdown;
    return chapters.find((c) => c.id === chapter)?.body || markdown;
  }, [chapter, chapters, markdown]);

  const activeHtml = useMemo(() => renderMarkdown(activeMarkdown), [activeMarkdown]);

  const flash = (key) => {
    setCopied(key);
    setTimeout(() => setCopied(""), 2200);
  };

  const doCopyRich = async () => {
    // A full HTML document, so Word gets a character set and sane base styling
    // instead of guessing.
    const doc = `<!doctype html><html><head><meta charset="utf-8"></head><body style="font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.4">${activeHtml}</body></html>`;
    const ok = await copyRich(doc, toPlainText(activeMarkdown));
    flash(ok ? "rich" : "failed");
  };

  const doCopyPlain = async () => {
    const ok = await copyPlain(toPlainText(activeMarkdown));
    flash(ok ? "plain" : "failed");
  };

  const download = () => {
    const blob = new Blob([activeMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      chapter === "all"
        ? "fueldesk-user-manual.md"
        : `fueldesk-${(chapters.find((c) => c.id === chapter)?.title || "chapter")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-10 justify-center">
        <Loader2 size={16} className="animate-spin" /> Loading the manual…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex gap-2 items-start bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl p-3 text-sm">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="text-[#1a71f6] shrink-0" size={22} />
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">User Manual</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Copy into Word to print or hand to a client
              {updatedAt
                ? ` · updated ${new Date(updatedAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "short", year: "numeric",
                  })}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <select
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm max-w-[15rem]"
          >
            <option value="all">Whole manual</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <button
            onClick={doCopyRich}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a71f6] hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            title="Keeps headings, tables and bold — paste straight into Word"
          >
            {copied === "rich" ? <Check size={15} /> : <Copy size={15} />}
            {copied === "rich" ? "Copied" : "Copy for Word"}
          </button>

          <button
            onClick={doCopyPlain}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="No formatting — just the words"
          >
            {copied === "plain" ? <Check size={15} /> : <FileText size={15} />}
            {copied === "plain" ? "Copied" : "Plain text"}
          </button>

          <button
            onClick={download}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Download the source text"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {copied === "failed" && (
        <p className="px-4 py-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900">
          Your browser blocked the copy. Select the text below and copy it by hand, or use the
          download button.
        </p>
      )}

      <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <strong className="text-gray-700 dark:text-gray-200">To make a book:</strong> pick a chapter
        (or the whole manual), click <strong>Copy for Word</strong>, and paste into a blank Word
        document. The headings arrive as Word&apos;s own Heading 1, 2 and 3 styles, so
        References &gt; Table of Contents will build the contents page for you.
      </p>

      {/* The manual itself */}
      <div className="max-h-[60vh] overflow-y-auto p-5">
        <article
          className="manual-body text-sm text-gray-800 dark:text-gray-100 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: activeHtml }}
        />
      </div>

      {/* Scoped so the manual reads like a document without a typography plugin. */}
      <style jsx global>{`
        .manual-body h1 { font-size: 1.6rem; font-weight: 800; margin: 1.4rem 0 .6rem; }
        .manual-body h2 { font-size: 1.3rem; font-weight: 700; margin: 1.3rem 0 .5rem; color: #1a71f6; }
        .manual-body h3 { font-size: 1.08rem; font-weight: 700; margin: 1rem 0 .4rem; }
        .manual-body h4 { font-size: .98rem; font-weight: 700; margin: .8rem 0 .3rem; }
        .manual-body p { margin: .5rem 0; }
        .manual-body ul { list-style: disc; margin: .5rem 0 .5rem 1.4rem; }
        .manual-body ol { list-style: decimal; margin: .5rem 0 .5rem 1.4rem; }
        .manual-body li { margin: .2rem 0; }
        .manual-body table { margin: .8rem 0; font-size: .85rem; display: block; overflow-x: auto; }
        .manual-body hr { margin: 1.2rem 0; border-color: #e5e7eb; }
        .manual-body code { background: rgba(127,127,127,.15); padding: 0 .25rem; border-radius: 3px; }
        .manual-body blockquote { margin: .6rem 0; }
        .dark .manual-body blockquote { color: #cbd5e1 !important; }
        .dark .manual-body th { background: #1e293b !important; color: #f1f5f9; }
        .dark .manual-body td, .dark .manual-body th { border-color: #475569 !important; }
      `}</style>
    </div>
  );
}
