"use client";

import { useEffect, useState } from "react";
import UsersCard from "./components/UsersCard";
import DepartmentCard from "./components/DepartmentCard";
import CreateDepartmentCard from "./components/CreateDepartmentCard";
import DeleteDepartmentCard from "./components/DeleteDepartmentCard";
import CreateUserCard from "./components/CreateUserCard";
import BulkUploadUsersCard from "./components/BulkUploadUsersCard";
import ResourceAuthoritiesCard from "./components/ResourceAuthoritiesCard";
import CreateResourceAuthorityCard from "./components/CreateResourceAuthorityCard";
import ResourcesList from "./components/ResourcesList";

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

interface Department {
  id: string;
  name: string;
}

interface ResourceAuthority {
  id: string;
  name: string;
  location: string;
  description?: string;
  department: {
    id: string;
    name: string;
  };
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [authorities, setAuthorities] = useState<ResourceAuthority[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/department/get`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data);
      } else {
        setError(data.message || "Failed to fetch departments");
      }
    } catch (err) {
      setError("Failed to fetch departments");
    }
  };

  const fetchUsers = async () => {
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
        setUsers(data.data);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const fetchAuthorities = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/authority/authorities`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        setAuthorities(data.data);
      } else {
        setError(data.message || "Failed to fetch authorities");
      }
    } catch (err) {
      setError("Failed to fetch authorities");
    }
  };

  const fetchData = async () => {
    setError("");
    setIsLoading(true);
    try {
      await Promise.all([fetchDepartments(), fetchUsers(), fetchAuthorities()]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Department Section */}
          <DepartmentCard departments={departments} isLoading={isLoading} />
          <CreateDepartmentCard onDepartmentCreated={fetchDepartments} />
          <DeleteDepartmentCard
            departments={departments}
            onDepartmentDeleted={fetchDepartments}
          />

          {/* Users Section */}
          <UsersCard />
          <CreateUserCard departments={departments} onUserCreated={() => {}} />
          <BulkUploadUsersCard
            departments={departments}
            onUsersCreated={fetchUsers}
          />

          {/* Resource Authorities Section */}
          <ResourceAuthoritiesCard
            authorities={authorities}
            isLoading={isLoading}
          />
          <CreateResourceAuthorityCard
            departments={departments}
            users={users}
            onAuthorityCreated={fetchAuthorities}
          />

          {/* Resources List - Full Width */}
          <ResourcesList authorities={authorities} />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
