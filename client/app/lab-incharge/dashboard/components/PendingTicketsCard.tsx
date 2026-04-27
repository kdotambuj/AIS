"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";

interface Resource {
  id: string;
  name: string;
  model?: string;
  resourceCategory: {
    name: string;
  };
}

interface TicketItem {
  id: string;
  resource: Resource;
  quantity: number;
  from: string;
  till: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "ISSUED" | "RETURNED";
}

interface RequestedUser {
  id: string;
  name: string;
  email: string;
  rollNumber?: string;
  department: {
    name: string;
  };
}

interface Ticket {
  id: string;
  requestedUser: RequestedUser;
  ticketItems: TicketItem[];
  ticketStatus: "PENDING" | "APPROVED" | "REJECTED" | "RESOLVED";
  createdAt: string;
}

const PendingTicketsCard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDecisions, setPendingDecisions] = useState<
    Record<string, "ACCEPTED" | "REJECTED">
  >({});
  const [submittingTickets, setSubmittingTickets] = useState<Set<string>>(
    new Set(),
  );
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth,
  );

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ticket/my-authority`,
        {
          credentials: "include",
        },
      );

      const data = await res.json();

      if (data.success) {
        // Filter only tickets with pending items
        const pendingTickets = data.data.filter((ticket: Ticket) =>
          ticket.ticketItems.some((item) => item.status === "PENDING"),
        );
        setTickets(pendingTickets);
        const validPendingItemIds = new Set(
          pendingTickets.flatMap((ticket: Ticket) =>
            ticket.ticketItems
              .filter((item) => item.status === "PENDING")
              .map((item) => item.id),
          ),
        );
        setPendingDecisions((prev) => {
          const next: Record<string, "ACCEPTED" | "REJECTED"> = {};
          for (const [itemId, status] of Object.entries(prev)) {
            if (validPendingItemIds.has(itemId)) {
              next[itemId] = status;
            }
          }
          return next;
        });
      } else {
        setError(data.message || "Failed to fetch tickets");
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Failed to fetch tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setIsLoading(false);
      setError("Please login to view pending tickets");
      return;
    }

    fetchTickets();
  }, [authLoading, isAuthenticated]);

  const setItemDecision = (
    ticketItemId: string,
    status: "ACCEPTED" | "REJECTED",
  ) => {
    setPendingDecisions((prev) => ({
      ...prev,
      [ticketItemId]: status,
    }));
  };

  const submitTicketDecisions = async (ticket: Ticket) => {
    const pendingItems = ticket.ticketItems.filter(
      (item) => item.status === "PENDING",
    );
    const items = pendingItems
      .map((item) => ({
        ticketItemId: item.id,
        status: pendingDecisions[item.id],
      }))
      .filter(
        (
          item,
        ): item is {
          ticketItemId: string;
          status: "ACCEPTED" | "REJECTED";
        } => item.status === "ACCEPTED" || item.status === "REJECTED",
      );

    if (!items.length) {
      alert("Please choose at least one decision before submitting");
      return;
    }

    try {
      setSubmittingTickets((prev) => new Set(prev).add(ticket.id));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ticket/update-items-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ticketId: ticket.id,
            items,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setPendingDecisions((prev) => {
          const next = { ...prev };
          for (const item of items) {
            delete next[item.ticketItemId];
          }
          return next;
        });
        await fetchTickets();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    } finally {
      setSubmittingTickets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(ticket.id);
        return newSet;
      });
    }
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6">
        <p>{error}</p>
      </div>
    );
  }

  const pendingItemsCount = tickets.reduce(
    (acc, ticket) =>
      acc +
      ticket.ticketItems.filter((item) => item.status === "PENDING").length,
    0,
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Approvals
            </h2>
            <p className="text-sm text-gray-500">
              {pendingItemsCount} item(s) waiting for your decision
            </p>
          </div>
        </div>
        <button
          onClick={fetchTickets}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <svg
            className="mx-auto h-10 w-10 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-2 text-sm">All caught up! No pending requests.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tickets.map((ticket) => {
            const pendingItems = ticket.ticketItems.filter(
              (item) => item.status === "PENDING",
            );
            const selectedCount = pendingItems.filter(
              (item) => pendingDecisions[item.id],
            ).length;

            return (
              <div
                key={ticket.id}
                className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-700 font-medium">
                    {ticket.requestedUser.name} (
                    {ticket.requestedUser.rollNumber ||
                      ticket.requestedUser.email}
                    )
                  </p>
                  <button
                    onClick={() => submitTicketDecisions(ticket)}
                    disabled={
                      selectedCount === 0 || submittingTickets.has(ticket.id)
                    }
                    className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submittingTickets.has(ticket.id)
                      ? "Submitting..."
                      : `Submit (${selectedCount})`}
                  </button>
                </div>

                <div className="space-y-2">
                  {pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-white border border-yellow-100 rounded p-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {item.resource.name}
                          </p>
                          <span className="text-xs text-gray-500">
                            × {item.quantity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDateShort(item.from)} →{" "}
                          {formatDateShort(item.till)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          onClick={() => setItemDecision(item.id, "ACCEPTED")}
                          className={`px-2 py-1 text-xs rounded border ${
                            pendingDecisions[item.id] === "ACCEPTED"
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-green-700 border-green-300 hover:bg-green-50"
                          }`}
                          title="Accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setItemDecision(item.id, "REJECTED")}
                          className={`px-2 py-1 text-xs rounded border ${
                            pendingDecisions[item.id] === "REJECTED"
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-white text-red-700 border-red-300 hover:bg-red-50"
                          }`}
                          title="Reject"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingTicketsCard;
