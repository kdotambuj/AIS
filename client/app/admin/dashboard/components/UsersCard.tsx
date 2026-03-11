"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  rollNumber?: string;
  enrollmentNumber?: string;
  department: {
    id: string;
    name: string;
  };
}

const UsersCard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const fetchUsers = async (search?: string, all?: boolean) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (!all) params.append("limit", "10");
      if (search) params.append("search", search);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/users?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setTotal(data.total);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAll(false);
    fetchUsers(searchQuery, false);
  };

  const handleShowAll = () => {
    setShowAll(true);
    setSearchQuery("");
    fetchUsers("", true);
  };

  const handleReset = () => {
    setShowAll(false);
    setSearchQuery("");
    fetchUsers("", false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">
          Users ({users.length}
          {total > users.length ? ` of ${total}` : ""})
        </h2>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-3">
        {!showAll && (
          <button
            onClick={handleShowAll}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Show All Users
          </button>
        )}
        {(showAll || searchQuery) && (
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Reset
          </button>
        )}
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto max-h-64 space-y-2">
        {isLoading ? (
          <div className="text-gray-500 text-center py-4">Loading...</div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="p-2 bg-gray-50 rounded border border-gray-200 text-sm"
            >
              <div className="font-medium truncate">{user.name}</div>
              <div className="text-xs text-gray-600 truncate">{user.email}</div>
              <div className="text-xs text-gray-500">
                {user.role} • {user.department?.name || "No dept"}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-4">No users found</div>
        )}
      </div>
    </div>
  );
};

export default UsersCard;
