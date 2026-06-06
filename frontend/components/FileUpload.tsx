"use client";

import { useState, useRef } from "react";
import Modal from "@/components/Modal";

const fileTypes = ["Lab Report", "Prescription", "X-Ray", "Blood Report", "MRI Scan", "CT Scan"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL  || 'https://localhost:7027'; ;

export default function FileUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning"
  });
  const [errors, setErrors] = useState({
    fileType: "",
    fileName: "",
    selectedFile: ""
  });

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

  const validateForm = (): boolean => {
    const newErrors = { fileType: "", fileName: "", selectedFile: "" };
    let hasError = false;

    if (!fileType) {
      newErrors.fileType = "Please select a file type";
      hasError = true;
    }

    if (!fileName.trim()) {
      newErrors.fileName = "Please enter a file name";
      hasError = true;
    }

    if (!selectedFile) {
      newErrors.selectedFile = "Please select a file to upload";
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(errors).find(err => err);
      if (firstError) {
        showModal("Validation Error", firstError, "warning");
      }
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("File", selectedFile!);
    formData.append("FileType", fileType);
    formData.append("FileName", fileName);

    try {
      const response = await fetch(`${API_BASE_URL}/api/File/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { message: await response.text() };
      }

      if (response.ok) {
        showModal("Success!", "File uploaded successfully!", "success");
        setSelectedFile(null);
        setFileType("");
        setFileName("");
        setErrors({ fileType: "", fileName: "", selectedFile: "" });
        onUploadSuccess();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        let errorMessage = "Upload failed";
        if (data && data.message) {
          errorMessage = data.message;
        }
        showModal("Upload Failed", errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showModal("Connection Error", "Unable to connect to the server. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (errors.selectedFile) {
      setErrors({ ...errors, selectedFile: "" });
    }
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFileType(e.target.value);
    if (errors.fileType) {
      setErrors({ ...errors, fileType: "" });
    }
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
    if (errors.fileName) {
      setErrors({ ...errors, fileName: "" });
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 h-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
          Please Add Your Medical Record
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Select file type */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold text-sm mb-2">
               File Type 
            </label>
            <select
              value={fileType}
              onChange={handleFileTypeChange}
              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${
                errors.fileType 
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50" 
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50"
              }`}
              required
            >
              <option value="">Select file type</option>
              {fileTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.fileType && (
              <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>
                {errors.fileType}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              File Name 
            </label>
            <input
              type="text"
              value={fileName}
              onChange={handleFileNameChange}
              placeholder="Enter file name (e.g., Blood Report Jan 2024)"
              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 text-gray-900 ${
                errors.fileName 
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50" 
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 focus:bg-blue-50"
              }`}
              required
            />
            {errors.fileName && (
              <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>
                {errors.fileName}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Select File 
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 border-2 rounded-lg p-3 transition-all bg-white font-medium ${
                  errors.selectedFile 
                    ? "border-red-500 hover:border-red-500 text-red-600" 
                    : "border-gray-300 hover:border-blue-500 text-gray-600 hover:bg-blue-50"
                }`}
              >
                {selectedFile ? selectedFile.name : "Choose File"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />

              <button
                type="submit"
                disabled={loading}
                className="px-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
              >
                {loading ? "..." : "Submit"}
              </button>
            </div>
            {errors.selectedFile && (
              <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>
                {errors.selectedFile}
              </p>
            )}
          </div>

          {selectedFile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                📄 Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
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