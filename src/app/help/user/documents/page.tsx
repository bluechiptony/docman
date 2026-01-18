"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText, FolderPlus, Upload, Search } from "lucide-react";

export default function DocumentsHelpPage() {
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
            <FileText className="w-8 h-8 text-[#0A3A5C]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents Guide</h1>
              <p className="text-gray-600 mt-1">Learn how to upload, organize, and manage your documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <button className="text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <Upload className="w-6 h-6 text-[#0A3A5C] mb-2" />
            <h3 className="font-semibold text-gray-900">Upload Documents</h3>
            <p className="text-sm text-gray-600">How to upload files</p>
          </button>
          <button className="text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <FolderPlus className="w-6 h-6 text-[#0A3A5C] mb-2" />
            <h3 className="font-semibold text-gray-900">Create Folders</h3>
            <p className="text-sm text-gray-600">Organize your content</p>
          </button>
          <button className="text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <Search className="w-6 h-6 text-[#0A3A5C] mb-2" />
            <h3 className="font-semibold text-gray-900">Search</h3>
            <p className="text-sm text-gray-600">Find documents quickly</p>
          </button>
          <button className="text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <FileText className="w-6 h-6 text-[#0A3A5C] mb-2" />
            <h3 className="font-semibold text-gray-900">Share</h3>
            <p className="text-sm text-gray-600">Share with others</p>
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Getting Started */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                The Documents page is your central hub for managing all your files. You can upload, organize, search,
                and share documents with ease.
              </p>
              <p>
                On your first visit, you'll see the Documents page with options to create new folders and upload files.
                The main area displays all your documents and folders in a grid or list view.
              </p>
            </div>
          </section>

          {/* Uploading Documents */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6 text-[#0A3A5C]" />
              Uploading Documents
            </h2>
            <div className="space-y-4 text-gray-700">
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to the Documents page from the dashboard</li>
                <li>Click the "Upload" button in the top toolbar</li>
                <li>Select one or multiple files from your computer</li>
                <li>Choose the document type from the dropdown</li>
                <li>Click "Upload" to process your files</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> You can also drag and drop files directly onto the page to upload them quickly.
                </p>
              </div>
            </div>
          </section>

          {/* Creating Folders */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FolderPlus className="w-6 h-6 text-[#0A3A5C]" />
              Creating Folders
            </h2>
            <div className="space-y-4 text-gray-700">
              <ol className="list-decimal list-inside space-y-3">
                <li>Click the "New Folder" button</li>
                <li>Enter a name for your folder</li>
                <li>Optionally add a description</li>
                <li>Click "Create" to finish</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Use descriptive folder names to make it easier to find documents later.
                </p>
              </div>
            </div>
          </section>

          {/* Searching & Filtering */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-6 h-6 text-[#0A3A5C]" />
              Searching & Filtering
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Use the search bar to find documents quickly by name or content. You can also filter by:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Document type</li>
                <li>Date range</li>
                <li>Status</li>
                <li>Owner</li>
              </ul>
            </div>
          </section>

          {/* Sharing Documents */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sharing Documents</h2>
            <div className="space-y-4 text-gray-700">
              <p>To share a document with others:</p>
              <ol className="list-decimal list-inside space-y-3">
                <li>Click on the document to open it</li>
                <li>Click the "Share" button</li>
                <li>Select who you want to share with</li>
                <li>Choose the permission level (View, Edit, etc.)</li>
                <li>Click "Share" to send the invitation</li>
              </ol>
            </div>
          </section>

          {/* Best Practices */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Use consistent naming conventions for your files</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Organize documents in logical folder structures</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Add descriptions to folders for better discoverability</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0A3A5C] font-bold">✓</span>
                <span>Review sharing permissions regularly</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <Link href="/help">
            <Button variant="outline">← Back to Help</Button>
          </Link>
          <Link href="/dashboard/documents">
            <Button className="bg-[#0A3A5C] hover:bg-[#0A3A5C]/90">Go to Documents</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
