"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL  || 'https://localhost:7027';

interface ValidationErrors {
  fullName?: string;
  email?: string;
  gender?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning"
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name as keyof ValidationErrors]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined,
      });
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
      router.push("/login");
    }
  };

  const scrollToError = (errorField: string) => {
    let element: HTMLElement | null = null;
    
    switch (errorField) {
      case "fullName":
        element = fullNameRef.current;
        break;
      case "email":
        element = emailRef.current;
        break;
      case "gender":
        element = genderRef.current;
        break;
      case "phoneNumber":
        element = phoneNumberRef.current;
        break;
      case "password":
        element = passwordRef.current;
        break;
      case "confirmPassword":
        element = confirmPasswordRef.current;
        break;
      default:
        element = null;
    }
    
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      scrollToError("fullName");
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
      scrollToError("fullName");
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = "Full name must be less than 50 characters";
      scrollToError("fullName");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
      if (!newErrors.fullName) scrollToError("email");
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      if (!newErrors.fullName) scrollToError("email");
    }

    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
      if (!newErrors.fullName && !newErrors.email) scrollToError("gender");
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
      if (!newErrors.fullName && !newErrors.email && !newErrors.gender) scrollToError("phoneNumber");
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
      if (!newErrors.fullName && !newErrors.email && !newErrors.gender) scrollToError("phoneNumber");
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      if (!newErrors.fullName && !newErrors.email && !newErrors.gender && !newErrors.phoneNumber) scrollToError("password");
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      if (!newErrors.fullName && !newErrors.email && !newErrors.gender && !newErrors.phoneNumber) scrollToError("password");
    } else if (formData.password.length > 20) {
      newErrors.password = "Password must be less than 20 characters";
      if (!newErrors.fullName && !newErrors.email && !newErrors.gender && !newErrors.phoneNumber) scrollToError("password");
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
      if (!newErrors.fullName && !newErrors.email && !newErrors.gender && !newErrors.phoneNumber) scrollToError("password");
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
      if (!newErrors.fullName && !newErrors.email && !newErrors.gender && !newErrors.phoneNumber) scrollToError("password");
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
      if (!newErrors.fullName && !newErrors.email && !newErrors.gender && !newErrors.phoneNumber) scrollToError("password");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      if (!newErrors.fullName && !newErrors.email && !newErrors.gender && !newErrors.phoneNumber && !newErrors.password) scrollToError("confirmPassword");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      if (!newErrors.fullName && !newErrors.email && !newErrors.gender && !newErrors.phoneNumber && !newErrors.password) scrollToError("confirmPassword");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (response.ok) {
        showModal(
          "Success!", 
          "Your account has been created successfully! You will now be redirected to the login page.",
          "success"
        );
        setFormData({
          fullName: "",
          email: "",
          gender: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
        });
        setErrors({});
      } else {
        let errorMessage = "Failed to create account. Please try again.";
        
        if (data.message) {
          errorMessage = data.message;
        }
        
        if (data.message?.toLowerCase().includes("email already exists")) {
          setErrors({ ...errors, email: "Email already exists. Please use a different email." });
          scrollToError("email");
          showModal("Signup Failed", "This email is already registered. Please use a different email.", "error");
        }
        
        if (data.message?.toLowerCase().includes("phone")) {
          setErrors({ ...errors, phoneNumber: `${data.message}` });
          scrollToError("phoneNumber");
        }
        
        if (!data.message?.toLowerCase().includes("email already exists")) {
          showModal("Signup Failed", errorMessage, "error");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      showModal(
        "Connection Error", 
        "Unable to connect to the server. Please check if the backend is running.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Join HFiles Medical Dashboard
          </p>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-3">
              <input
                ref={fullNameRef}
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className={`w-full border-2 rounded-md p-3 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                  errors.fullName 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-gray-900" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50 text-gray-900"
                }`}
              />
              {errors.fullName && (
                <p style={{ color: "#dc2626", fontWeight: "bold", fontSize: "14px", marginTop: "4px" }}>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <input
                ref={emailRef}
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full border-2 rounded-md p-3 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                  errors.email 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-gray-900" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50 text-gray-900"
                }`}
              />
              {errors.email && (
                <p style={{ color: "#dc2626", fontWeight: "bold", fontSize: "14px", marginTop: "4px" }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-3">
              <select
                ref={genderRef}
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className={`w-full border-2 rounded-md p-3 focus:outline-none focus:ring-2 transition-all ${
                  errors.gender 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-gray-900" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50 text-gray-900"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && (
                <p style={{ color: "#dc2626", fontWeight: "bold", fontSize: "14px", marginTop: "4px" }}>
                  {errors.gender}
                </p>
              )}
            </div>

            <div className="mb-3">
              <input
                ref={phoneNumberRef}
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number (10 digits)"
                value={formData.phoneNumber}
                onChange={handleChange}
                maxLength={10}
                required
                className={`w-full border-2 rounded-md p-3 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                  errors.phoneNumber 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-gray-900" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50 text-gray-900"
                }`}
              />
              {errors.phoneNumber && (
                <p style={{ color: "#dc2626", fontWeight: "bold", fontSize: "14px", marginTop: "4px" }}>
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className="mb-3">
              <input
                ref={passwordRef}
                type="password"
                name="password"
                placeholder="Password (min 6 chars, 1 uppercase, 1 number)"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full border-2 rounded-md p-3 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                  errors.password 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-gray-900" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50 text-gray-900"
                }`}
              />
              {errors.password && (
                <p style={{ color: "#dc2626", fontWeight: "bold", fontSize: "14px", marginTop: "4px" }}>
                  {errors.password}
                </p>
              )}
            </div>

            <div className="mb-4">
              <input
                ref={confirmPasswordRef}
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full border-2 rounded-md p-3 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                  errors.confirmPassword 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-gray-900" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50 text-gray-900"
                }`}
              />
              {errors.confirmPassword && (
                <p style={{ color: "#dc2626", fontWeight: "bold", fontSize: "14px", marginTop: "4px" }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 font-semibold text-lg"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-gray-600">Already have an account?</span>
            <Link href="/login" className="text-blue-600 ml-1 hover:underline">
              Login
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