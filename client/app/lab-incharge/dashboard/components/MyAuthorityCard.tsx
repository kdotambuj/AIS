"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";

interface ResourceCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count: {
    resources: number;
  };
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
  resourceCategories: ResourceCategory[];
  _count: {
    tickets: number;
    resourceCategories: number;
  };
  createdAt: string;
}

const MyAuthorityCard = () => {
  const [authority, setAuthority] = useState<ResourceAuthority | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    // Wait for auth check to complete before fetching
    if (authLoading) return;

    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      setError("Please login to view your authority");
      return;
    }

    const fetchMyAuthority = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/authority/my-authority`,
          {
            credentials: "include",
          },
        );

        const data = await res.json();

        if (data.success) {
          setAuthority(data.data);
        } else {
          setError(data.message || "Failed to fetch authority");
        }
      } catch (err) {
        console.error("Failed to fetch authority:", err);
        setError("Failed to fetch authority");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyAuthority();
  }, [authLoading, isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6">
        <p>{error}</p>
      </div>
    );
  }

  if (!authority) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-6">
        <p>No resource authority has been assigned to you yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {authority.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {authority.department.name}
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Lab Incharge
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm font-medium text-gray-900">
              {authority.location}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500">Resource Categories</p>
            <p className="text-sm font-medium text-gray-900">
              {authority._count.resourceCategories}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Tickets</p>
            <p className="text-sm font-medium text-gray-900">
              {authority._count.tickets}
            </p>
          </div>
        </div>
      </div>

      {authority.description && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">{authority.description}</p>
        </div>
      )}

      {/* Resource Categories Section */}
      {authority.resourceCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Resource Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {authority.resourceCategories.map((category) => (
              <span
                key={category.id}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  category.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {category.name}
                <span className="ml-1 text-xs opacity-75">
                  ({category._count.resources})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAuthorityCard;
