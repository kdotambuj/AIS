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
  const [isDownloadingGuidelines, setIsDownloadingGuidelines] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadGuidelines = () => {
    setIsDownloadingGuidelines(true);
    try {
      const departmentNames = departments.length
        ? departments.map((dept) => `- ${dept.name}`).join("\n")
        : "- No departments available";

      const guidelines = `AIS - Bulk User Upload Guidelines

Please use the provided Excel template for uploading user records.

Required columns:
- email
- name
- password
- role
- departmentName

Optional columns:
- rollNumber
- enrollmentNumber

Accepted file types:
- .xlsx
- .xls

Maximum file size:
- 10 MB

Role values:
- STUDENT
- HOD
- LAB_INCHARGE
- ADMIN

Current department names:
${departmentNames}

Notes:
- Email must be unique for each user.
- Department names must match existing departments.
- Keep header names unchanged in the template.
`;

      const blob = new Blob([guidelines], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bulk_user_upload_guidelines.txt";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError("Failed to download guidelines");
    } finally {
      setIsDownloadingGuidelines(false);
    }
  };

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
    <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <h3 className="font-medium text-gray-700">Bulk Upload Users</h3>

      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">
          For a smooth upload process, please download and review the guidelines
          and template before submitting the Excel file.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={handleDownloadGuidelines}
          disabled={isDownloadingGuidelines}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 focus:ring-1 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              d="M12 16v-8m0 8l-3-3m3 3l3-3M5 20h14"
            />
          </svg>
          {isDownloadingGuidelines ? "Downloading..." : "Download Guidelines"}
        </button>

        <button
          onClick={handleDownloadTemplate}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 focus:ring-1 focus:ring-red-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
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
                className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
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
    </div>
  );
};

export default BulkUploadUsersCard;
