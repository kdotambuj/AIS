"use client";

import { useState, useEffect, useMemo } from "react";

interface Resource {
  id: string;
  name: string;
  description?: string;
  model?: string;
  quantity: number;
  status: string;
  resourceCategory: {
    id: string;
    name: string;
  };
}

interface ResourceAuthority {
  id: string;
  name: string;
}

interface ResourcesListProps {
  authorities: ResourceAuthority[];
}

const ITEMS_PER_PAGE = 10;

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  OCCUPIED: "bg-yellow-100 text-yellow-800",
  LOST: "bg-red-100 text-red-800",
  UNDER_MAINTENANCE: "bg-orange-100 text-orange-800",
};

const ResourcesList = ({ authorities }: ResourcesListProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "status" | "quantity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchAllResources = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resource/get`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        setResources(data.data);
      } else {
        setError(data.message || "Failed to fetch resources");
      }
    } catch (err) {
      setError("Failed to fetch resources");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllResources();
  }, []);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      resources.map((r) => r.resourceCategory?.name).filter(Boolean),
    );
    return Array.from(uniqueCategories).sort();
  }, [resources]);

  // Get unique statuses for filter
  const statuses = useMemo(() => {
    const uniqueStatuses = new Set(resources.map((r) => r.status));
    return Array.from(uniqueStatuses).sort();
  }, [resources]);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    let filtered = [...resources];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.model?.toLowerCase().includes(query) ||
          r.resourceCategory?.name.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(
        (r) => r.resourceCategory?.name === categoryFilter,
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === "quantity") {
        comparison = a.quantity - b.quantity;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [resources, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder]);

  const displayedResources = filteredResources.slice(0, displayCount);
  const hasMore = displayCount < filteredResources.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setSortBy("name");
    setSortOrder("asc");
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 col-span-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-xl font-semibold mb-4 lg:mb-0">
          Resources ({filteredResources.length} of {resources.length})
        </h2>
        <button
          onClick={fetchAllResources}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 text-sm"
        >
          {isLoading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, model, description..."
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Sort By */}
          <div className="w-full lg:w-48">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "status" | "quantity")
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="quantity">Quantity</option>
            </select>
          </div>

          {/* Sort Order */}
          <button
            onClick={toggleSortOrder}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-2"
          >
            {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>

          {/* Reset Filters */}
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Loading resources...</p>
        </div>
      ) : (
        <>
          {/* Resources Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">
                    Model
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Category
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">
                    Qty
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedResources.map((resource) => (
                  <tr
                    key={resource.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {resource.name}
                      </div>
                      {resource.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {resource.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                      {resource.model || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {resource.resourceCategory?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {resource.quantity}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded font-medium ${
                          STATUS_COLORS[resource.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {resource.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {displayedResources.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No resources found</p>
              <p className="text-sm mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Load More ({filteredResources.length - displayCount} remaining)
              </button>
            </div>
          )}

          {/* Summary */}
          {displayedResources.length > 0 && (
            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {displayedResources.length} of {filteredResources.length}{" "}
              resources
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResourcesList;
