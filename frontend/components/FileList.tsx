"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

interface MedicalFile {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadDate: string;
}

interface FileListProps {
  files: MedicalFile[];
  onDelete: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL  || 'https://localhost:7027';;

export default function FileList({ files, onDelete }: FileListProps) {
  const [loading, setLoading] = useState<number | null>(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning"
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

  const handleView = async (file: MedicalFile) => {
    try {
      if (file.filePath) {
        const directUrl = `${API_BASE_URL}/${file.filePath}`;
        console.log("Opening in new tab:", directUrl);
        window.open(directUrl, "_blank");
        return;
      }

      const apiUrl = `${API_BASE_URL}/api/File/download/${file.id}`;
      console.log("Fetching from:", apiUrl);
      
      const response = await fetch(apiUrl, { 
        method: 'GET',
        credentials: 'include',
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        window.open(url, "_blank");
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        showModal("Error", "Cannot open file. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showModal("Error", "Error opening file. Please check your connection.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/File/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        showModal("Success!", "File deleted successfully!", "success");
        onDelete();
      } else if (response.status === 401) {
        showModal("Session Expired", "Please login again", "error");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        let errorMessage = "Delete failed";
        try {
          const data = await response.json();
          if (data && data.message) errorMessage = data.message;
        } catch (e) {}
        showModal("Error", errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showModal("Error", "Error deleting file. Please try again.", "error");
    } finally {
      setLoading(null);
    }
  };

  const getFileTypeColor = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("x-ray")) return "bg-gray-100 text-gray-700";
    if (type.includes("mri") || type.includes("ct")) return "bg-purple-100 text-purple-700";
    if (type.includes("report")) return "bg-blue-100 text-blue-700";
    if (type.includes("prescription")) return "bg-green-100 text-green-700";
    if (type.includes("blood")) return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getFileTypeShort = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("x-ray")) return "X-Ray";
    if (type.includes("mri")) return "MRI";
    if (type.includes("ct")) return "CT";
    if (type.includes("report")) return "RPT";
    if (type.includes("prescription")) return "RX";
    if (type.includes("blood")) return "BLD";
    return "DOC";
  };

  if (files.length === 0) {
    return (
      <>
        <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Preview of Sent Files</h3>
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
            No files uploaded yet
            <p className="text-xs mt-1">Uploaded files will appear here</p>
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

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
        <h3 className="text-md font-semibold text-gray-700 mb-3">
          Preview of Sent Files ({files.length})
        </h3>

        <div className="flex flex-wrap gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="w-32 border rounded-lg p-2 shadow-sm hover:shadow-md transition-all bg-white flex-shrink-0"
            >
              <div className={`h-16 rounded-md flex items-center justify-center border border-gray-200 ${getFileTypeColor(file.fileType)}`}>
                <span className="text-xs font-bold uppercase">
                  {getFileTypeShort(file.fileType)}
                </span>
              </div>

              <p
                className="text-xs font-medium text-gray-700 truncate text-center mt-2"
                title={file.fileName}
              >
                {file.fileName.length > 10 ? file.fileName.substring(0, 8) + ".." : file.fileName}
              </p>

              <p className="text-[10px] text-gray-500 text-center">{file.fileType}</p>

              <button
                onClick={() => handleView(file)}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-1 rounded text-xs font-medium transition mt-2"
              >
                View
              </button>

              <button
                onClick={() => handleDelete(file.id)}
                disabled={loading === file.id}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded text-xs font-medium transition disabled:opacity-50 mt-1"
              >
                {loading === file.id ? "..." : "Delete"}
              </button>
            </div>
          ))}
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