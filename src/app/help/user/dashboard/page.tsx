"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home, LayoutDashboard, Activity, FileText } from "lucide-react";

export default function DashboardHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/help" className="flex items-center gap-2 text-[#0A3A5C] hover:text-[#0A3A5C]/80 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Help
          </Link>
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-[#0A3A5C]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Guide</h1>
              <p className="text-gray-600 mt-1">Understand your dashboard and explore key features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Your Dashboard is the main landing page when you log into DocMan. It provides a quick overview of your
                recent documents, activity, and important information at a glance.
              </p>
              <p>
                From here, you can access all the main sections of DocMan, including Documents, Activity Log, and
                Settings.
              </p>
            </div>
          </section>

          {/* Main Sections */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-[#0A3A5C]" />
              Main Dashboard Sections
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📁 Documents</h3>
                <p className="text-gray-700">
                  View, upload, and manage all your documents. This is the primary workspace for organizing your files.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📊 Activity</h3>
                <p className="text-gray-700">
                  Track document activities, changes, and user actions. Filter by date range and search for specific
                  events.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">👥 Users</h3>
                <p className="text-gray-700">
                  View and manage team members (admin only). Invite new users and manage their access levels.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">⚙️ Settings</h3>
                <p className="text-gray-700">Configure your account, organization settings, and system preferences.</p>
              </div>
            </div>
          </section>

          {/* Quick Navigation */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Navigation</h2>
            <div className="space-y-4 text-gray-700">
              <p>The sidebar menu provides quick access to all main sections:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#0A3A5C] mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Documents:</strong> Manage your files and folders
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-[#0A3A5C] mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Activity:</strong> View recent actions and changes
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-[#0A3A5C] mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Dashboard:</strong> Return to the main overview
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Recent Documents */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Documents Widget</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                The Recent Documents section displays your most recently accessed or modified documents. This widget
                allows you to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Quickly access frequently used documents</li>
                <li>Preview document thumbnails</li>
                <li>See who last modified the document and when</li>
                <li>Open documents with a single click</li>
              </ul>
            </div>
          </section>

          {/* Organization Switcher */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Organization Switcher</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                If you have access to multiple organizations, you can switch between them using the organization
                selector in the top navigation bar. Your current organization is always displayed.
              </p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Each organization has its own set of documents and users, so make sure you're in
                  the correct organization before uploading documents.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Check the Activity Log regularly to stay updated on changes</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Use the organization switcher to ensure you're working in the right organization</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Explore the Settings section to customize your preferences</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Review user permissions if you're an administrator</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <Link href="/help">
            <Button variant="outline">← Back to Help</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-[#0A3A5C] hover:bg-[#0A3A5C]/90">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
