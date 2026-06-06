"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Modal from "@/components/Modal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL  || 'https://localhost:7027';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning"
  });
  
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string) => {
    if (field === "email") {
      setEmail(value);
      if (errors.email) setErrors({ ...errors, email: "" });
    } else {
      setPassword(value);
      if (errors.password) setErrors({ ...errors, password: "" });
    }
  };

  const showModal = (title: string, message: string, type: "success" | "error" | "info" | "warning") => {
    setModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    if (modal.type === "success") {
      router.push("/dashboard");
    }
  };

  const scrollToError = (field: string) => {
    if (field === "email" && emailRef.current) {
      emailRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      emailRef.current.focus();
    } else if (field === "password" && passwordRef.current) {
      passwordRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      passwordRef.current.focus();
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { email: "", password: "" };
    let hasError = false;

    if (!email.trim()) {
      newErrors.email = "Email is required";
      scrollToError("email");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      scrollToError("email");
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      if (!hasError) scrollToError("password");
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      let errorMessage = "Invalid email or password";
      
      try {
        const data = await response.json();
        if (data && data.message) {
          errorMessage = data.message;
        }
      } catch (e) {
        console.log("Response is not JSON");
      }

      if (response.ok) {
        // Login successful
        showModal("Success!", "Login successful! Redirecting to dashboard...", "success");
      } else {
        showModal("Login Failed", errorMessage, "error");
        setPassword(""); // Clear password field
        if (passwordRef.current) {
          passwordRef.current.focus();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      showModal("Connection Error", "Unable to connect to the server. Please check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            HFiles
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Medical Record Dashboard
          </p>

          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="mb-3">
              <input
                ref={emailRef}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className={`w-full border-2 rounded-md p-3 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                  errors.email 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-gray-900" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50 text-gray-900"
                }`}
              />
              {errors.email && (
                <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px" }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-4">
              <input
                ref={passwordRef}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                className={`w-full border-2 rounded-md p-3 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                  errors.password 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-gray-900" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50 text-gray-900"
                }`}
              />
              {errors.password && (
                <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px" }}>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 font-semibold text-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-gray-600">Don't have an account?</span>
            <Link href="/signup" className="text-blue-600 ml-1 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </>
  );
}