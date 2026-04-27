"use client";

import { useState } from "react";

interface CreateDepartmentCardProps {
  onDepartmentCreated: () => void;
}

const CreateDepartmentCard = ({
  onDepartmentCreated,
}: CreateDepartmentCardProps) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/department/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: name.trim() }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setName("");
        onDepartmentCreated();
      } else {
        setError("Failed to create department");
      }
    } catch (err:any) {
      setError("Failed to create department");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <h3 className="font-medium text-gray-700">Department Setup</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Department name"
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Creating..." : "Create Department"}
        </button>
      </form>
    </div>
  );
};

export default CreateDepartmentCard;
