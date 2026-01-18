"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Settings, Lock, User, Bell } from "lucide-react";

export default function SettingsHelpPage() {
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
            <Settings className="w-8 h-8 text-[#0A3A5C]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings Guide</h1>
              <p className="text-gray-600 mt-1">Manage your account, profile, and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                The Settings section allows you to customize your DocMan experience. You can manage your account, update
                your profile, configure organization settings, and adjust your preferences.
              </p>
              <p>Access Settings from the dashboard sidebar or use the settings icon in your user menu.</p>
            </div>
          </section>

          {/* Account Settings */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-[#0A3A5C]" />
              Account Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Profile Information</h3>
                <p className="text-gray-700 mb-3">Update your profile details:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>First and Last Name</li>
                  <li>Email Address</li>
                  <li>Phone Number</li>
                  <li>Profile Picture</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Verification</h3>
                <p className="text-gray-700">
                  Ensure your email address is verified. You'll receive a verification link if needed.
                </p>
              </div>
            </div>
          </section>

          {/* Security Settings */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-[#0A3A5C]" />
              Security Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Change Password</h3>
                <p className="text-gray-700 mb-3">Update your password regularly for security:</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Enter your current password</li>
                  <li>Create a new password (minimum 8 characters)</li>
                  <li>Confirm your new password</li>
                  <li>Click "Update Password"</li>
                </ol>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <strong>Important:</strong> Use a strong password with a mix of uppercase, lowercase, numbers, and
                    special characters.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Active Sessions</h3>
                <p className="text-gray-700">
                  View all active sessions and devices logged into your account. You can log out from any device
                  remotely.
                </p>
              </div>
            </div>
          </section>

          {/* Organization Settings */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Organization Settings</h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">General Settings</h3>
                <p>Configure basic organization information visible to all members.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Document Types</h3>
                <p>Admins can manage custom document types used for categorizing documents in the organization.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Storage & Quota</h3>
                <p>View your organization's storage usage and quota limits.</p>
              </div>
            </div>
          </section>

          {/* Notification Preferences */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#0A3A5C]" />
              Notification Preferences
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Customize which notifications you receive:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Email notifications for important updates</li>
                <li>In-app notifications</li>
                <li>Document sharing notifications</li>
                <li>Activity summary emails</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Adjust notification settings based on your preferences to avoid information
                  overload.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy & Data */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy & Data</h2>
            <div className="space-y-4 text-gray-700">
              <p>Review and manage your privacy settings:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Profile visibility settings</li>
                <li>Data usage preferences</li>
                <li>Download your data</li>
                <li>Account deactivation</li>
              </ul>
            </div>
          </section>

          {/* Best Practices */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Keep your password strong and change it regularly</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Verify your email address to ensure you receive notifications</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Review active sessions and log out from unfamiliar devices</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Customize notifications to stay informed without being overwhelmed</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <Link href="/help">
            <Button variant="outline">← Back to Help</Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button className="bg-[#0A3A5C] hover:bg-[#0A3A5C]/90">Go to Settings</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
