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
  resourceId: string;
  resource: Resource;
  quantity: number;
  from: string;
  till: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "ISSUED" | "RETURNED";
  approvedAt?: string;
  issuedAt?: string;
  returnedAt?: string;
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

const TicketListCard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(
    new Set(),
  );
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
        setTickets(data.data);
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
      setError("Please login to view tickets");
      return;
    }

    fetchTickets();
  }, [authLoading, isAuthenticated]);

  const toggleTicket = (ticketId: string) => {
    setExpandedTickets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const updateItemStatus = async (
    ticketItemId: string,
    status: "ACCEPTED" | "REJECTED" | "ISSUED" | "RETURNED",
  ) => {
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
            status,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        // Refresh tickets
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "ISSUED":
        return "bg-green-100 text-green-800";
      case "RETURNED":
        return "bg-purple-100 text-purple-800";
      case "RESOLVED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">All Tickets</h2>
        <button
          onClick={fetchTickets}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <svg
            className="w-4 h-4"
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
          <span>Refresh</span>
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
          <p className="mt-2">No tickets found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Ticket Header */}
              <button
                onClick={() => toggleTicket(ticket.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      expandedTickets.has(ticket.id) ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {ticket.requestedUser.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {ticket.requestedUser.rollNumber ||
                        ticket.requestedUser.email}{" "}
                      • {ticket.requestedUser.department.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">
                    {formatDate(ticket.createdAt)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      ticket.ticketStatus,
                    )}`}
                  >
                    {ticket.ticketStatus}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {ticket.ticketItems.length} item(s)
                  </span>
                </div>
              </button>

              {/* Ticket Items */}
              {expandedTickets.has(ticket.id) && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="space-y-3">
                    {ticket.ticketItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {item.resource.name}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                                item.status,
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>
                          {item.resource.model && (
                            <p className="text-xs text-gray-500">
                              Model: {item.resource.model}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Category: {item.resource.resourceCategory.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Qty:</span>{" "}
                            {item.quantity} •{" "}
                            <span className="font-medium">From:</span>{" "}
                            {formatDateShort(item.from)} •{" "}
                            <span className="font-medium">Till:</span>{" "}
                            {formatDateShort(item.till)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          {item.status === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  updateItemStatus(item.id, "ACCEPTED")
                                }
                                disabled={updatingItems.has(item.id)}
                                className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  updateItemStatus(item.id, "REJECTED")
                                }
                                disabled={updatingItems.has(item.id)}
                                className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {item.status === "ACCEPTED" && (
                            <button
                              onClick={() =>
                                updateItemStatus(item.id, "ISSUED")
                              }
                              disabled={updatingItems.has(item.id)}
                              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              Mark Issued
                            </button>
                          )}
                          {item.status === "ISSUED" && (
                            <button
                              onClick={() =>
                                updateItemStatus(item.id, "RETURNED")
                              }
                              disabled={updatingItems.has(item.id)}
                              className="px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
                            >
                              Mark Returned
                            </button>
                          )}
                          {updatingItems.has(item.id) && (
                            <svg
                              className="animate-spin h-4 w-4 text-gray-500"
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
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketListCard;
