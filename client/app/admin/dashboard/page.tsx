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
import OverviewKPIs from "./components/OverviewKPIs";
import TicketsCard from "./components/TicketsCard";
import DepartmentInsightsPanel from "./components/DepartmentInsightsPanel";

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
  ownerId: string;
  department: {
    id: string;
    name: string;
  };
  ownedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  _count: {
    resourceCategories: number;
    tickets: number;
  };
}

type AdminSection =
  | "Overview"
  | "Departments"
  | "Users"
  | "Resources"
  | "Tickets";

const SIDEBAR_ITEMS: {
  key: AdminSection;
  title: string;
  subtitle: string;
}[] = [
  {
    key: "Overview",
    title: "Overview",
    subtitle: "KPIs and summary",
  },
  {
    key: "Departments",
    title: "Departments",
    subtitle: "Manage academic units",
  },
  {
    key: "Users",
    title: "Users",
    subtitle: "Search, create, export",
  },
  {
    key: "Resources",
    title: "Resources",
    subtitle: "Authorities and inventory",
  },
  {
    key: "Tickets",
    title: "Tickets",
    subtitle: "Track requests",
  },
];

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [authorities, setAuthorities] = useState<ResourceAuthority[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("Overview");

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
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 shadow-lg z-40">
        <div className="h-full flex flex-col">
          <div className="px-4 py-5 border-b border-gray-100 bg-linear-to-r from-red-50 to-white">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-red-600 uppercase">
              AIS Panel
            </p>
            <h2 className="text-base font-semibold text-gray-900 mt-1">
              Admin Dashboard
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Control center</p>
          </div>

          <div className="px-3 py-4">
            <p className="px-2 text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-2">
              Navigation
            </p>
            <nav className="space-y-1.5">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                    activeSection === item.key
                      ? "bg-red-50 border-red-200 text-red-700 shadow-sm"
                      : "bg-white border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium leading-5">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-gray-500 leading-4">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] text-gray-500 mb-2 uppercase tracking-wide">
                Quick Stats
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-white border border-gray-100 px-2 py-1.5">
                  <p className="text-gray-500">Users</p>
                  <p className="font-semibold text-gray-800">{users.length}</p>
                </div>
                <div className="rounded-lg bg-white border border-gray-100 px-2 py-1.5">
                  <p className="text-gray-500">Depts</p>
                  <p className="font-semibold text-gray-800">
                    {departments.length}
                  </p>
                </div>
                <div className="rounded-lg bg-white border border-gray-100 px-2 py-1.5 col-span-2">
                  <p className="text-gray-500">Authorities</p>
                  <p className="font-semibold text-gray-800">
                    {authorities.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="ml-60 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8 p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-5">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Admin Dashboard
            </h1>
            <span className="text-sm font-medium text-gray-500">
              {activeSection}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-pulse text-gray-500 font-medium">
                Loading Dashboard...
              </div>
            </div>
          ) : (
            <div className="space-y-8 mt-6">
              {activeSection === "Overview" && <OverviewKPIs />}

              {activeSection === "Departments" && (
                <div className="space-y-6">
                  <DepartmentInsightsPanel
                    departments={departments}
                    users={users}
                    authorities={authorities}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <DepartmentCard
                      departments={departments}
                      isLoading={isLoading}
                    />
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
                      <CreateDepartmentCard
                        onDepartmentCreated={fetchDepartments}
                      />
                      <DeleteDepartmentCard
                        departments={departments}
                        onDepartmentDeleted={fetchDepartments}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "Users" && (
                <div className="space-y-6">
                  <UsersCard />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
                      <CreateUserCard
                        departments={departments}
                        onUserCreated={fetchUsers}
                      />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
                      <BulkUploadUsersCard
                        departments={departments}
                        onUsersCreated={fetchUsers}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "Resources" && (
                <div className="space-y-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full">
                    <h2 className="text-lg font-medium text-gray-800 border-b border-gray-100 pb-3 mb-5">
                      Resources Directory
                    </h2>
                    <ResourcesList authorities={authorities} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <ResourceAuthoritiesCard
                      authorities={authorities}
                      users={users}
                      isLoading={isLoading}
                    />

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
                      <CreateResourceAuthorityCard
                        departments={departments}
                        users={users}
                        onAuthorityCreated={fetchAuthorities}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "Tickets" && <TicketsCard />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
