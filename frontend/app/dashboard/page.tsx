"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserProfile from "../../components/UserProfile";
import FileUpload from "../../components/FileUpload";
import FileList from "../../components/FileList";
import { API_BASE_URL } from "@/config/api"; 

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await loadFiles();
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      // ✅ FIXED: Use API_BASE_URL instead of hardcoded URL
      const response = await fetch(`${API_BASE_URL}/api/File/my-files`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  const handleLogout = async () => {
    // ✅ FIXED: Use API_BASE_URL instead of hardcoded URL
    await fetch(`${API_BASE_URL}/api/Auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Blue Header with HFiles and Welcome + Logout */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Left: HFiles Title */}
            <h1 className="text-2xl font-bold">
              HFiles Medical Dashboard
            </h1>
            
            {/* Right: Welcome message and Logout button */}
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">
                Welcome, {user?.fullName}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition font-semibold text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <UserProfile user={user} onUpdate={setUser} />
          <FileUpload onUploadSuccess={loadFiles} />
        </div>

        <FileList files={files} onDelete={loadFiles} />
      </div>
    </div>
  );
}