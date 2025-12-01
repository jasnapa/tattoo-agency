import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { artistFormValidationSchema } from "../schemas/artistFormSchema";
import axiosInstance from "../lib/axios";
import { useAuth } from "../hooks/useAuth";

const ArtistForm: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      location: "",
      tier: "",
    },
    validationSchema: artistFormValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setFieldErrors({});

      // Remove empty optional fields
      const payload: any = {
        first_name: values.first_name,
        email: values.email,
        tier: values.tier,
      };

      if (values.last_name) payload.last_name = values.last_name;
      if (values.location) payload.location = values.location;

      try {
        console.log("Submitting artist form:", payload);
        const response = await axiosInstance.post("/artist_form/", payload);
        console.log("Artist form response:", response);

        toast.success("Artist form submitted successfully!");
        formik.resetForm();
      } catch (err: any) {
        console.error("Artist form error:", err);
        console.error("Error response:", err.response);

        if (err.response?.data) {
          const errorData = err.response.data;

          // Check for error field first (common API error format)
          if (errorData.error) {
            toast.error(errorData.error);
          } else if (errorData.detail) {
            toast.error(errorData.detail);
          } else if (errorData.message) {
            toast.error(errorData.message);
          } else if (typeof errorData === "object" && !errorData.message && !errorData.detail && !errorData.error) {
            // Handle field-specific errors
            const errors: Record<string, string> = {};
            Object.keys(errorData).forEach((field) => {
              if (Array.isArray(errorData[field])) {
                errors[field] = errorData[field][0];
              } else {
                errors[field] = errorData[field];
              }
            });
            setFieldErrors(errors);
            toast.error("Please fix the errors in the form");
          } else {
            toast.error("Failed to submit artist form. Please try again.");
          }
        } else if (err.message === "Network Error") {
          toast.error("Network error. Please check your connection.");
        } else if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
          toast.error("Request timeout. Please try again.");
        } else {
          toast.error("Failed to submit artist form. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Artist Registration Form
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Submit artist information to the system
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              style={{ backgroundColor: "#edaa00" }}
              className="px-4 py-2 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.first_name}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  (formik.touched.first_name && formik.errors.first_name) ||
                  fieldErrors.first_name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter first name"
              />
              {formik.touched.first_name && formik.errors.first_name && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.first_name}
                </p>
              )}
              {fieldErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.first_name}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.last_name}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  (formik.touched.last_name && formik.errors.last_name) ||
                  fieldErrors.last_name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter last name (optional)"
              />
              {formik.touched.last_name && formik.errors.last_name && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.last_name}
                </p>
              )}
              {fieldErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.last_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  (formik.touched.email && formik.errors.email) ||
                  fieldErrors.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter email (must exist in Calendar database)"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.email}
                </p>
              )}
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Email must match an existing record in the Calendar database
              </p>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.location}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  (formik.touched.location && formik.errors.location) ||
                  fieldErrors.location
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter location (optional)"
              />
              {formik.touched.location && formik.errors.location && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.location}
                </p>
              )}
              {fieldErrors.location && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.location}
                </p>
              )}
            </div>

            {/* Tier */}
            <div>
              <label
                htmlFor="tier"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tier <span className="text-red-500">*</span>
              </label>
              <input
                id="tier"
                name="tier"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.tier}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  (formik.touched.tier && formik.errors.tier) || fieldErrors.tier
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter tier (e.g., Tier 1, Tier 2)"
              />
              {formik.touched.tier && formik.errors.tier && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.tier}</p>
              )}
              {fieldErrors.tier && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.tier}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#edaa00" }}
                className="w-full py-3 px-4 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Submit Artist Form
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ArtistForm;
