"use client";

import { useState } from "react";

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

interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ResourceAuthoritiesCardProps {
  authorities: ResourceAuthority[];
  users: UserSummary[];
  isLoading: Boolean;
}

const ResourceAuthoritiesCard = ({
  authorities,
  users,
  isLoading,
}: ResourceAuthoritiesCardProps) => {
  const [selectedAuthority, setSelectedAuthority] =
    useState<ResourceAuthority | null>(null);

  const closeDetails = () => setSelectedAuthority(null);

  const getOwnerDetails = (authority: ResourceAuthority) => {
    const fallbackOwner = users.find((u) => u.id === authority.ownerId);

    return {
      name: authority.ownedBy?.name || fallbackOwner?.name || "N/A",
      email: authority.ownedBy?.email || fallbackOwner?.email || "N/A",
      role: authority.ownedBy?.role || fallbackOwner?.role || "N/A",
    };
  };

  const selectedOwnerDetails = selectedAuthority
    ? getOwnerDetails(selectedAuthority)
    : null;

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
        <h2 className="text-lg font-medium text-gray-800">
          Authorities ({authorities.length})
        </h2>
      </div>
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {authorities.map((auth) => (
            <li
              key={auth.id}
              className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-red-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-sm text-gray-800">
                    {auth.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {auth.location}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAuthority(auth)}
                  className="text-xs px-2.5 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                >
                  View Details
                </button>
              </div>
              <div className="text-xs font-medium text-red-600/80 mt-1">
                {auth.department?.name}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-white text-gray-600">
                  Categories: {auth._count?.resourceCategories ?? 0}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-white text-gray-600">
                  Tickets: {auth._count?.tickets ?? 0}
                </span>
              </div>
              {auth.description && (
                <div className="text-xs text-gray-400 mt-2 truncate">
                  {auth.description}
                </div>
              )}
            </li>
          ))}
          {authorities.length === 0 && (
            <li className="text-gray-500 text-sm text-center py-4">
              No resource authorities found
            </li>
          )}
        </ul>
      )}

      {selectedAuthority && selectedOwnerDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeDetails}
            className="absolute inset-0 bg-black/40"
            aria-label="Close authority details"
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Authority Details
                </h3>
                <p className="text-sm text-gray-500">Operational information</p>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Authority Name
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedAuthority.name}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Department
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedAuthority.department?.name || "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Location
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedAuthority.location || "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Description
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedAuthority.description || "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Owner
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedOwnerDetails.name}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedOwnerDetails.email}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {selectedOwnerDetails.role !== "N/A"
                    ? selectedOwnerDetails.role.replace("_", " ")
                    : "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Resource Categories
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedAuthority._count?.resourceCategories ?? 0}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Tickets
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedAuthority._count?.tickets ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAuthoritiesCard;
