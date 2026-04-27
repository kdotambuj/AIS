"use client";

import Link from "next/link";
import { useState } from "react";
import StudentResourceRequestCard from "../dashboard/components/StudentResourceRequestCard";

const BookResourceTicketPage = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-red-600 uppercase">
              AIS Panel
            </p>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mt-1">
              Book Resource Ticket
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Raise your request only after finalizing all required resources.
            </p>
          </div>

          <Link
            href="/student/dashboard"
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {!isConfirmed ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900">
              Confirm before raising a ticket
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              This page is meant for the final ticket step. Please continue only
              when you have finalized all resources and timing requirements.
            </p>

            <label className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-red-800">
                I have finalized my required resources and I want to raise a
                ticket now.
              </span>
            </label>

            <p className="text-xs text-gray-500 mt-4">
              Once confirmed, the full booking form will be shown.
            </p>
          </div>
        ) : (
          <StudentResourceRequestCard />
        )}
      </div>
    </div>
  );
};

export default BookResourceTicketPage;
