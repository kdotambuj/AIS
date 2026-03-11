"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";

interface ResourceCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface ResourceAuthority {
  id: string;
  name: string;
  resourceCategories: ResourceCategory[];
}

const CreateResourceCard = () => {
  const [authority, setAuthority] = useState<ResourceAuthority | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth,
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model: "",
    resourceCategoryId: "",
    quantity: 1,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setIsLoading(false);
      setError("Please login to create resources");
      return;
    }

    const fetchMyAuthority = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/authority/my-authority`,
          {
            credentials: "include",
          },
        );

        const data = await res.json();

        if (data.success) {
          setAuthority(data.data);
          // Set default category if available
          if (data.data.resourceCategories?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              resourceCategoryId: data.data.resourceCategories[0].id,
            }));
          }
        } else {
          setError(data.message || "Failed to fetch authority");
        }
      } catch (err) {
        console.error("Failed to fetch authority:", err);
        setError("Failed to fetch authority");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyAuthority();
  }, [authLoading, isAuthenticated]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim()) {
      setError("Resource name is required");
      return;
    }

    if (!formData.resourceCategoryId) {
      setError("Please select a resource category");
      return;
    }

    if (formData.quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resource/create-resource`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            model: formData.model.trim() || undefined,
            resourceCategoryId: formData.resourceCategoryId,
            quantity: formData.quantity,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setSuccess("Resource created successfully!");
        setFormData({
          name: "",
          description: "",
          model: "",
          resourceCategoryId: authority?.resourceCategories[0]?.id || "",
          quantity: 1,
        });
      } else {
        setError(data.message || "Failed to create resource");
      }
    } catch (err) {
      console.error("Failed to create resource:", err);
      setError("Failed to create resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!authority) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-6">
        <p>No resource authority has been assigned to you yet.</p>
      </div>
    );
  }

  const activeCategories = authority.resourceCategories.filter(
    (cat) => cat.isActive,
  );

  if (activeCategories.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-6">
        <h3 className="font-semibold mb-2">No Resource Categories</h3>
        <p>Please create a resource category first before adding resources.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Resource
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Add a resource to {authority.name}
          </p>
        </div>
        <div className="flex-shrink-0">
          <svg
            className="h-8 w-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="resourceCategoryId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="resourceCategoryId"
            name="resourceCategoryId"
            value={formData.resourceCategoryId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {activeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Resource Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Oscilloscope, Projector, Computer"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Model
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            placeholder="e.g., Tektronix TBS1052B"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            min={1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Brief description of the resource..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating...
            </>
          ) : (
            "Create Resource"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateResourceCard;
