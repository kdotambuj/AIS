"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getRedirectPath = (userRole: string) => {
    switch (userRole) {
      case "ADMIN":
        return "/admin/dashboard";
      case "HOD":
        return "/hod/dashboard";
      case "LAB_INCHARGE":
        return "/lab-incharge/dashboard";
      case "STUDENT":
      default:
        return "/student/dashboard";
    }
  };

  const doLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password, role }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed");
        toast.error(data.message || "Login failed");
      } else {
        toast.success("Signed in successfully!");
        const redirectPath = getRedirectPath(data.data.role);
        router.push(redirectPath);
      }
    } catch (err) {
      const errorMessage = "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email.trim()) {
      setError("Email is required");
      toast.error("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      toast.error("Password is required");
      return;
    }

    doLogin();
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Logo */}
      <div className="flex flex-col justify-center items-center w-[50%] h-screen">
        <Image
          src={"/DEI_LOGO.jpg"}
          height={150}
          width={150}
          alt="DEI LOGO"
        ></Image>

        <p className="text-3xl font-semibold mt-8">Academic Inventory System</p>
        <p className="text-sm mt-2">Resource Sharing & Management at ease</p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex justify-center items-center w-[50%] h-screen bg-white border-r-2 border-black">
        <div className="w-full max-w-md p-8 bg-white rounded-lg border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-sm text-gray-600 mb-6">
            Access the <span className="text-red-500">AIS</span> and{" "}
            <span className="text-blue-500">Resource Management Portal</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="STUDENT">Student</option>
                <option value="HOD">HOD</option>
                <option value="LAB_INCHARGE">Lab Incharge</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {error && (
              <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
            )}
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an Account?{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Request Access
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
