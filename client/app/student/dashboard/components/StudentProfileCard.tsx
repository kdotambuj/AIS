"use client";

import { useEffect, useState, useRef } from "react";
import { useAppSelector } from "@/store/hooks";

interface StudentProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  rollNumber: string | null;
  enrollmentNumber: string | null;
  profilePhoto: string | null;
  department: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

const StudentProfileCard = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth,
  );

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`,
        {
          credentials: "include",
        },
      );

      const data = await res.json();

      if (data.success) {
        setProfile(data.data);
        setRollNumber(data.data.rollNumber || "");
        setEnrollmentNumber(data.data.enrollmentNumber || "");
      } else {
        setError(data.message || "Failed to fetch profile");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setIsLoading(false);
      setError("Please login to view your profile");
      return;
    }

    fetchProfile();
  }, [authLoading, isAuthenticated]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUpdateMessage({ type: "error", text: "Please select an image file" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUpdateMessage({
        type: "error",
        text: "Image size should be less than 5MB",
      });
      return;
    }

    // TODO: Implement AWS S3 upload logic here
    // After uploading to S3, call the API with the photo URL
    setUpdateMessage({
      type: "error",
      text: "Photo upload will be available soon (AWS S3 setup pending)",
    });
  };

  const handleUpdateDetails = async () => {
    if (!rollNumber.trim() || !enrollmentNumber.trim()) {
      setUpdateMessage({
        type: "error",
        text: "Both roll number and enrollment number are required",
      });
      return;
    }

    try {
      setIsUpdating(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rollNumber: rollNumber.trim(),
            enrollmentNumber: enrollmentNumber.trim(),
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setUpdateMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setIsEditing(false);
        fetchProfile();
      } else {
        setUpdateMessage({
          type: "error",
          text: data.message || "Failed to update profile",
        });
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setUpdateMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Clear message after 3 seconds
  useEffect(() => {
    if (updateMessage) {
      const timer = setTimeout(() => setUpdateMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [updateMessage]);

  if (authLoading || isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
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

  if (!profile) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-6">
        <p>No profile data available</p>
      </div>
    );
  }

  const needsStudentDetails = !profile.rollNumber || !profile.enrollmentNumber;
  const canEditDetails = !profile.rollNumber && !profile.enrollmentNumber;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Alert for missing details */}
      {needsStudentDetails && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm text-amber-700">
              <span className="font-medium">Action required:</span> Please add
              your roll number and enrollment number to start occupying
              resources.
            </p>
            {canEditDetails && (
              <button
                onClick={() => setIsEditing(true)}
                className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-900 underline shrink-0"
              >
                Add now
              </button>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Update message */}
        {updateMessage && (
          <div
            className={`mb-4 px-4 py-2 rounded-md text-sm ${
              updateMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {updateMessage.text}
          </div>
        )}

        <div className="flex items-start gap-6">
          {/* Profile Photo */}
          <div className="relative group">
            <div
              onClick={handlePhotoClick}
              className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 cursor-pointer border-2 border-gray-200 hover:border-red-400 transition-colors"
            >
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600 text-3xl font-semibold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-xs text-gray-400 text-center mt-1">
              Click to update
            </p>
          </div>

          {/* Profile Details */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.name}
              </h2>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                {profile.role}
              </span>
            </div>

            <p className="text-gray-600 mb-3">{profile.email}</p>

            {profile.department && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium">Department:</span>{" "}
                {profile.department.name}
              </p>
            )}

            {/* Student Details Section */}
            {isEditing && canEditDetails ? (
              <div className="space-y-3 border-t pt-4 mt-4">
                <p className="text-xs text-gray-500 mb-2">
                  ⚠️ Note: Once set, roll number and enrollment number cannot be
                  changed.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="Enter your roll number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enrollment Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="Enter your enrollment number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateDetails}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:bg-red-300 transition-colors"
                  >
                    {isUpdating ? "Saving..." : "Save Details"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setRollNumber(profile.rollNumber || "");
                      setEnrollmentNumber(profile.enrollmentNumber || "");
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Roll Number
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.rollNumber || (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Enrollment Number
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.enrollmentNumber || (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </p>
                  </div>
                </div>
                {canEditDetails && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Add Details
                  </button>
                )}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4">
              Member since{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileCard;
