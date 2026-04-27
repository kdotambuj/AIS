"use client";

import { useEffect, useMemo, useState } from "react";

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  department: {
    id: string;
    name: string;
  };
}

interface ResourceAuthority {
  id: string;
  department: {
    id: string;
    name: string;
  };
}

interface Ticket {
  id: string;
  authorityId: string;
  ticketStatus?: "PENDING" | "APPROVED" | "REJECTED" | "RESOLVED";
}

interface Resource {
  id: string;
  resourceCategory?: {
    authorityId?: string;
  };
}

interface DepartmentInsightsPanelProps {
  departments: Department[];
  users: User[];
  authorities: ResourceAuthority[];
}

const CHART_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const DepartmentInsightsPanel = ({
  departments,
  users,
  authorities,
}: DepartmentInsightsPanelProps) => {
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>(
    [],
  );
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    setSelectedDepartmentIds((prev) =>
      prev.length ? prev : departments.map((d) => d.id),
    );
  }, [departments]);

  useEffect(() => {
    const fetchDepartmentLinkedData = async () => {
      try {
        const fetchConfig = {
          method: "GET",
          credentials: "include" as RequestCredentials,
        };

        const [ticketRes, resourceRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/ticket/get`,
            fetchConfig,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/resource/get`,
            fetchConfig,
          ),
        ]);

        const [ticketData, resourceData] = await Promise.all([
          ticketRes.json(),
          resourceRes.json(),
        ]);

        setTickets(ticketData?.success ? ticketData.data || [] : []);
        setResources(resourceData?.success ? resourceData.data || [] : []);
      } catch {
        setTickets([]);
        setResources([]);
      }
    };

    fetchDepartmentLinkedData();
  }, []);

  const authorityToDepartmentMap = useMemo(() => {
    return new Map(authorities.map((a) => [a.id, a.department?.id]));
  }, [authorities]);

  const metricsByDepartment = useMemo(() => {
    return departments.map((dept) => {
      const userCount = users.filter(
        (u) => u.department?.id === dept.id,
      ).length;
      const authorityCount = authorities.filter(
        (a) => a.department?.id === dept.id,
      ).length;
      const ticketCount = tickets.filter(
        (t) => authorityToDepartmentMap.get(t.authorityId) === dept.id,
      ).length;
      const closedTicketCount = tickets.filter(
        (t) =>
          authorityToDepartmentMap.get(t.authorityId) === dept.id &&
          (t.ticketStatus === "REJECTED" || t.ticketStatus === "RESOLVED"),
      ).length;
      const resourceCount = resources.filter((r) => {
        const authorityId = r.resourceCategory?.authorityId;
        if (!authorityId) return false;
        return authorityToDepartmentMap.get(authorityId) === dept.id;
      }).length;

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        users: userCount,
        authorities: authorityCount,
        tickets: ticketCount,
        closedTickets: closedTicketCount,
        resources: resourceCount,
        total: userCount + authorityCount + ticketCount + resourceCount,
      };
    });
  }, [
    departments,
    users,
    authorities,
    tickets,
    resources,
    authorityToDepartmentMap,
  ]);

  const selectedMetrics = useMemo(() => {
    return metricsByDepartment.filter((m) =>
      selectedDepartmentIds.includes(m.departmentId),
    );
  }, [metricsByDepartment, selectedDepartmentIds]);

  const selectedTotals = useMemo(() => {
    return selectedMetrics.reduce(
      (acc, item) => {
        acc.users += item.users;
        acc.authorities += item.authorities;
        acc.tickets += item.tickets;
        acc.closedTickets += item.closedTickets;
        acc.resources += item.resources;
        acc.total += item.total;
        return acc;
      },
      {
        users: 0,
        authorities: 0,
        tickets: 0,
        closedTickets: 0,
        resources: 0,
        total: 0,
      },
    );
  }, [selectedMetrics]);

  const totalTicketsSoFar = tickets.length;

  const pieSegments = useMemo(() => {
    const totalUsers = selectedMetrics.reduce((sum, d) => sum + d.users, 0);
    let currentAngle = 0;

    return selectedMetrics.map((item, idx) => {
      const portion = totalUsers === 0 ? 0 : (item.users / totalUsers) * 360;
      const start = currentAngle;
      const end = currentAngle + portion;
      currentAngle = end;

      return {
        ...item,
        color: CHART_COLORS[idx % CHART_COLORS.length],
        start,
        end,
      };
    });
  }, [selectedMetrics]);

  const pieBackground = useMemo(() => {
    if (!pieSegments.length || selectedTotals.users === 0) {
      return "#f3f4f6";
    }
    const gradient = pieSegments
      .map((seg) => `${seg.color} ${seg.start}deg ${seg.end}deg`)
      .join(", ");
    return `conic-gradient(${gradient})`;
  }, [pieSegments, selectedTotals.users]);

  const toggleDepartment = (departmentId: string) => {
    setSelectedDepartmentIds((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId],
    );
  };

  const selectAll = () =>
    setSelectedDepartmentIds(departments.map((d) => d.id));
  const clearAll = () => setSelectedDepartmentIds([]);

  const maxUsers = Math.max(...selectedMetrics.map((m) => m.users), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Department Analytics
          </h2>
          <p className="text-sm text-gray-500">
            Interactive overview by selected departments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => {
          const checked = selectedDepartmentIds.includes(dept.id);
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => toggleDepartment(dept.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                checked
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {checked ? "✓ " : ""}
              {dept.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Users</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {selectedTotals.users}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Tickets by Department
          </p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {selectedTotals.tickets}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Closed Tickets
          </p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {selectedTotals.closedTickets}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Total Tickets So Far
          </p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {totalTicketsSoFar}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            User Distribution
          </h3>
          <div className="flex items-center gap-6">
            <div
              className="w-44 h-44 rounded-full border border-gray-200 shrink-0"
              style={{ background: pieBackground }}
            />
            <div className="space-y-2 w-full">
              {pieSegments.map((seg) => {
                const pct = selectedTotals.users
                  ? ((seg.users / selectedTotals.users) * 100).toFixed(1)
                  : "0.0";
                return (
                  <div
                    key={seg.departmentId}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-gray-600 truncate">
                        {seg.departmentName}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800">{pct}%</span>
                  </div>
                );
              })}
              {pieSegments.length === 0 && (
                <p className="text-sm text-gray-500">
                  Select departments to view chart.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Users by Department
          </h3>
          <div className="space-y-3">
            {selectedMetrics.map((item) => {
              const width = `${(item.users / maxUsers) * 100}%`;
              return (
                <div key={item.departmentId}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.departmentName}</span>
                    <span className="font-medium text-gray-800">
                      {item.users}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width,
                        background:
                          "linear-gradient(90deg, #6b7280 0%, #111827 100%)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {selectedMetrics.length === 0 && (
              <p className="text-sm text-gray-500">No department selected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentInsightsPanel;
