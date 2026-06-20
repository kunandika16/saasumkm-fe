import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { WhatsAppConnectionStatus } from "@/components/admin/WhatsAppConnectionStatus";

// Mock the whatsapp-api module
vi.mock("@/lib/whatsapp-api", () => ({
  getWhatsAppStatus: vi.fn(),
}));

import { getWhatsAppStatus } from "@/lib/whatsapp-api";

const mockGetWhatsAppStatus = vi.mocked(getWhatsAppStatus);

describe("WhatsAppConnectionStatus", () => {
  const mockOnConnect = vi.fn();
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows loading state initially", () => {
    mockGetWhatsAppStatus.mockReturnValue(new Promise(() => {})); // never resolves
    render(
      <WhatsAppConnectionStatus
        onConnect={mockOnConnect}
        onStatusChange={mockOnStatusChange}
      />
    );
    expect(screen.getByText("Checking WhatsApp...")).toBeInTheDocument();
  });

  it("shows connected state with green indicator", async () => {
    mockGetWhatsAppStatus.mockResolvedValue({
      connected: true,
      phoneNumber: "+6281234567890",
    });

    render(
      <WhatsAppConnectionStatus
        onConnect={mockOnConnect}
        onStatusChange={mockOnStatusChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Connected")).toBeInTheDocument();
    });

    expect(screen.getByText("+6281234567890")).toBeInTheDocument();
    expect(screen.getByLabelText("WhatsApp Connected")).toBeInTheDocument();
    expect(mockOnStatusChange).toHaveBeenCalledWith(true);
  });

  it("shows disconnected state with red indicator and connect button", async () => {
    mockGetWhatsAppStatus.mockResolvedValue({
      connected: false,
    });

    render(
      <WhatsAppConnectionStatus
        onConnect={mockOnConnect}
        onStatusChange={mockOnStatusChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Disconnected")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("WhatsApp Disconnected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /connect to whatsapp/i })
    ).toBeInTheDocument();
    expect(mockOnStatusChange).toHaveBeenCalledWith(false);
  });

  it("calls onConnect when connect button is clicked", async () => {
    mockGetWhatsAppStatus.mockResolvedValue({ connected: false });

    render(
      <WhatsAppConnectionStatus
        onConnect={mockOnConnect}
        onStatusChange={mockOnStatusChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Disconnected")).toBeInTheDocument();
    });

    const connectButton = screen.getByRole("button", {
      name: /connect to whatsapp/i,
    });

    await act(async () => {
      connectButton.click();
    });

    expect(mockOnConnect).toHaveBeenCalledTimes(1);
  });

  it("treats network errors as disconnected", async () => {
    mockGetWhatsAppStatus.mockRejectedValue(new Error("Network Error"));

    render(
      <WhatsAppConnectionStatus
        onConnect={mockOnConnect}
        onStatusChange={mockOnStatusChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Disconnected")).toBeInTheDocument();
    });

    expect(mockOnStatusChange).toHaveBeenCalledWith(false);
  });

  it("polls status every 5 seconds", async () => {
    mockGetWhatsAppStatus.mockResolvedValue({ connected: false });

    render(
      <WhatsAppConnectionStatus
        onConnect={mockOnConnect}
        onStatusChange={mockOnStatusChange}
      />
    );

    await waitFor(() => {
      expect(mockGetWhatsAppStatus).toHaveBeenCalledTimes(1);
    });

    // Advance 5 seconds — should poll again
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockGetWhatsAppStatus).toHaveBeenCalledTimes(2);
    });

    // Advance another 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockGetWhatsAppStatus).toHaveBeenCalledTimes(3);
    });
  });

  it("cleans up polling interval on unmount", async () => {
    mockGetWhatsAppStatus.mockResolvedValue({ connected: true });

    const { unmount } = render(
      <WhatsAppConnectionStatus
        onConnect={mockOnConnect}
        onStatusChange={mockOnStatusChange}
      />
    );

    await waitFor(() => {
      expect(mockGetWhatsAppStatus).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Advance time — should NOT trigger more calls
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockGetWhatsAppStatus).toHaveBeenCalledTimes(1);
  });
});
