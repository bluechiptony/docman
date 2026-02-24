"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Building2, FileText, Share2 } from "lucide-react";

export default function ManagerClientsHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/help" className="flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Help
          </Link>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Clients Guide</h1>
              <p className="text-gray-600 mt-1">Understand your client assignments and manage their documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Role as a Manager</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                As a manager, you are responsible for handling documents and communications with your assigned clients.
                Each client has folders assigned to them where you can upload, organize, and manage their documents.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>View your assigned clients in the Clients dashboard</li>
                <li>Upload and manage documents for each client</li>
                <li>Share client folders and documents securely via email</li>
                <li>Track activity and interactions with your clients</li>
              </ul>
            </div>
          </section>

          {/* Viewing Your Clients */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-600" />
              Viewing Your Assigned Clients
            </h2>
            <div className="space-y-4 text-gray-700">
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Dashboard → Clients</li>
                <li>You will see a list of clients assigned to you</li>
                <li>Each client shows their assigned folders</li>
                <li>Click on a client to view or manage their folders</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> You can only see clients that have been assigned to you by an administrator.
                  Contact your admin if you don't see a client you should have access to.
                </p>
              </div>
            </div>
          </section>

          {/* Managing Client Documents */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-600" />
              Managing Client Documents
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Each client has folders assigned to them. You can upload documents to these folders, organize them, and
                apply folder requirements.
              </p>
              <h3 className="font-semibold text-gray-900 mt-4">Uploading Documents</h3>
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Dashboard → Documents</li>
                <li>Select the folder belonging to your client</li>
                <li>Click "Upload" to add documents</li>
                <li>Select files from your computer and upload</li>
              </ol>
              <h3 className="font-semibold text-gray-900 mt-4">Creating Folders</h3>
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Dashboard → Documents</li>
                <li>Click "New Folder"</li>
                <li>Enter a folder name</li>
                <li>Select the client to assign the folder to</li>
                <li>Optionally apply folder required documents</li>
                <li>Click "Create"</li>
              </ol>
            </div>
          </section>

          {/* Sharing with Clients */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-amber-600" />
              Sharing Documents with Clients
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                You can share client folders via secure email links without requiring them to create an account. This
                allows clients to view and download documents securely.
              </p>
              <h3 className="font-semibold text-gray-900 mt-4">Share a Folder via Email (Exshare)</h3>
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Dashboard → Clients</li>
                <li>Find the client whose folder you want to share</li>
                <li>Right-click on the client row (or use context menu)</li>
                <li>Select "Share via Email (Exshare)"</li>
                <li>Enter the recipient's email address</li>
                <li>Choose permission level (View or Edit)</li>
                <li>Click "Send"</li>
              </ol>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Security Tip:</strong> Recipients receive a one-time passcode (OTP) in their email. This
                  ensures only the intended recipient can access the shared documents. Links expire after 7 days by
                  default.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices for Managers</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Keep your client folders organized with clear naming conventions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Upload documents promptly to keep clients informed</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Use folder required documents to maintain consistent intake requirements</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Share documents regularly with clients to maintain communication</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Monitor activity logs to track client interactions</span>
              </li>
            </ul>
          </section>

          {/* Quick Reference */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Reference Card</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Task</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Steps</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-2 font-medium">View My Clients</td>
                    <td className="px-4 py-2">Dashboard → Clients (shows assigned clients)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Upload Documents</td>
                    <td className="px-4 py-2">Documents → Select folder → Upload</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Create Folder</td>
                    <td className="px-4 py-2">Documents → New Folder → Enter name → Select client → Create</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Share with Client</td>
                    <td className="px-4 py-2">Clients → Right-click client → Share via Email → Enter email → Send</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <Link href="/help">
            <Button variant="outline">← Back to Help</Button>
          </Link>
          <Link href="/dashboard/clients">
            <Button className="bg-amber-600 hover:bg-amber-700">Go to My Clients</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
