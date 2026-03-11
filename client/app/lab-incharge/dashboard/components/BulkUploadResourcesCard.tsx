"use client";

import { useState, useRef } from "react";

interface BulkUploadResult {
  success: boolean;
  row: number;
  name: string;
  categoryName: string;
  categoryCreated?: boolean;
  error?: string;
}

interface BulkUploadResponse {
  created: number;
  failed: number;
  categoriesCreated: number;
  results: BulkUploadResult[];
}

interface BulkUploadResourcesCardProps {
  onResourcesCreated?: () => void;
}

const BulkUploadResourcesCard = ({
  onResourcesCreated,
}: BulkUploadResourcesCardProps) => {
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resource/bulk-upload/template`,
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
      a.download = "bulk_resources_template.xlsx";
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resource/bulk-upload`,
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
          onResourcesCreated?.();
        }
      } else {
        setError(data.message || "Failed to upload resources");
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Bulk Upload Resources
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload multiple resources from an Excel file
          </p>
        </div>
        <div className="shrink-0">
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>

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
                <td className="py-1 pr-4 font-mono">name</td>
                <td className="py-1 pr-4 text-red-600">Yes</td>
                <td className="py-1">Resource name</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-1 pr-4 font-mono">categoryName</td>
                <td className="py-1 pr-4 text-red-600">Yes</td>
                <td className="py-1">
                  Category name (auto-created if not exists)
                </td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-1 pr-4 font-mono">description</td>
                <td className="py-1 pr-4 text-gray-500">No</td>
                <td className="py-1">Resource description</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-1 pr-4 font-mono">model</td>
                <td className="py-1 pr-4 text-gray-500">No</td>
                <td className="py-1">Model number/name</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-1 pr-4 font-mono">categoryDescription</td>
                <td className="py-1 pr-4 text-gray-500">No</td>
                <td className="py-1">Description for new categories</td>
              </tr>
              <tr>
                <td className="py-1 pr-4 font-mono">quantity</td>
                <td className="py-1 pr-4 text-gray-500">No</td>
                <td className="py-1">Quantity (default: 1)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">💡 Tip:</span> If a category
            doesn&apos;t exist, it will be automatically created using the
            provided category name and description.
          </p>
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Results */}
      {uploadResult && showResults && (
        <div className="border border-gray-200 rounded-md">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Upload Results</h3>
            <button
              onClick={() => setShowResults(false)}
              className="text-gray-400 hover:text-gray-600"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 p-3 rounded-md text-center">
                <p className="text-2xl font-bold text-green-600">
                  {uploadResult.created}
                </p>
                <p className="text-xs text-green-700">Resources Created</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {uploadResult.categoriesCreated}
                </p>
                <p className="text-xs text-blue-700">Categories Created</p>
              </div>
              <div className="bg-red-50 p-3 rounded-md text-center">
                <p className="text-2xl font-bold text-red-600">
                  {uploadResult.failed}
                </p>
                <p className="text-xs text-red-700">Failed</p>
              </div>
            </div>

            {/* Detailed Results */}
            {uploadResult.results.length > 0 && (
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-2">Row</th>
                      <th className="text-left py-2 px-2">Name</th>
                      <th className="text-left py-2 px-2">Category</th>
                      <th className="text-left py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.results.map((result, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${
                          result.success ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        <td className="py-2 px-2">{result.row}</td>
                        <td className="py-2 px-2 truncate max-w-30">
                          {result.name}
                        </td>
                        <td className="py-2 px-2">
                          <span className="truncate max-w-25 inline-block">
                            {result.categoryName}
                          </span>
                          {result.categoryCreated && (
                            <span className="ml-1 px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                              New
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {result.success ? (
                            <span className="text-green-600">✓ Created</span>
                          ) : (
                            <span className="text-red-600" title={result.error}>
                              ✗ {result.error?.slice(0, 30)}
                              {result.error && result.error.length > 30
                                ? "..."
                                : ""}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadResourcesCard;
