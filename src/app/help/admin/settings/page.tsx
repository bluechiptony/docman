"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Settings, FileText, Database, Shield } from "lucide-react";

export default function AdminSettingsHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/help" className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Help
          </Link>
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings Guide</h1>
              <p className="text-gray-600 mt-1">Configure organization settings and document types</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">System Settings Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                System Settings allow you to configure organization-wide preferences and settings that affect all users
                and documents.
              </p>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900">
                  <strong>Admin Only:</strong> These settings can only be modified by administrators.
                </p>
              </div>
            </div>
          </section>

          {/* General Settings */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">General Organization Settings</h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Organization Profile</h3>
                <p className="mb-3">Configure basic information about your organization:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Organization name</li>
                  <li>Organization logo/branding</li>
                  <li>Contact information</li>
                  <li>Address and location</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Default Settings</h3>
                <p className="mb-3">Set default preferences for new users:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Default user role for new invitations</li>
                  <li>Default document view preference</li>
                  <li>Default organization timezone</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Document Types */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-red-600" />
              Managing Document Types
            </h2>
            <div className="space-y-6">
              <div className="text-gray-700">
                <p className="mb-4">
                  Document types allow you to categorize and organize documents in a structured way. You can create
                  custom document types specific to your organization's needs.
                </p>
                <h3 className="font-semibold text-gray-900 mb-3">Creating a New Document Type</h3>
                <ol className="list-decimal list-inside space-y-3">
                  <li>Go to Settings → Document Types</li>
                  <li>Click "Add Document Type"</li>
                  <li>Enter the document type name</li>
                  <li>Optionally add a description</li>
                  <li>Configure any required fields</li>
                  <li>Click "Create"</li>
                </ol>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Use document types for common document categories like "Invoice", "Contract",
                  "Report", etc.
                </p>
              </div>
            </div>
          </section>

          {/* Storage & Quota */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-red-600" />
              Storage Management
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Monitor and manage your organization's storage quota:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>View total storage used</li>
                <li>See storage breakdown by document type</li>
                <li>Monitor storage quota limits</li>
                <li>Archive old documents to free up space</li>
              </ul>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Warning:</strong> If you reach your storage quota, users will not be able to upload new
                  documents until space is freed.
                </p>
              </div>
            </div>
          </section>

          {/* Security Settings */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              Security Settings
            </h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Access Control</h3>
                <p className="mb-3">Configure security policies:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Password requirements</li>
                  <li>Session timeout policies</li>
                  <li>IP whitelist/blacklist</li>
                  <li>Two-factor authentication requirements</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
                <p className="mb-3">Manage data security:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Enable document encryption</li>
                  <li>Audit log retention</li>
                  <li>Backup policies</li>
                  <li>Data retention settings</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Appearance Settings */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Appearance & Branding</h2>
            <div className="space-y-4 text-gray-700">
              <p>Customize the look and feel of DocMan for your organization:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Upload organization logo</li>
                <li>Set primary color/theme</li>
                <li>Customize login page branding</li>
                <li>Add organization name to page headers</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Use your organization's brand colors and logo for a consistent experience.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Plan document types before implementation</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Regularly review storage usage</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Enable security features appropriate for your organization</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Keep branding consistent with your organization</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Document your configuration for future reference</span>
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
            <Button className="bg-red-600 hover:bg-red-700">Go to System Settings</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
