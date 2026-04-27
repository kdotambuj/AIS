"use client";

import { useState } from "react";

interface Department {
  id: string;
  name: string;
}

interface DeleteDepartmentCardProps {
  departments: Department[];
  onDepartmentDeleted: () => void;
}

const DeleteDepartmentCard = ({
  departments,
  onDepartmentDeleted,
}: DeleteDepartmentCardProps) => {
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!selectedId) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/department/delete/${selectedId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        setSelectedId("");
        onDepartmentDeleted();
      } else {
        setError(data.message || "Failed to delete department");
      }
    } catch (err) {
      setError("Failed to delete department");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <h3 className="font-medium text-gray-700">Delete Department</h3>
      <div className="space-y-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
        >
          <option value="">Select department to delete</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          onClick={handleDelete}
          disabled={isLoading || !selectedId}
          className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Deleting..." : "Delete Department"}
        </button>
      </div>
    </div>
  );
};

export default DeleteDepartmentCard;
