"use client";

import { useState, useRef } from "react";
import Modal from "@/components/Modal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL  || 'https://localhost:7027'; ;

export default function UserProfile({ user, onUpdate }: any) {
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning"
  });
  const [errors, setErrors] = useState({
    email: "",
    phoneNumber: ""
  });
  const [formData, setFormData] = useState({
    email: user?.email || "",
    gender: user?.gender || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showModal("Error", "Please upload an image file", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showModal("Error", "Image size should be less than 2MB", "error");
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
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
  };

  const scrollToError = (field: string) => {
    if (field === "email" && emailRef.current) {
      emailRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      emailRef.current.focus();
    } else if (field === "phone" && phoneRef.current) {
      phoneRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      phoneRef.current.focus();
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { email: "", phoneNumber: "" };
    let hasError = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      scrollToError("email");
      hasError = true;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      scrollToError("email");
      hasError = true;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      if (!hasError) scrollToError("phone");
      hasError = true;
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
      if (!hasError) scrollToError("phone");
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Profile/upload-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.imagePath;
      }
      return null;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let uploadedImagePath = profileImage;
      
      if (selectedFile) {
        const imagePath = await uploadImage();
        if (imagePath) {
          uploadedImagePath = imagePath;
        } else {
          showModal("Error", "Failed to upload image", "error");
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/Profile/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          profileImage: uploadedImagePath,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { message: await response.text() };
      }

      if (response.ok) {
        const updatedUser = { ...user, ...formData, profileImage: uploadedImagePath };
        onUpdate(updatedUser);
        setProfileImage(uploadedImagePath);
        setSelectedFile(null);
        setPreviewUrl(null);
        setErrors({ email: "", phoneNumber: "" });
        showModal("Success!", "Profile updated successfully!", "success");
      } else {
        let errorMessage = "Update failed";
        if (data && data.message) {
          errorMessage = data.message;
        }
        showModal("Error", errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showModal("Error", "Error updating profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "email" && errors.email) {
      setErrors({ ...errors, email: "" });
    }
    if (e.target.name === "phoneNumber" && errors.phoneNumber) {
      setErrors({ ...errors, phoneNumber: "" });
    }
  };

  const getProfileImageUrl = () => {
    if (previewUrl) {
      return previewUrl;
    }
    if (profileImage) {
      return `${API_BASE_URL}/${profileImage}`;
    }
    const gender = formData.gender || user?.gender;
    if (gender === "Female") {
      return "https://randomuser.me/api/portraits/women/1.jpg";
    }
    return "https://randomuser.me/api/portraits/men/1.jpg";
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 h-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
          Profile Information
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex flex-col items-center sm:items-start">
              <img
                src={getProfileImageUrl()}
                alt="Profile"
                className="rounded-full border-4 border-blue-500 object-cover"
                style={{ width: '120px', height: '120px' }}
              />
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs font-medium"
              >
                Change Photo
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="text-3xl font-extrabold text-blue-600 mb-2">
                {user?.fullName}
              </div>

              <div>
                <label className="block text-gray-700 font-bold text-sm mb-2">
                  Email Address
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-lg p-3 text-base focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                    errors.email 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-gray-900" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50 text-gray-900"
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>
                     {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-bold text-sm mb-2">
                  Phone Number
                </label>
                <input
                  ref={phoneRef}
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full border-2 rounded-lg p-3 text-base focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${
                    errors.phoneNumber 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-gray-900" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50 text-gray-900"
                  }`}
                  placeholder="Enter 10-digit mobile number"
                />
                {errors.phoneNumber && (
                  <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-bold text-sm mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition-all bg-white text-gray-900"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold text-base shadow-md"
            >
              {loading ? "SAVING..." : "SAVE PROFILE"}
            </button>
          </div>
        </form>
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