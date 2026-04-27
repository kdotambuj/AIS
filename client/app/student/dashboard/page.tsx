"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import StudentProfileCard from "./components/StudentProfileCard";
import StudentResourceRequestCard from "./components/StudentResourceRequestCard";
import StudentTicketsCard from "./components/StudentTicketsCard";

type StudentSection = "Overview" | "Find Resource" | "Profile" | "Tickets";

const SIDEBAR_ITEMS: {
  key: StudentSection;
  title: string;
}[] = [
  {
    key: "Overview",
    title: "Overview",
  },
  {
    key: "Find Resource",
    title: "Find Resource",
  },
  {
    key: "Profile",
    title: "Profile",
  },
  {
    key: "Tickets",
    title: "My Tickets",
  },
];

const StudentDashboard = () => {
  const [activeSection, setActiveSection] =
    useState<StudentSection>("Overview");
  const { name } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <aside className="fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 shadow-lg z-40">
        <div className="h-full flex flex-col">
          <div className="px-4 py-5 border-b border-gray-100 bg-linear-to-r from-red-50 to-white">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-red-600 uppercase">
              Hi {name || "Student"}
            </p>
            <h2 className="text-base font-semibold text-gray-900 mt-1">
              Student Dashboard
            </h2>
          </div>

          <div className="px-3 py-4">
            <nav className="space-y-1.5">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                    activeSection === item.key
                      ? "bg-red-50 border-red-200 text-red-700 shadow-sm"
                      : "bg-white border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <div className="text-sm font-medium leading-5">
                    {item.title}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      <div className="ml-60 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8 p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-5">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Student Dashboard
            </h1>
            <span className="text-sm font-medium text-gray-500">
              {activeSection}
            </span>
          </div>

          {activeSection === "Overview" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <h2 className="text-xl font-semibold text-gray-900">Welcome</h2>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection("Find Resource")}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Find Resource
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("Tickets")}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View My Tickets
                  </button>
                </div>
              </div>

              <StudentProfileCard />
            </div>
          )}

          {activeSection === "Find Resource" && (
            <StudentResourceRequestCard minimalMode />
          )}

          {activeSection === "Profile" && <StudentProfileCard />}

          {activeSection === "Tickets" && <StudentTicketsCard />}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
