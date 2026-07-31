import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ScheduleCard from "../ScheduleCard";

const base = {
  name: "Ada Obi",
  role: "attendant",
  onDuty: true,
  email: "ada@station.com",
  phone: "08012345678",
  responsibilities: "Pump 2",
  shiftSchedule: "One-Day-Morning",
  salesTarget: { duration: "Monthly", currentProgress: 50000, targetAmount: 100000 },
  onOpen: vi.fn(),
};

describe("ScheduleCard avatar", () => {
  it("shows initials when the staff member has no photo", () => {
    // The reported glitch: img defaulted to "/default-avatar.png", a file that
    // does not exist. It 404'd, onError reset src to THE SAME missing file, and
    // that looped forever — hammering the network and flickering on every
    // photo-less staff member. Initials need no request and cannot fail.
    const { container } = render(<ScheduleCard {...base} img={null} />);

    expect(screen.getByText("AO")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("never points at the missing placeholder file", () => {
    const { container } = render(<ScheduleCard {...base} img={null} />);
    expect(container.innerHTML).not.toContain("default-avatar");
  });

  it("shows the photo when there is one", () => {
    render(<ScheduleCard {...base} img="https://cdn.example.com/ada.jpg" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://cdn.example.com/ada.jpg");
  });

  it("falls back to initials once, without re-requesting a broken URL", () => {
    const { container } = render(<ScheduleCard {...base} img="https://cdn.example.com/gone.jpg" />);

    const img = container.querySelector("img");
    expect(img).not.toBeNull();

    fireEvent.error(img); // the URL 404s

    // The <img> is replaced outright, so there is nothing left to fail again.
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("AO")).toBeInTheDocument();
  });

  it("copes with a single-word or missing name", () => {
    render(<ScheduleCard {...base} name="Musa" img={null} />);
    expect(screen.getByText("M")).toBeInTheDocument();

    render(<ScheduleCard {...base} name="" img={null} />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("reports duty status", () => {
    render(<ScheduleCard {...base} img={null} />);
    expect(screen.getByText("On Duty")).toBeInTheDocument();

    render(<ScheduleCard {...base} name="Musa Bello" onDuty={false} img={null} />);
    expect(screen.getByText("Off Duty")).toBeInTheDocument();
  });
});
