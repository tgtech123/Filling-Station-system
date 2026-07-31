import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "../StatCard";

describe("StatCard", () => {
  it("shows the title, subtitle and value", () => {
    render(<StatCard title="Total Commission" subtitle="This month" value="₦120,000" />);
    expect(screen.getByText("Total Commission")).toBeInTheDocument();
    expect(screen.getByText("This month")).toBeInTheDocument();
    expect(screen.getByText("₦120,000")).toBeInTheDocument();
  });

  it("shows no second zero when there is no change to report", () => {
    // The reported bug: `{trend && …}` short-circuits on 0, so React printed a
    // bare "0" beside the value — "₦0" on the left and a stray "0" on the
    // right, which read as two zeros on the Total Commission card.
    const { container } = render(<StatCard title="Total Commission" value="₦0" trend={0} />);

    expect(container.textContent).toBe("Total Commission₦0");
    expect(container.querySelector("svg")).toBeNull(); // no trend arrow either
  });

  it("hides the trend when it is absent", () => {
    const { container } = render(<StatCard title="Active Staff" value="3/5" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("shows a positive trend with its arrow", () => {
    render(<StatCard title="Commission" value="₦5,000" trend={12.5} />);
    expect(screen.getByText("12.5%")).toBeInTheDocument();
  });

  it("shows a negative trend as a magnitude, not a double minus", () => {
    render(<StatCard title="Commission" value="₦5,000" trend={-8} />);
    expect(screen.getByText("8%")).toBeInTheDocument();
    expect(screen.queryByText("-8%")).toBeNull();
  });

  it("lays the trend out on one line so the arrow is not left sitting low", () => {
    // It was `flex flex-col`, stacking the arrow above the percentage — which
    // is why the arrow appeared lower than the text beside it.
    const { container } = render(<StatCard title="X" value="1" trend={5} trendLabel="vs last" />);
    const trendRow = container.querySelector(".items-center.gap-1");
    expect(trendRow).not.toBeNull();
    expect(trendRow?.className).not.toContain("flex-col");
  });

  it("does not pull the icon out of line with a negative margin", () => {
    const { container } = render(<StatCard title="X" value="1" icon={<span>I</span>} />);
    expect(container.innerHTML).not.toContain("mt-[-19px]");
  });
});
