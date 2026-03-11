"use client";

import { useState, useRef } from "react";

interface Department {
  id: string;
  name: string;
}

interface BulkUploadResult {
  success: boolean;
  row: number;
  email: string;
  name: string;
  error?: string;
}

interface BulkUploadResponse {
  created: number;
  failed: number;
  results: BulkUploadResult[];
}

interface BulkUploadUsersCardProps {
  departments: Department[];
  onUsersCreated: () => void;
}

const BulkUploadUsersCard = ({
  departments,
  onUsersCreated,
}: BulkUploadUsersCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(
    null,
  );
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/bulk-upload/template`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bulk_users_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download template");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size should be less than 10MB");
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/bulk-upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const data = await res.json();

      if (data.success) {
        setUploadResult(data.data);
        setShowResults(true);
        if (data.data.created > 0) {
          onUsersCreated();
        }
      } else {
        setError(data.message || "Failed to upload users");
      }
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Bulk Upload Users</h2>

      {/* Instructions */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">
          📋 Excel File Format Requirements
        </h3>
        <p className="text-sm text-blue-700 mb-3">
          Upload an Excel file (.xlsx or .xls) with the following columns:
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs text-blue-800 w-full">
            <thead>
              <tr className="border-b border-blue-200">
                <th className="text-left py-1 pr-4 font-semibold">Column</th>
                <th className="text-left py-1 pr-4 font-semibold">Required</th>
                <th className="text-left py-1 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-blue-100">
                <td className="py-1 pr-4 font-mono">email</td>
                <td className="py-1 pr-4 text-red-600">Yes</td>
                <td className="py-1">Valid email address</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-1 pr-4 font-mono">name</td>
                <td className="py-1 pr-4 text-red-600">Yes</td>
                <td className="py-1">Full name of the user</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-1 pr-4 font-mono">password</td>
                <td className="py-1 pr-4 text-red-600">Yes</td>
                <td className="py-1">Min 8 characters</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-1 pr-4 font-mono">role</td>
                <td className="py-1 pr-4 text-red-600">Yes</td>
                <td className="py-1">STUDENT, HOD, LAB_INCHARGE, or ADMIN</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-1 pr-4 font-mono">departmentName</td>
                <td className="py-1 pr-4 text-red-600">Yes</td>
                <td className="py-1">Must match existing department</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-1 pr-4 font-mono">rollNumber</td>
                <td className="py-1 pr-4 text-gray-500">No</td>
                <td className="py-1">Student roll number</td>
              </tr>
              <tr>
                <td className="py-1 pr-4 font-mono">enrollmentNumber</td>
                <td className="py-1 pr-4 text-gray-500">No</td>
                <td className="py-1">Student enrollment number</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Available departments */}
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs font-medium text-blue-800 mb-1">
            Available Departments:
          </p>
          <div className="flex flex-wrap gap-1">
            {departments.map((dept) => (
              <span
                key={dept.id}
                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
              >
                {dept.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={handleDownloadTemplate}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {isDownloading ? "Downloading..." : "Download Template"}
        </button>

        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          {isUploading ? "Uploading..." : "Upload Excel File"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Upload results */}
      {uploadResult && (
        <div className="border rounded-lg overflow-hidden">
          <div
            className={`px-4 py-3 ${
              uploadResult.failed === 0
                ? "bg-green-50 border-b border-green-200"
                : uploadResult.created === 0
                  ? "bg-red-50 border-b border-red-200"
                  : "bg-yellow-50 border-b border-yellow-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">
                  {uploadResult.failed === 0
                    ? "✅ Upload Successful!"
                    : uploadResult.created === 0
                      ? "❌ Upload Failed"
                      : "⚠️ Partial Success"}
                </span>
                <p className="text-sm mt-1">
                  <span className="text-green-600 font-medium">
                    {uploadResult.created} created
                  </span>
                  {" • "}
                  <span className="text-red-600 font-medium">
                    {uploadResult.failed} failed
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowResults(!showResults)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showResults ? "Hide Details" : "Show Details"}
              </button>
            </div>
          </div>

          {showResults && (
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Row
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {uploadResult.results.map((result, idx) => (
                    <tr
                      key={idx}
                      className={result.success ? "bg-green-50" : "bg-red-50"}
                    >
                      <td className="px-3 py-2">{result.row}</td>
                      <td className="px-3 py-2">
                        {result.success ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {result.email}
                      </td>
                      <td className="px-3 py-2">{result.name}</td>
                      <td className="px-3 py-2 text-red-600 text-xs">
                        {result.error || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-1">💡 Tips:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            • Download the template first to see the exact format required
          </li>
          <li>• Make sure department names match exactly (case-insensitive)</li>
          <li>• Each email must be unique - duplicates will be skipped</li>
          <li>• Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkUploadUsersCard;
