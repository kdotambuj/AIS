"use client";

import { useEffect, useState } from "react";

interface TicketItem {
  id: string;
  quantity: number;
  from: string;
  till: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "ISSUED" | "RETURNED";
  resource: {
    id: string;
    name: string;
    resourceCategory: {
      id: string;
      name: string;
    };
  };
}

interface StudentTicket {
  id: string;
  ticketStatus: "PENDING" | "APPROVED" | "REJECTED" | "RESOLVED";
  createdAt: string;
  authority: {
    id: string;
    name: string;
    location: string;
    department: {
      id: string;
      name: string;
    };
  };
  ticketItems: TicketItem[];
}

const getStatusClass = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "APPROVED":
    case "ACCEPTED":
      return "bg-blue-100 text-blue-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "ISSUED":
      return "bg-green-100 text-green-800";
    case "RETURNED":
    case "RESOLVED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StudentTicketsCard = () => {
  const [tickets, setTickets] = useState<StudentTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyTickets = async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ticket/my`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to load your ticket requests");
        return;
      }

      setTickets(data.data || []);
    } catch {
      setError("Failed to load your ticket requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            My Resource Requests
          </h2>
        </div>
        <button
          type="button"
          onClick={fetchMyTickets}
          className="text-sm px-3 py-2 border border-red-200 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">
          Loading requests...
        </div>
      ) : error ? (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No requests submitted yet.
        </div>
      ) : (
        <div className="space-y-4 max-h-112 overflow-y-auto pr-1">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="bg-gray-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {ticket.authority.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {ticket.authority.department.name} •{" "}
                    {ticket.authority.location}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(ticket.ticketStatus)}`}
                  >
                    {ticket.ticketStatus}
                  </span>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {formatDateTime(ticket.createdAt)}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100 bg-white">
                {ticket.ticketItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.resource.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Category: {item.resource.resourceCategory.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} • {formatDateTime(item.from)} →{" "}
                        {formatDateTime(item.till)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(item.status)}`}
                    >
                      {item.status}
                    </span>
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

export default StudentTicketsCard;
