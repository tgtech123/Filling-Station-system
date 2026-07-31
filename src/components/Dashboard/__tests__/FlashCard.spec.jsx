import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FlashCard from "../FlashCard";

describe("FlashCard", () => {
  it("renders the label and value", () => {
    render(<FlashCard name="Total Fuel Sales" number="₦240,000" />);
    expect(screen.getByText("Total Fuel Sales")).toBeInTheDocument();
    expect(screen.getByText("₦240,000")).toBeInTheDocument();
  });

  it("renders a value of 0 inside a styled heading, not as a bare text node", () => {
    // The reported bug: `{number && <h3>…</h3>}` short-circuits on the NUMBER 0,
    // and React then prints a bare "0" with no heading — losing the font size,
    // colour and centring every other card had. "Under Maintenance: 0" and the
    // zeroed Activity Log counters sat visibly out of line because of it.
    const { container } = render(<FlashCard name="Under Maintenance" number={0} />);

    // The card renders a heading for `variable` too, so pick the one carrying
    // the value rather than whichever comes first in the DOM.
    const headings = [...container.querySelectorAll("h3")];
    const valueHeading = headings.find((h) => h.textContent === "0");

    expect(valueHeading, "the 0 must be inside an <h3>, not a bare text node").toBeTruthy();
    expect(valueHeading.className).toContain("mx-auto");
  });

  it("renders a trend of 0 the same way", () => {
    const { container } = render(<FlashCard name="Growth" trend={0} />);
    expect(container.textContent).toContain("0");
  });

  it("omits the value entirely when none is supplied", () => {
    const { container } = render(<FlashCard name="Nothing" />);
    expect(container.querySelectorAll("h3").length).toBe(1); // only `variable`
  });

  it("keeps the label clear of the icon", () => {
    // Five cards across left ~190px each and the label ran into the icon.
    const { container } = render(
      <FlashCard name="Average Commission Rate" icon={<span>ICON</span>} number="5%" />
    );
    const iconWrapper = screen.getByText("ICON").parentElement;
    expect(iconWrapper?.className).toContain("shrink-0");
    expect(container.querySelector(".min-w-0")).not.toBeNull();
  });
});
