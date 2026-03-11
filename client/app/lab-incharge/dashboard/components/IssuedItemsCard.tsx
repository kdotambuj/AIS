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
  issuedAt?: string;
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

const IssuedItemsCard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
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
        // Filter only tickets with issued items
        const issuedTickets = data.data.filter((ticket: Ticket) =>
          ticket.ticketItems.some((item) => item.status === "ISSUED"),
        );
        setTickets(issuedTickets);
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
      setError("Please login to view issued items");
      return;
    }

    fetchTickets();
  }, [authLoading, isAuthenticated]);

  const markAsReturned = async (ticketItemId: string) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(ticketItemId));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ticket/update-item-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ticketItemId,
            status: "RETURNED",
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        await fetchTickets();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(ticketItemId);
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

  const isOverdue = (tillDate: string) => {
    return new Date(tillDate) < new Date();
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

  const issuedItemsCount = tickets.reduce(
    (acc, ticket) =>
      acc +
      ticket.ticketItems.filter((item) => item.status === "ISSUED").length,
    0,
  );

  const overdueCount = tickets.reduce(
    (acc, ticket) =>
      acc +
      ticket.ticketItems.filter(
        (item) => item.status === "ISSUED" && isOverdue(item.till),
      ).length,
    0,
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Currently Issued
            </h2>
            <p className="text-sm text-gray-500">
              {issuedItemsCount} item(s) issued
              {overdueCount > 0 && (
                <span className="text-red-600 font-medium">
                  {" "}
                  • {overdueCount} overdue
                </span>
              )}
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
            className="mx-auto h-10 w-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-2 text-sm">No items currently issued.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tickets.map((ticket) =>
            ticket.ticketItems
              .filter((item) => item.status === "ISSUED")
              .map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isOverdue(item.till)
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {item.resource.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        × {item.quantity}
                      </span>
                      {isOverdue(item.till) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Issued to: {ticket.requestedUser.name} (
                      {ticket.requestedUser.rollNumber ||
                        ticket.requestedUser.email}
                      )
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {formatDateShort(item.till)}
                      {item.issuedAt && (
                        <span> • Issued: {formatDateShort(item.issuedAt)}</span>
                      )}
                    </p>
                  </div>
                  <div className="ml-3">
                    {updatingItems.has(item.id) ? (
                      <svg
                        className="animate-spin h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <button
                        onClick={() => markAsReturned(item.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700"
                      >
                        Mark Returned
                      </button>
                    )}
                  </div>
                </div>
              )),
          )}
        </div>
      )}
    </div>
  );
};

export default IssuedItemsCard;
