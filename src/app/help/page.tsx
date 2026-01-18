"use client";
import { useAuth } from "@/providers/auth.provider";
import Link from "next/link";
import { BookOpen, Users, Settings, FileText, Home } from "lucide-react";

export default function HelpPage() {
  const { user } = useAuth();
  const isAdmin = user?.authentication?.role === "ADMINISTRATOR" || user?.authentication?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#0A3A5C]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help & Documentation</h1>
              <p className="text-gray-600 mt-1">Find guides, tutorials, and answers to common questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Help Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0A3A5C]" />
            User Guides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Documents Help Card */}
            <Link href="/help/user/documents" className="group">
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 p-6 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-6 h-6 text-[#0A3A5C]" />
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#0A3A5C]">Documents</h3>
                </div>
                <p className="text-gray-600">Learn how to upload, organize, and manage your documents</p>
                <div className="mt-4 text-[#0A3A5C] font-medium text-sm">View Guide →</div>
              </div>
            </Link>

            {/* Dashboard Help Card */}
            <Link href="/help/user/dashboard" className="group">
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 p-6 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <Home className="w-6 h-6 text-[#0A3A5C]" />
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#0A3A5C]">Dashboard</h3>
                </div>
                <p className="text-gray-600">Understand your dashboard and explore key features</p>
                <div className="mt-4 text-[#0A3A5C] font-medium text-sm">View Guide →</div>
              </div>
            </Link>

            {/* Settings Help Card */}
            <Link href="/help/user/settings" className="group">
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 p-6 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="w-6 h-6 text-[#0A3A5C]" />
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#0A3A5C]">Settings</h3>
                </div>
                <p className="text-gray-600">Manage your account, profile, and preferences</p>
                <div className="mt-4 text-[#0A3A5C] font-medium text-sm">View Guide →</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Admin Help Section - Only show for admins */}
        {isAdmin && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-red-600" />
              Administrator Guides
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Management Help Card */}
              <Link href="/help/admin/users" className="group">
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-red-200 p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600">User Management</h3>
                  </div>
                  <p className="text-gray-600">Manage users, roles, permissions, and access levels</p>
                  <div className="mt-4 text-red-600 font-medium text-sm">View Guide →</div>
                </div>
              </Link>

              {/* System Settings Help Card */}
              <Link href="/help/admin/settings" className="group">
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-red-200 p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600">System Settings</h3>
                  </div>
                  <p className="text-gray-600">Configure organization settings and document types</p>
                  <div className="mt-4 text-red-600 font-medium text-sm">View Guide →</div>
                </div>
              </Link>

              {/* Moderation Help Card */}
              <Link href="/help/admin/moderation" className="group">
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-red-200 p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600">Moderation</h3>
                  </div>
                  <p className="text-gray-600">Review, approve, and manage content moderation</p>
                  <div className="mt-4 text-red-600 font-medium text-sm">View Guide →</div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
