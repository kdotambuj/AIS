"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import MyAuthorityCard from "./components/MyAuthorityCard";
import CreateResourceCard from "./components/CreateResourceCard";
import CreateResourceCategoryCard from "./components/CreateResourceCategoryCard";
import ResourceCategoriesCard from "./components/ResourceCategoriesCard";
import TicketStatsCard from "./components/TicketStatsCard";
import TicketListCard from "./components/TicketListCard";
import PendingTicketsCard from "./components/PendingTicketsCard";
import IssuedItemsCard from "./components/IssuedItemsCard";
import BulkUploadResourcesCard from "./components/BulkUploadResourcesCard";

type TabType = "overview" | "resources" | "tickets" | "access";

const LabInchargeDashboard = () => {
  const { name } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const sidebarItems = [
    {
      id: "overview" as TabType,
      label: "Resource Overview",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      id: "resources" as TabType,
      label: "Resources Management",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      id: "tickets" as TabType,
      label: "Tickets",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      id: "access" as TabType,
      label: "Access",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <MyAuthorityCard />
          </div>
        );
      case "resources":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CreateResourceCategoryCard />
              <CreateResourceCard />
            </div>
            <BulkUploadResourcesCard />
            <ResourceCategoriesCard />
          </div>
        );
      case "tickets":
        return (
          <div className="space-y-6">
            <TicketStatsCard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PendingTicketsCard />
              <IssuedItemsCard />
            </div>
            <TicketListCard />
          </div>
        );
      case "access":
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                <p className="mt-2 font-medium">Access Management</p>
                <p className="text-sm">
                  Manage access permissions and controls.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Lab Incharge</h1>
          <p className="text-sm text-gray-500 mt-1 truncate">
            {name || "Dashboard"}
          </p>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span
                className={
                  activeTab === item.id ? "text-blue-600" : "text-gray-400"
                }
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {name?.charAt(0)?.toUpperCase() || "L"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {name || "Lab Incharge"}
              </p>
              <p className="text-xs text-gray-500">Lab Incharge</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {sidebarItems.find((item) => item.id === activeTab)?.label ||
                "Dashboard"}
            </h1>
            <p className="mt-1 text-gray-500">
              Welcome back, {name || "Lab Incharge"}
            </p>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default LabInchargeDashboard;
