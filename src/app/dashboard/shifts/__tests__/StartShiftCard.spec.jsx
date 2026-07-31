import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const fetchTodaySchedule = vi.fn();
const startShift = vi.fn();

vi.mock("@/store/useShiftStore", () => ({
  // The component destructures { fetchTodaySchedule, startShift, loading }.
  default: () => ({ fetchTodaySchedule, startShift, loading: false }),
}));

import StartShiftCard from "../StartShiftCard";

const schedule = (lastClosing) => ({
  success: true,
  data: {
    scheduledShift: {
      _id: "sh1",
      pumpTitle: "Pump 2",
      product: "PMS",
      shiftType: "One-Day-Morning",
      pricePerLtr: 1200,
    },
    lastClosingMeterReading: lastClosing,
    lastShiftEndTime: "2026-07-29T14:00:00.000Z",
  },
});

const props = { onClose: vi.fn(), onStart: vi.fn() };

beforeEach(() => {
  fetchTodaySchedule.mockReset();
  startShift.mockReset();
  startShift.mockResolvedValue({ success: true });
});

describe("StartShiftCard meter prefill", () => {
  it("prefills the opening meter from the last close on that pump", async () => {
    // Attendant A closed Pump 2 at 800; attendant F starting on the same pump
    // must open at 800 so no litres fall between the two shifts.
    fetchTodaySchedule.mockResolvedValue(schedule(800));
    render(<StartShiftCard {...props} />);

    const input = await screen.findByPlaceholderText(/enter current meter reading/i);
    await waitFor(() => expect(input).toHaveValue(800));
  });

  it("says where the prefilled figure came from", async () => {
    fetchTodaySchedule.mockResolvedValue(schedule(800));
    render(<StartShiftCard {...props} />);
    expect(await screen.findByText(/pre-filled from last closing reading/i)).toBeInTheDocument();
  });

  it("leaves the field empty on a pump with no history", async () => {
    fetchTodaySchedule.mockResolvedValue(schedule(null));
    render(<StartShiftCard {...props} />);

    const input = await screen.findByPlaceholderText(/enter current meter reading/i);
    expect(input).toHaveValue(null);
    expect(await screen.findByText(/no previous reading on this pump/i)).toBeInTheDocument();
  });

  it("warns, with the exact shortfall, when the attendant types over the prefill", async () => {
    // The station already has one such gap: a shift closed at 189 and the next
    // opened at 300 — 111 litres nobody accounted for, and nothing said a word.
    fetchTodaySchedule.mockResolvedValue(schedule(189));
    render(<StartShiftCard {...props} />);

    const input = await screen.findByPlaceholderText(/enter current meter reading/i);
    await waitFor(() => expect(input).toHaveValue(189));

    await userEvent.clear(input);
    await userEvent.type(input, "300");

    expect(await screen.findByText(/111 L would be unaccounted for/i)).toBeInTheDocument();
  });

  it("describes a reading lower than the last close differently", async () => {
    fetchTodaySchedule.mockResolvedValue(schedule(500));
    render(<StartShiftCard {...props} />);

    const input = await screen.findByPlaceholderText(/enter current meter reading/i);
    await waitFor(() => expect(input).toHaveValue(500));

    await userEvent.clear(input);
    await userEvent.type(input, "450");

    expect(await screen.findByText(/50 L lower than the last close/i)).toBeInTheDocument();
  });

  it("shows no warning while the prefilled value is untouched", async () => {
    fetchTodaySchedule.mockResolvedValue(schedule(800));
    render(<StartShiftCard {...props} />);

    await screen.findByText(/pre-filled from last closing reading/i);
    expect(screen.queryByText(/unaccounted for/i)).toBeNull();
  });

  it("still allows the override — the physical meter is the truth", async () => {
    // Pumps get reset and repaired. Locking the field would force a knowingly
    // wrong number into the record; the warning makes the gap visible instead.
    fetchTodaySchedule.mockResolvedValue(schedule(189));
    render(<StartShiftCard {...props} />);

    const input = await screen.findByPlaceholderText(/enter current meter reading/i);
    await waitFor(() => expect(input).toHaveValue(189));

    await userEvent.clear(input);
    await userEvent.type(input, "300");
    await userEvent.click(screen.getByRole("button", { name: /start shift/i }));

    await waitFor(() =>
      expect(startShift).toHaveBeenCalledWith({ openingMeterReading: 300 })
    );
  });
});
