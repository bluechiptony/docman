"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Building2, Users, FolderOpen, Share2 } from "lucide-react";

export default function ClientsHelpPage() {
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
            <Building2 className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Management Guide</h1>
              <p className="text-gray-600 mt-1">Create and manage clients, assign folders, and share documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Management Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Clients represent external organizations or entities that your team manages documents for. Each client
                can have folders assigned to them, and managers can share documents with their assigned clients.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Create clients to represent external organizations</li>
                <li>Assign folders to clients for document organization</li>
                <li>Assign clients to managers for responsibility delegation</li>
                <li>Share documents with clients via secure external links</li>
              </ul>
            </div>
          </section>

          {/* Creating Clients */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-red-600" />
              Creating Clients
            </h2>
            <div className="space-y-4 text-gray-700">
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Dashboard → Clients</li>
                <li>Click "Create Client"</li>
                <li>Enter the client name (e.g., "Acme Corp", "Blue Sky Inc.")</li>
                <li>Click "Create"</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Use clear, recognizable client names that your team will easily identify. You
                  can create as many clients as you need.
                </p>
              </div>
            </div>
          </section>

          {/* Assigning Folders to Clients */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-red-600" />
              Assigning Folders to Clients
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Folders organize documents by client. Each client can have multiple folders assigned to them. This helps
                organize documents and control what each manager or team sees.
              </p>
              <h3 className="font-semibold text-gray-900 mt-4">How to Assign Folders</h3>
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Dashboard → Clients</li>
                <li>Find the client and click "Assign folders"</li>
                <li>In the dialog, check the folders that belong to this client</li>
                <li>Uncheck folders to remove them from the client</li>
                <li>Click "Save" to confirm</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> You can assign multiple folders to a single client. Each folder should represent
                  a logical grouping of documents for that client.
                </p>
              </div>
            </div>
          </section>

          {/* Assigning Clients to Managers */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-red-600" />
              Assigning Clients to Managers
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Managers are responsible for handling documents for their assigned clients. When you assign a client to
                a manager, that manager can view, upload, and manage documents for that client.
              </p>
              <h3 className="font-semibold text-gray-900 mt-4">How to Assign Clients to Managers</h3>
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Dashboard → User Management</li>
                <li>Open the "Client Assignments" tab</li>
                <li>In "Assign Client to Manager", select a manager from the dropdown</li>
                <li>Select a client from the client dropdown</li>
                <li>Click "Assign"</li>
              </ol>
              <h3 className="font-semibold text-gray-900 mt-4">Removing Client Assignments</h3>
              <p>To remove a client from a manager:</p>
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Dashboard → User Management</li>
                <li>Open the "Client Assignments" tab</li>
                <li>Find the manager in the list</li>
                <li>
                  Click the <strong>X</strong> next to the client badge to remove the assignment
                </li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> A manager can be assigned to multiple clients. This allows one manager to
                  oversee multiple client relationships.
                </p>
              </div>
            </div>
          </section>

          {/* Sharing Documents with Clients */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-red-600" />
              Sharing Documents with Clients
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                You can share client folders and documents via secure email links (Exshare) with external recipients
                without requiring them to create an account.
              </p>
              <h3 className="font-semibold text-gray-900 mt-4">How to Share a Client Folder</h3>
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Dashboard → Clients</li>
                <li>Right-click on a client row (or use context menu)</li>
                <li>Select "Share via Email (Exshare)"</li>
                <li>Enter recipient email address(es)</li>
                <li>Choose permission level (View or Edit)</li>
                <li>Click "Send"</li>
              </ol>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> Recipients will receive an email with a secure link and one-time passcode (OTP)
                  for access. Links expire after a configurable period (default: 7 days).
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
                <span>Use clear, consistent client naming conventions (e.g., include company name and location)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>
                  Organize folders logically before assigning to clients (by project, time period, or category)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Ensure one manager is assigned to each client for clear responsibility</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Review client and manager assignments quarterly to ensure they're still current</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Use Exshare for sensitive documents that require secure external sharing</span>
              </li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Manager doesn't see their assigned clients</h3>
                <p>
                  <strong>Solution:</strong> Ensure the client assignment has been created in User Management → Client
                  Assignments tab. The manager may need to refresh their browser to see the new assignment.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can't find folders to assign to a client</h3>
                <p>
                  <strong>Solution:</strong> Folders must be created first in Documents → New Folder. Only existing
                  folders can be assigned to clients.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">External share link not working</h3>
                <p>
                  <strong>Solution:</strong> Check that the link has not expired (default 7 days). You can extend the
                  expiry or create a new share link from the Clients page.
                </p>
              </div>
            </div>
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
                    <td className="px-4 py-2 font-medium">Create Client</td>
                    <td className="px-4 py-2">Clients → Create Client → Enter name → Create</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Assign Folders</td>
                    <td className="px-4 py-2">Clients → Select client → Assign folders → Check folders → Save</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Assign to Manager</td>
                    <td className="px-4 py-2">
                      User Management → Client Assignments → Select manager & client → Assign
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Share with External</td>
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
            <Button className="bg-red-600 hover:bg-red-700">Go to Clients</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
