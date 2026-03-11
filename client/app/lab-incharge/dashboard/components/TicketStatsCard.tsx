"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";

interface TicketStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  resolved: number;
}

const TicketStatsCard = () => {
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    resolved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setIsLoading(false);
      setError("Please login to view ticket stats");
      return;
    }

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
          const tickets = data.data;
          setStats({
            total: tickets.length,
            pending: tickets.filter((t: any) => t.ticketStatus === "PENDING")
              .length,
            approved: tickets.filter((t: any) => t.ticketStatus === "APPROVED")
              .length,
            rejected: tickets.filter((t: any) => t.ticketStatus === "REJECTED")
              .length,
            resolved: tickets.filter((t: any) => t.ticketStatus === "RESOLVED")
              .length,
          });
        } else {
          setError(data.message || "Failed to fetch ticket stats");
        }
      } catch (err) {
        console.error("Failed to fetch ticket stats:", err);
        setError("Failed to fetch ticket stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [authLoading, isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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

  const statItems = [
    {
      label: "Total Tickets",
      value: stats.total,
      color: "bg-blue-100 text-blue-800",
      iconBg: "bg-blue-500",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "bg-yellow-100 text-yellow-800",
      iconBg: "bg-yellow-500",
    },
    {
      label: "Approved",
      value: stats.approved,
      color: "bg-green-100 text-green-800",
      iconBg: "bg-green-500",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      color: "bg-purple-100 text-purple-800",
      iconBg: "bg-purple-500",
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Ticket Statistics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={`${item.color} rounded-lg p-4 text-center`}
          >
            <p className="text-3xl font-bold">{item.value}</p>
            <p className="text-sm font-medium mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketStatsCard;
