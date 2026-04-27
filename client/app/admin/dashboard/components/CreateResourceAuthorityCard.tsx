"use client";

import { useState } from "react";

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CreateResourceAuthorityCardProps {
  departments: Department[];
  users: User[];
  onAuthorityCreated: () => void;
}

const CreateResourceAuthorityCard = ({
  departments,
  users,
  onAuthorityCreated,
}: CreateResourceAuthorityCardProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentId: "",
    location: "",
    ownerId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter users who can be owners (LAB_INCHARGE or HOD)
  const eligibleOwners = users.filter(
    (user) => user.role === "LAB_INCHARGE" || user.role === "HOD",
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.description ||
      !formData.departmentId ||
      !formData.location ||
      !formData.ownerId
    ) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/authority/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (data.success) {
        setFormData({
          name: "",
          description: "",
          departmentId: "",
          location: "",
          ownerId: "",
        });
        setSuccess("Resource Authority created successfully");
        onAuthorityCreated();
      } else {
        setError(data.message || "Failed to create resource authority");
      }
    } catch (err) {
      setError("Failed to create resource authority");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <h3 className="font-medium text-gray-700">Authority Setup</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Authority Name (e.g., Physics Lab)"
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
        />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location (e.g., Building A, Room 101)"
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          rows={2}
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
        />
        <select
          name="departmentId"
          value={formData.departmentId}
          onChange={handleChange}
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <select
          name="ownerId"
          value={formData.ownerId}
          onChange={handleChange}
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
        >
          <option value="">Select Owner (Lab Incharge/HOD)</option>
          {eligibleOwners.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role.replace("_", " ")})
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {success && <p className="text-green-500 text-xs">{success}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Creating..." : "Create Authority"}
        </button>
      </form>
    </div>
  );
};

export default CreateResourceAuthorityCard;
