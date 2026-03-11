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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Delete Department</h2>
      <div className="space-y-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Select department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleDelete}
          disabled={isLoading || !selectedId}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default DeleteDepartmentCard;
