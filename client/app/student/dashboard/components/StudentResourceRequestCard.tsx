"use client";

import { useEffect, useMemo, useState, Fragment } from "react";

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
  location: string;
  department: {
    id: string;
    name: string;
  };
}

interface AvailabilityItem {
  resourceId: string;
  authorityId: string;
  totalQuantity: number;
  blockedQuantity: number;
  availableQuantity: number;
}

interface StudentProfile {
  id: string;
  rollNumber: string | null;
  enrollmentNumber: string | null;
}

const TIME_SLOTS = [
  { key: "08-10", label: "08:00 - 10:00", startHour: 8, endHour: 10 },
  { key: "10-12", label: "10:00 - 12:00", startHour: 10, endHour: 12 },
  { key: "12-14", label: "12:00 - 14:00", startHour: 12, endHour: 14 },
  { key: "14-16", label: "14:00 - 16:00", startHour: 14, endHour: 16 },
  { key: "16-18", label: "16:00 - 18:00", startHour: 16, endHour: 18 },
] as const;

interface StudentResourceRequestCardProps {
  minimalMode?: boolean;
}

const StudentResourceRequestCard = ({
  minimalMode = false,
}: StudentResourceRequestCardProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [authorities, setAuthorities] = useState<ResourceAuthority[]>([]);
  const [availability, setAvailability] = useState<
    Record<string, AvailabilityItem>
  >({});
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [slotError, setSlotError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [authorityFilter, setAuthorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [requestDate, setRequestDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  const [selectedSlotKeys, setSelectedSlotKeys] = useState<string[]>([]);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const authorityMap = useMemo(
    () => new Map(authorities.map((authority) => [authority.id, authority])),
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

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        resources
          .map((resource) => resource.resourceCategory?.name)
          .filter(Boolean),
      ),
    ).sort();
  }, [resources]);

  const matchedCategoryOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories.filter((category) => {
      if (!query) return true;
      return category.toLowerCase().includes(query);
    });
  }, [categories, searchQuery]);

  const authoritiesForDepartment = useMemo(() => {
    const base =
      departmentFilter === "all"
        ? authorities
        : authorities.filter(
            (authority) => authority.department.id === departmentFilter,
          );

    return [...base].sort((a, b) => a.name.localeCompare(b.name));
  }, [authorities, departmentFilter]);

  useEffect(() => {
    if (
      authorityFilter !== "all" &&
      !authoritiesForDepartment.some(
        (authority) => authority.id === authorityFilter,
      )
    ) {
      setAuthorityFilter("all");
    }
  }, [authorityFilter, authoritiesForDepartment]);

  const selectedSlots = useMemo(() => {
    return TIME_SLOTS.filter((slot) =>
      selectedSlotKeys.includes(slot.key),
    ).sort((a, b) => a.startHour - b.startHour);
  }, [selectedSlotKeys]);

  const requestWindow = useMemo(() => {
    if (!requestDate || selectedSlots.length === 0) {
      return null;
    }

    const first = selectedSlots[0];
    const last = selectedSlots[selectedSlots.length - 1];

    const from = new Date(`${requestDate}T00:00:00`);
    from.setHours(first.startHour, 0, 0, 0);

    const till = new Date(`${requestDate}T00:00:00`);
    till.setHours(last.endHour, 0, 0, 0);

    return {
      from,
      till,
      fromIso: from.toISOString(),
      tillIso: till.toISOString(),
    };
  }, [requestDate, selectedSlots]);

  const filteredResources = useMemo(() => {
    if (minimalMode) {
      if (!selectedCategoryName) {
        return [];
      }

      const byCategory = resources.filter(
        (resource) => resource.resourceCategory.name === selectedCategoryName,
      );

      if (!requestWindow) {
        return byCategory;
      }

      return byCategory.filter((resource) => {
        const availableQuantity =
          availability[resource.id]?.availableQuantity ?? 0;
        return availableQuantity > 0;
      });
    }

    const query = searchQuery.trim().toLowerCase();

    return resources.filter((resource) => {
      const authority = authorityMap.get(resource.resourceCategory.authorityId);

      if (!authority) return false;

      const matchesQuery =
        !query ||
        resource.name.toLowerCase().includes(query) ||
        resource.model?.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.resourceCategory.name.toLowerCase().includes(query) ||
        authority.name.toLowerCase().includes(query) ||
        authority.department.name.toLowerCase().includes(query);

      const matchesDepartment = minimalMode
        ? true
        : departmentFilter === "all" ||
          authority.department.id === departmentFilter;

      const matchesAuthority = minimalMode
        ? true
        : authorityFilter === "all" || authority.id === authorityFilter;

      const matchesCategory = minimalMode
        ? true
        : categoryFilter === "all" ||
          resource.resourceCategory.name === categoryFilter;

      return (
        matchesQuery && matchesDepartment && matchesAuthority && matchesCategory
      );
    });
  }, [
    resources,
    minimalMode,
    selectedCategoryName,
    requestWindow,
    availability,
    authorityMap,
    searchQuery,
    departmentFilter,
    authorityFilter,
    categoryFilter,
  ]);

  const groupedResources = useMemo(() => {
    const groups: Record<string, Resource[]> = {};
    filteredResources.forEach((resource) => {
      const name = resource.name || "Unnamed Resource";
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(resource);
    });
    return groups;
  }, [filteredResources]);

  const hasStudentIdentity = Boolean(
    profile?.rollNumber && profile?.enrollmentNumber,
  );

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, quantity]) => quantity > 0)
      .map(([resourceId, quantity]) => {
        const resource = resources.find((r) => r.id === resourceId);
        if (!resource) return null;

        const authority = authorityMap.get(
          resource.resourceCategory.authorityId,
        );

        return {
          resourceId,
          quantity,
          resource,
          authority,
        };
      })
      .filter(Boolean) as Array<{
      resourceId: string;
      quantity: number;
      resource: Resource;
      authority?: ResourceAuthority;
    }>;
  }, [cart, resources, authorityMap]);

  const hasSlotWindow = Boolean(requestWindow) && !slotError;
  const hasCategorySelection = Boolean(selectedCategoryName);

  const minimalFlowStep = !hasSlotWindow ? 1 : !hasCategorySelection ? 2 : 3;

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [resourceRes, authorityRes, profileRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resource/get`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/authority/authorities`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`, {
          credentials: "include",
        }),
      ]);

      const [resourceData, authorityData, profileData] = await Promise.all([
        resourceRes.json(),
        authorityRes.json(),
        profileRes.json(),
      ]);

      if (resourceData.success) {
        setResources(resourceData.data || []);
      }

      if (authorityData.success) {
        setAuthorities(authorityData.data || []);
      }

      if (profileData.success) {
        setProfile(profileData.data);
      }

      if (
        !resourceData.success ||
        !authorityData.success ||
        !profileData.success
      ) {
        setError("Failed to load student request data");
      }
    } catch {
      setError("Failed to load student request data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchAvailability = async () => {
    if (!requestWindow || resources.length === 0) {
      setAvailability({});
      return;
    }

    try {
      setIsCheckingAvailability(true);
      const resourceIds = resources.map((resource) => resource.id).join(",");
      const query = new URLSearchParams({
        from: requestWindow.fromIso,
        till: requestWindow.tillIso,
        resourceIds,
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ticket/resource-availability?${query.toString()}`,
        {
          credentials: "include",
        },
      );

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to fetch availability");
        return;
      }

      const availabilityMap = (data.data || []).reduce(
        (acc: Record<string, AvailabilityItem>, item: AvailabilityItem) => {
          acc[item.resourceId] = item;
          return acc;
        },
        {},
      );

      setAvailability(availabilityMap);
    } catch {
      setError("Failed to fetch availability");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [requestWindow?.fromIso, requestWindow?.tillIso, resources.length]);

  useEffect(() => {
    if (!requestWindow) return;

    const intervalId = setInterval(() => {
      fetchAvailability();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [requestWindow?.fromIso, requestWindow?.tillIso, resources.length]);

  const isContinuousSelection = (slotKeys: string[]) => {
    if (slotKeys.length <= 1) return true;

    const sortedIndexes = slotKeys
      .map((key) => TIME_SLOTS.findIndex((slot) => slot.key === key))
      .sort((a, b) => a - b);

    for (let i = 1; i < sortedIndexes.length; i++) {
      if (sortedIndexes[i] - sortedIndexes[i - 1] !== 1) {
        return false;
      }
    }

    return true;
  };

  const handleToggleSlot = (slotKey: string) => {
    setSubmitMessage("");

    setSelectedSlotKeys((prev) => {
      const exists = prev.includes(slotKey);
      const next = exists
        ? prev.filter((key) => key !== slotKey)
        : [...prev, slotKey];

      if (!isContinuousSelection(next)) {
        setSlotError("Please select continuous 2-hour slots only.");
        return prev;
      }

      setSlotError("");
      return next;
    });
  };

  const getEffectiveAvailableQuantity = (resource: Resource) => {
    if (!requestWindow) return 0;
    return availability[resource.id]?.availableQuantity ?? 0;
  };

  const handleQuantityChange = (resource: Resource, quantity: number) => {
    if (!requestWindow) {
      setError("Please select date and time slots first");
      return;
    }

    const availableQuantity = getEffectiveAvailableQuantity(resource);
    const nextQuantity = Math.max(0, Math.min(quantity, availableQuantity));

    setCart((prev) => {
      const next = { ...prev };
      if (nextQuantity === 0) {
        delete next[resource.id];
      } else {
        next[resource.id] = nextQuantity;
      }
      return next;
    });
  };

  const clearCart = () => setCart({});

  const handleSubmitRequest = async () => {
    setError("");
    setSubmitMessage("");

    if (!hasStudentIdentity) {
      setError("Please complete your roll number and enrollment number first.");
      return;
    }

    if (!requestWindow) {
      setError("Please select at least one valid time slot.");
      return;
    }

    if (!isContinuousSelection(selectedSlotKeys)) {
      setError("Selected slots must be continuous.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Please add at least one resource to request.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        from: requestWindow.fromIso,
        till: requestWindow.tillIso,
        ticketItems: cartItems.map((item) => ({
          resourceId: item.resourceId,
          quantity: item.quantity,
        })),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ticket/create-batch`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to submit ticket request");
        return;
      }

      setSubmitMessage(
        `Request submitted successfully. ${data.data?.createdTicketCount || 0} ticket(s) created.`,
      );
      clearCart();
      await fetchAvailability();
    } catch {
      setError("Failed to submit ticket request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {minimalMode ? "Find Resource" : "Resource Request"}
          </h2>
        </div>
        <button
          type="button"
          onClick={fetchInitialData}
          className="text-sm px-3 py-2 border border-red-200 bg-red-50 rounded-lg text-red-700 hover:bg-red-100 transition-colors"
        >
          Refresh
        </button>
      </div>

      {minimalMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 1, title: "Select Date & Slots" },
            { id: 2, title: "Choose Category" },
            { id: 3, title: "Add Resources & Raise" },
          ].map((step) => {
            const isDone = minimalFlowStep > step.id;
            const isActive = minimalFlowStep === step.id;

            return (
              <div
                key={step.id}
                className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  isDone
                    ? "border-green-200 bg-green-50 text-green-800"
                    : isActive
                      ? "border-red-200 bg-red-50 text-red-800"
                      : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider">
                  Step {step.id}
                </p>
                <p className="font-medium mt-0.5">{step.title}</p>
              </div>
            );
          })}
        </div>
      )}

      {!hasStudentIdentity && (
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm">
          Please complete roll number and enrollment number in your profile to
          request resources.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {submitMessage && (
        <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
          {submitMessage}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Request Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={requestDate}
              onChange={(e) => {
                setRequestDate(e.target.value);
                setSubmitMessage("");
              }}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Time Slots
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => {
                const active = selectedSlotKeys.includes(slot.key);
                return (
                  <button
                    key={slot.key}
                    type="button"
                    onClick={() => handleToggleSlot(slot.key)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      active
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {active ? "✓ " : ""}
                    {slot.label}
                  </button>
                );
              })}
            </div>
            {slotError && (
              <p className="text-xs text-red-600 mt-1">{slotError}</p>
            )}
          </div>
        </div>

        {requestWindow && (
          <p className="text-xs text-gray-600">
            {requestWindow.from.toLocaleString()} →{" "}
            {requestWindow.till.toLocaleString()}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
        {minimalMode ? (
          <div className="space-y-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resource category (e.g. Projector, Multimeter)..."
              disabled={!hasSlotWindow}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />

            {!hasSlotWindow && (
              <p className="text-xs text-amber-700">
                Select date and continuous slots first to continue.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {matchedCategoryOptions.slice(0, 12).map((category) => {
                const active = selectedCategoryName === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryName(category);
                      setSubmitMessage("");
                    }}
                    disabled={!hasSlotWindow}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      active
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {selectedCategoryName && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-xs text-red-800">{selectedCategoryName}</p>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryName(null)}
                  className="text-xs text-red-700 hover:text-red-900 font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resource, authority, category..."
              className="md:col-span-2 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="all">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <select
              value={authorityFilter}
              onChange={(e) => setAuthorityFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="all">All Authorities</option>
              {authoritiesForDepartment.map((authority) => (
                <option key={authority.id} value={authority.id}>
                  {authority.name}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {minimalMode ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Available Resources
            </h3>
            {isCheckingAvailability && (
              <p className="text-xs text-gray-500">Checking availability...</p>
            )}
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Loading resources...
            </p>
          ) : filteredResources.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              {selectedCategoryName
                ? hasSlotWindow
                  ? "No available resources found for this category in selected slots."
                  : "Select slots to check availability for this category."
                : "Search and select a resource category to view resources."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(groupedResources).map(([groupName, groupItems]) => {
                const isExpanded = expandedGroups[groupName];
                const totalAvailable = groupItems.reduce(
                  (acc, r) => acc + getEffectiveAvailableQuantity(r),
                  0,
                );

                return (
                  <div
                    key={groupName}
                    className="rounded-xl border border-gray-200 p-3 bg-gray-50/40"
                  >
                    <div
                      className="flex items-center justify-between gap-2 cursor-pointer"
                      onClick={() => toggleGroup(groupName)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {groupName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {groupItems.length} model{groupItems.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            totalAvailable > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          Avl: {requestWindow ? totalAvailable : "-"}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 pt-3 border-t border-gray-200">
                        {groupItems.map((resource) => {
                          const authority = authorityMap.get(
                            resource.resourceCategory.authorityId,
                          );
                          const availableQuantity =
                            getEffectiveAvailableQuantity(resource);
                          const selectedQuantity = cart[resource.id] || 0;
                          const disabled =
                            !requestWindow || availableQuantity <= 0;

                          return (
                            <div
                              key={resource.id}
                              className="rounded-lg border border-gray-100 p-2.5 bg-white flex flex-col gap-2"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-sm text-gray-800">
                                    {resource.model || "Standard Version"}
                                  </p>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    {authority?.name || "N/A"}
                                  </p>
                                  {resource.description && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                      {resource.description}
                                    </p>
                                  )}
                                </div>
                                <span className="text-xs font-medium text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                                  Avl: {requestWindow ? availableQuantity : "-"}
                                </span>
                              </div>
                              <div className="flex items-center justify-end">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={disabled || selectedQuantity <= 0}
                                    onClick={() =>
                                      handleQuantityChange(
                                        resource,
                                        selectedQuantity - 1,
                                      )
                                    }
                                    className="h-7 w-7 rounded border border-gray-200 text-gray-700 disabled:opacity-40"
                                  >
                                    -
                                  </button>
                                  <span className="min-w-6 text-center text-sm">
                                    {selectedQuantity}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={
                                      disabled ||
                                      selectedQuantity >= availableQuantity
                                    }
                                    onClick={() =>
                                      handleQuantityChange(
                                        resource,
                                        selectedQuantity + 1,
                                      )
                                    }
                                    className="h-7 w-7 rounded border border-gray-200 text-gray-700 disabled:opacity-40"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto max-h-112">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-medium">Resource</th>
                  {!minimalMode && (
                    <th className="px-4 py-3 font-medium">Category</th>
                  )}
                  {!minimalMode && (
                    <th className="px-4 py-3 font-medium">Authority</th>
                  )}
                  {!minimalMode && (
                    <th className="px-4 py-3 font-medium">Department</th>
                  )}
                  <th className="px-4 py-3 font-medium text-center">
                    Available
                  </th>
                  <th className="px-4 py-3 font-medium text-center">
                    Request Qty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      Loading resources...
                    </td>
                  </tr>
                ) : filteredResources.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No resources found for current filters.
                    </td>
                  </tr>
                ) : (
                  Object.entries(groupedResources).map(([groupName, groupItems]) => {
                    const isExpanded = expandedGroups[groupName];
                    const totalAvailable = groupItems.reduce(
                      (acc, r) => acc + getEffectiveAvailableQuantity(r),
                      0,
                    );
                    
                    return (
                      <Fragment key={groupName}>
                        <tr
                          className="hover:bg-gray-50 items-center cursor-pointer bg-gray-50/60 border-t border-gray-100"
                          onClick={() => toggleGroup(groupName)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-[10px]">
                                {isExpanded ? "▼" : "▶"}
                              </span>
                              <p className="font-medium text-gray-900">
                                {groupName}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 ml-4">
                              {groupItems.length} model{groupItems.length > 1 ? "s" : ""}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs italic" colSpan={3}>
                            {isExpanded ? "" : "Click to view models"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {requestWindow ? (
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                                  totalAvailable > 0
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {isCheckingAvailability ? "..." : totalAvailable}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Select slot</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-400">
                            -
                          </td>
                        </tr>
                        {isExpanded &&
                          groupItems.map((resource) => {
                            const authority = authorityMap.get(
                              resource.resourceCategory.authorityId,
                            );
                            const availableQuantity =
                              getEffectiveAvailableQuantity(resource);
                            const selectedQuantity = cart[resource.id] || 0;
                            const disabled =
                              !requestWindow || availableQuantity <= 0;

                            return (
                              <tr key={resource.id} className="hover:bg-gray-50 bg-white">
                                <td className="px-4 py-3 pl-8">
                                  <p className="font-medium text-sm text-gray-800">
                                    {resource.model || "Standard Version"}
                                  </p>
                                  {resource.description && (
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                      {resource.description}
                                    </p>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {resource.resourceCategory.name}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {authority?.name || "N/A"}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {authority?.department.name || "N/A"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {requestWindow ? (
                                    <span
                                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                                        availableQuantity > 0
                                          ? "bg-green-50 text-green-700"
                                          : "bg-red-50 text-red-700"
                                      }`}
                                    >
                                      {availableQuantity}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">
                                      Select slot
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      disabled={disabled || selectedQuantity <= 0}
                                      onClick={() =>
                                        handleQuantityChange(
                                          resource,
                                          selectedQuantity - 1,
                                        )
                                      }
                                      className="h-7 w-7 rounded border border-gray-200 text-gray-700 disabled:opacity-40"
                                    >
                                      -
                                    </button>
                                    <span className="min-w-6 text-center text-sm">
                                      {selectedQuantity}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={
                                        disabled ||
                                        selectedQuantity >= availableQuantity
                                      }
                                      onClick={() =>
                                        handleQuantityChange(
                                          resource,
                                          selectedQuantity + 1,
                                        )
                                      }
                                      className="h-7 w-7 rounded border border-gray-200 text-gray-700 disabled:opacity-40"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Selected Items ({cartItems.length})
          </h3>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs px-3 py-1.5 border border-gray-200 bg-white rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear Selection
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-xs text-gray-500">No items selected.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {cartItems.map((item) => (
              <div
                key={item.resourceId}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {item.resource.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.authority?.name || "Unknown authority"} •{" "}
                    {item.authority?.department.name || "N/A"}
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  Qty: {item.quantity}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmitRequest}
          disabled={
            isSubmitting ||
            cartItems.length === 0 ||
            !requestWindow ||
            Boolean(slotError) ||
            !hasStudentIdentity
          }
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Submitting Request..."
            : minimalMode
              ? "Final Raise Ticket"
              : "Submit Resource Request"}
        </button>
      </div>
    </div>
  );
};

export default StudentResourceRequestCard;
