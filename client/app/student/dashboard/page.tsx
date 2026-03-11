"use client";

import StudentProfileCard from "./components/StudentProfileCard";

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
      <p className="mt-2 text-gray-600 mb-6">Welcome to the Student panel</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentProfileCard />
      </div>
    </div>
  );
};

export default StudentDashboard;
