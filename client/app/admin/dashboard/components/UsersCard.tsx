"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  rollNumber?: string;
  enrollmentNumber?: string;
  createdAt?: string;
  department: {
    id: string;
    name: string;
  };
}

const UsersCard = () => {
  const DOWNLOADABLE_ROLES = ["STUDENT", "LAB_INCHARGE", "HOD"] as const;

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDownloadRoles, setSelectedDownloadRoles] = useState<
    Record<(typeof DOWNLOADABLE_ROLES)[number], boolean>
  >({
    STUDENT: true,
    LAB_INCHARGE: true,
    HOD: true,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/users`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        const fetchedUsers = data.data || [];
        setAllUsers(fetchedUsers);
        setUsers(fetchedUsers);
        setTotal(data.total || fetchedUsers.length);
      }
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const applyFilters = (queryValue: string, departmentId: string) => {
    const query = queryValue.trim().toLowerCase();

    const filtered = allUsers.filter((user) => {
      const matchesQuery =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);

      const matchesDepartment =
        departmentId === "all" || user.department?.id === departmentId;

      return matchesQuery && matchesDepartment;
    });

    setUsers(filtered);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedDepartmentId("all");
    setUsers(allUsers);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      applyFilters(searchQuery, selectedDepartmentId);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedDepartmentId, allUsers]);

  const uniqueDepartments = Array.from(
    new Map(
      allUsers
        .filter((u) => u.department?.id)
        .map((u) => [u.department.id, u.department.name]),
    ).entries(),
  ).map(([id, name]) => ({ id, name }));

  const handleCloseModal = () => setSelectedUser(null);

  const usersInSelectedDepartment =
    selectedDepartmentId === "all"
      ? allUsers
      : allUsers.filter((user) => user.department?.id === selectedDepartmentId);

  const selectedDepartmentName =
    selectedDepartmentId === "all"
      ? "All Departments"
      : uniqueDepartments.find((d) => d.id === selectedDepartmentId)?.name ||
        "Selected Department";

  const selectedRoles = DOWNLOADABLE_ROLES.filter(
    (role) => selectedDownloadRoles[role],
  );

  const escapeCsv = (value: string | number | undefined | null) => {
    const v = String(value ?? "");
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const handleDownloadUsers = async () => {
    const usersToDownload = usersInSelectedDepartment.filter((user) =>
      selectedRoles.includes(user.role as (typeof DOWNLOADABLE_ROLES)[number]),
    );

    setIsDownloading(true);
    try {
      const headers = [
        "Name",
        "Email",
        "Role",
        "Department",
        "Roll Number",
        "Enrollment Number",
      ];

      const rows = usersToDownload.map((user) => [
        escapeCsv(user.name),
        escapeCsv(user.email),
        escapeCsv(user.role),
        escapeCsv(user.department?.name || ""),
        escapeCsv(user.rollNumber || ""),
        escapeCsv(user.enrollmentNumber || ""),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `users_${selectedRoles.join("-").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            User Directory
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Search, filter, export, and inspect user profiles
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
            Showing: {users.length}
          </span>
          <span className="px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
            Total: {total}
          </span>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50/70 p-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-7 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
          <select
            value={selectedDepartmentId}
            onChange={(e) => setSelectedDepartmentId(e.target.value)}
            className="md:col-span-3 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
          >
            <option value="all">All Departments</option>
            {uniqueDepartments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          <div className="md:col-span-2">
            {(searchQuery || selectedDepartmentId !== "all") && (
              <button
                onClick={handleReset}
                className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 rounded-xl border border-gray-200 bg-gray-50/70 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-600">
            Download roles:
          </span>
          {DOWNLOADABLE_ROLES.map((role) => (
            <label
              key={role}
              className="flex items-center gap-1.5 text-xs text-gray-700 px-2 py-1 rounded-lg border border-gray-200 bg-white"
            >
              <input
                type="checkbox"
                checked={selectedDownloadRoles[role]}
                onChange={(e) =>
                  setSelectedDownloadRoles((prev) => ({
                    ...prev,
                    [role]: e.target.checked,
                  }))
                }
                className="h-3.5 w-3.5"
              />
              {role}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadUsers}
            disabled={
              isDownloading ||
              usersInSelectedDepartment.length === 0 ||
              DOWNLOADABLE_ROLES.every((role) => !selectedDownloadRoles[role])
            }
            className="text-xs px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDownloading
              ? "Downloading..."
              : `Export  (CSV)`}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Export scope: {selectedDepartmentName} • Roles selected:{" "}
        {selectedRoles.length}
      </p>

      {/* Users table */}
      <div className="flex-1 overflow-auto max-h-112 rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Roll No.</th>
              <th className="px-4 py-3 font-medium">Enrollment</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-44 rounded bg-gray-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 rounded bg-gray-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 rounded bg-gray-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="ml-auto h-8 w-16 rounded bg-gray-200" />
                  </td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {user.department?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {user.rollNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {user.enrollmentNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium border border-gray-200 rounded-md text-gray-700 bg-white hover:bg-gray-100"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="text-sm font-medium text-gray-700">
                    No users found
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Try adjusting search keywords or department filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseModal}
            aria-label="Close user modal"
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  User Profile
                </h3>
                <p className="text-sm text-gray-500">
                  Detailed user information
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Full Name
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedUser.name}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Email
                </p>
                <p className="font-medium text-gray-900 mt-1 break-all">
                  {selectedUser.email}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Role
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedUser.role}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Department
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedUser.department?.name || "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Roll Number
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedUser.rollNumber || "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Enrollment Number
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedUser.enrollmentNumber || "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  User ID
                </p>
                <p className="font-medium text-gray-900 mt-1 break-all">
                  {selectedUser.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersCard;
