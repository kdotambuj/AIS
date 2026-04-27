"use client";

import { useEffect, useState } from "react";

interface TicketItem {
  id: string;
  resourceId: string;
  quantity: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "ISSUED" | "RETURNED";
  from: string;
  till: string;
}

interface Ticket {
  id: string;
  authorityId: string;
  requestedUserId: string;
  ticketStatus: "PENDING" | "APPROVED" | "REJECTED" | "RESOLVED";
  createdAt: string;
  ticketItems: TicketItem[];
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  RESOLVED: "bg-green-100 text-green-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  ISSUED: "bg-purple-100 text-purple-800",
  RETURNED: "bg-green-100 text-green-800",
};

const TicketsCard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ticket/get`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (data.success) {
        setTickets(data.data || []);
      } else {
        setError(data.message || "Failed to fetch tickets");
      }
    } catch (err) {
      setError("Failed to fetch tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
        <h2 className="text-lg font-medium text-gray-800">
          Tickets ({tickets.length})
        </h2>
        <button
          type="button"
          onClick={fetchTickets}
          disabled={isLoading}
          className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-gray-500 text-sm">No tickets found</div>
      ) : (
        <div className="space-y-4 max-h-128 overflow-y-auto pr-1">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-gray-100 rounded-lg p-4 bg-gray-50/50"
            >
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <p className="text-sm font-medium text-gray-800">
                  Ticket #{ticket.id.slice(0, 8)}
                </p>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[ticket.ticketStatus] || "bg-gray-100 text-gray-700"}`}
                >
                  {ticket.ticketStatus}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Created: {formatDate(ticket.createdAt)}
              </p>
              <p className="text-xs text-gray-500">
                Items: {ticket.ticketItems.length}
              </p>

              <div className="mt-3 space-y-2">
                {ticket.ticketItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 rounded p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-700">
                        Resource #{item.resourceId.slice(0, 8)}
                      </p>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsCard;
