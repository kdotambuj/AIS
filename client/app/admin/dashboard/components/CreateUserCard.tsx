"use client";

import { useState } from "react";

interface Department {
  id: string;
  name: string;
}

interface CreateUserCardProps {
  departments: Department[];
  onUserCreated: () => void;
}

const ROLES = ["STUDENT", "LAB_INCHARGE", "ADMIN", "HOD"] as const;

const CreateUserCard = ({
  departments,
  onUserCreated,
}: CreateUserCardProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.departmentId ||
      !formData.role
    ) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
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
          email: "",
          password: "",
          departmentId: "",
          role: "",
        });
        setSuccess("User created successfully");
        onUserCreated();
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      setError("Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <h3 className="font-medium text-gray-700">User Setup</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password (min 8 chars)"
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
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
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
        >
          <option value="">Select Role</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role.replace("_", " ")}
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
          {isLoading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
};

export default CreateUserCard;
