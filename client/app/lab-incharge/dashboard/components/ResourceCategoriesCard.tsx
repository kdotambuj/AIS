"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";

interface Resource {
  id: string;
  name: string;
  model?: string;
  description?: string;
  quantity: number;
  status: string;
}

interface ResourceCategory {
  id: string;
  name: string;
  resources: Resource[];
}

interface ResourceAuthority {
  id: string;
  name: string;
}

const ResourceCategoriesCard = () => {
  const [authority, setAuthority] = useState<ResourceAuthority | null>(null);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setIsLoading(false);
      setError("Please login to view resource categories");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // First fetch authority
        const authorityRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/authority/my-authority`,
          {
            credentials: "include",
          },
        );

        const authorityData = await authorityRes.json();

        if (!authorityData.success) {
          setError(authorityData.message || "Failed to fetch authority");
          return;
        }

        setAuthority(authorityData.data);

        // Then fetch categories with resources
        const categoriesRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/resource/get/${authorityData.data.id}`,
          {
            credentials: "include",
          },
        );

        const categoriesData = await categoriesRes.json();

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        } else {
          setError(categoriesData.message || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "OCCUPIED":
        return "bg-yellow-100 text-yellow-800";
      case "LOST":
        return "bg-red-100 text-red-800";
      case "UNDER_MAINTENANCE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  if (authLoading || isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Resource Categories
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            All categories in {authority.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            {categories.length}{" "}
            {categories.length === 1 ? "Category" : "Categories"}
          </span>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <p className="mt-2">No resource categories found.</p>
          <p className="text-sm">Create a category to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      expandedCategories.has(category.id) ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">
                    {category.name}
                  </span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {category.resources.length}{" "}
                  {category.resources.length === 1 ? "Resource" : "Resources"}
                </span>
              </button>

              {expandedCategories.has(category.id) && (
                <div className="p-4 bg-white border-t border-gray-200">
                  {category.resources.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No resources in this category yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {category.resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {resource.name}
                            </p>
                            {resource.model && (
                              <p className="text-xs text-gray-500">
                                Model: {resource.model}
                              </p>
                            )}
                            {resource.description && (
                              <p className="text-xs text-gray-500 truncate">
                                {resource.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <span className="text-sm text-gray-600">
                              Qty: {resource.quantity}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                                resource.status,
                              )}`}
                            >
                              {formatStatus(resource.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {categories.reduce((acc, cat) => acc + cat.resources.length, 0)}
            </p>
            <p className="text-xs text-gray-500">Total Resources</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {categories.reduce(
                (acc, cat) =>
                  acc +
                  cat.resources.reduce((sum, res) => sum + res.quantity, 0),
                0,
              )}
            </p>
            <p className="text-xs text-gray-500">Total Quantity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCategoriesCard;
