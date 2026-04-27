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
    authorityId: string;
  };
}

interface ResourceAuthority {
  id: string;
  name: string;
  department: {
    id: string;
    name: string;
  };
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
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>(
    [],
  );
  const [selectedAuthorityIds, setSelectedAuthorityIds] = useState<string[]>(
    [],
  );
  const [sortBy, setSortBy] = useState<
    "name" | "status" | "quantity" | "category" | "authority" | "department"
  >("name");
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

  const authorityMap = useMemo(
    () => new Map(authorities.map((a) => [a.id, a])),
    [authorities],
  );

  const departments = useMemo(() => {
    return Array.from(
      new Map(
        authorities.map((a) => [a.department.id, a.department.name]),
      ).entries(),
    )
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [authorities]);

  useEffect(() => {
    setSelectedDepartmentIds((prev) => {
      if (prev.length) {
        return prev.filter((id) => departments.some((d) => d.id === id));
      }
      return departments.map((d) => d.id);
    });
  }, [departments]);

  const authoritiesInSelectedDepartments = useMemo(() => {
    return authorities
      .filter((a) => selectedDepartmentIds.includes(a.department.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [authorities, selectedDepartmentIds]);

  useEffect(() => {
    setSelectedAuthorityIds((prev) => {
      const allowed = new Set(
        authoritiesInSelectedDepartments.map((a) => a.id),
      );
      const retained = prev.filter((id) => allowed.has(id));
      if (retained.length) return retained;
      return authoritiesInSelectedDepartments.map((a) => a.id);
    });
  }, [authoritiesInSelectedDepartments]);

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

    if (
      selectedDepartmentIds.length === 0 ||
      selectedAuthorityIds.length === 0
    ) {
      return [];
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.model?.toLowerCase().includes(query) ||
          r.resourceCategory?.name.toLowerCase().includes(query) ||
          authorityMap
            .get(r.resourceCategory?.authorityId)
            ?.name.toLowerCase()
            .includes(query) ||
          authorityMap
            .get(r.resourceCategory?.authorityId)
            ?.department.name.toLowerCase()
            .includes(query),
      );
    }

    // Department and authority filters
    filtered = filtered.filter((r) => {
      const authority = authorityMap.get(r.resourceCategory?.authorityId);
      if (!authority) return false;

      return (
        selectedDepartmentIds.includes(authority.department.id) &&
        selectedAuthorityIds.includes(authority.id)
      );
    });

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
      } else if (sortBy === "category") {
        comparison = (a.resourceCategory?.name || "").localeCompare(
          b.resourceCategory?.name || "",
        );
      } else if (sortBy === "authority") {
        comparison = (
          authorityMap.get(a.resourceCategory?.authorityId)?.name || ""
        ).localeCompare(
          authorityMap.get(b.resourceCategory?.authorityId)?.name || "",
        );
      } else if (sortBy === "department") {
        comparison = (
          authorityMap.get(a.resourceCategory?.authorityId)?.department.name ||
          ""
        ).localeCompare(
          authorityMap.get(b.resourceCategory?.authorityId)?.department.name ||
            "",
        );
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    resources,
    searchQuery,
    statusFilter,
    categoryFilter,
    sortBy,
    sortOrder,
    selectedDepartmentIds,
    selectedAuthorityIds,
    authorityMap,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    statusFilter,
    categoryFilter,
    selectedDepartmentIds,
    selectedAuthorityIds,
    sortBy,
    sortOrder,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResources.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedResources = filteredResources.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setSelectedDepartmentIds(departments.map((d) => d.id));
    setSelectedAuthorityIds(authorities.map((a) => a.id));
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const toggleDepartment = (departmentId: string) => {
    setSelectedDepartmentIds((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId],
    );
  };

  const toggleAuthority = (authorityId: string) => {
    setSelectedAuthorityIds((prev) =>
      prev.includes(authorityId)
        ? prev.filter((id) => id !== authorityId)
        : [...prev, authorityId],
    );
  };

  const selectAllDepartments = () =>
    setSelectedDepartmentIds(departments.map((d) => d.id));
  const clearDepartments = () => setSelectedDepartmentIds([]);
  const selectAllAuthorities = () =>
    setSelectedAuthorityIds(authoritiesInSelectedDepartments.map((a) => a.id));
  const clearAuthorities = () => setSelectedAuthorityIds([]);

  const analytics = useMemo(() => {
    const totalResourceCategories = new Set(
      resources.map((r) => r.resourceCategory?.id).filter(Boolean),
    ).size;

    const filteredResourceCategories = new Set(
      filteredResources.map((r) => r.resourceCategory?.id).filter(Boolean),
    ).size;

    return {
      totalResourceCategories,
      filteredResourceCategories,
      totalResources: resources.length,
      filteredResources: filteredResources.length,
      totalResourceAuthorities: authorities.length,
      filteredResourceAuthorities: selectedAuthorityIds.length,
    };
  }, [resources, filteredResources, authorities.length, selectedAuthorityIds]);

  return (
    <div className="flex flex-col w-full">
      {/* Analytics */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Resource Analytics
            </h2>
            <p className="text-sm text-gray-500">
              Overview based on current department and authority selection
            </p>
          </div>
          <button
            onClick={fetchAllResources}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
          >
            {isLoading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Resource Categories
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {analytics.filteredResourceCategories}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              of {analytics.totalResourceCategories} overall
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Resources
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {analytics.filteredResources}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              of {analytics.totalResources} overall
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Resource Authorities
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {analytics.filteredResourceAuthorities}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              of {analytics.totalResourceAuthorities} overall
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h3 className="text-gray-700 font-medium mb-4 lg:mb-0">
          Showing {filteredResources.length} of {resources.length} items
        </h3>
        <div className="text-xs text-gray-500">
          Departments: {selectedDepartmentIds.length} • Authorities:{" "}
          {selectedAuthorityIds.length}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
        {/* Department multi-select */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-500">
              Departments
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllDepartments}
                className="text-xs px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearDepartments}
                className="text-xs px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => {
              const active = selectedDepartmentIds.includes(dept.id);
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => toggleDepartment(dept.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {active ? "✓ " : ""}
                  {dept.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Authority multi-select */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-500">
              Authorities
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllAuthorities}
                className="text-xs px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAuthorities}
                className="text-xs px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {authoritiesInSelectedDepartments.map((authority) => {
              const active = selectedAuthorityIds.includes(authority.id);
              return (
                <button
                  key={authority.id}
                  type="button"
                  onClick={() => toggleAuthority(authority.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {active ? "✓ " : ""}
                  {authority.name}
                </button>
              );
            })}
          </div>
        </div>

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
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
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
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
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
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full lg:w-48">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "name"
                    | "status"
                    | "quantity"
                    | "category"
                    | "authority"
                    | "department",
                )
              }
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="authority">Authority</option>
              <option value="department">Department</option>
              <option value="status">Status</option>
              <option value="quantity">Quantity</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Sort Order */}
          <button
            onClick={toggleSortOrder}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white hover:border-red-200 hover:text-red-700 flex items-center gap-2 transition-colors focus:ring-1 focus:ring-red-500"
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">
                    Authority
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
                      {authorityMap.get(resource.resourceCategory?.authorityId)
                        ?.department.name || "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">
                      {authorityMap.get(resource.resourceCategory?.authorityId)
                        ?.name || "-"}
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

          {/* Pagination */}
          {filteredResources.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Summary */}
          {displayedResources.length > 0 && (
            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredResources.length)} of{" "}
              {filteredResources.length} resources
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResourcesList;
