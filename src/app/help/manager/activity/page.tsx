"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Activity, FileText, Filter, Clock } from "lucide-react";

export default function ManagerActivityHelpPage() {
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
            <Activity className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Log Guide</h1>
              <p className="text-gray-600 mt-1">Track document activities and client interactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Log Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                The Activity Log shows all actions and interactions related to your clients and their documents. This
                includes uploads, downloads, shares, and other important events.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>View document uploads and downloads</li>
                <li>Track when documents are shared with clients</li>
                <li>See folder creation and modifications</li>
                <li>Monitor all activities related to your assigned clients</li>
                <li>Filter activities by date, type, and client</li>
              </ul>
            </div>
          </section>

          {/* Accessing Activity Log */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-600" />
              Accessing the Activity Log
            </h2>
            <div className="space-y-4 text-gray-700">
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Dashboard → Activity</li>
                <li>You will see a log of all activities for your assigned clients</li>
                <li>Activities are listed in reverse chronological order (newest first)</li>
                <li>Each entry shows the timestamp, action type, and related document/folder</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>As a Manager:</strong> You only see activities related to your assigned clients and their
                  documents. You cannot see activities for clients assigned to other managers.
                </p>
              </div>
            </div>
          </section>

          {/* Activity Types */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Types</h2>
            <div className="space-y-4 text-gray-700">
              <p>The activity log tracks the following types of events:</p>
              <div className="space-y-3 mt-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Document Upload</h3>
                  <p>When a document is uploaded to a client's folder</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Document Download</h3>
                  <p>When a document is downloaded from a client's folder</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Document Shared</h3>
                  <p>When a folder or document is shared with an external recipient via email</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Folder Created</h3>
                  <p>When a new folder is created for a client</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Document Deleted</h3>
                  <p>When a document is permanently deleted</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Comment Added</h3>
                  <p>When a comment is added to a document</p>
                </div>
              </div>
            </div>
          </section>

          {/* Filtering Activities */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-6 h-6 text-amber-600" />
              Filtering and Searching Activities
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>You can refine the activity log to find specific information:</p>
              <h3 className="font-semibold text-gray-900 mt-4">By Client</h3>
              <ol className="list-decimal list-inside space-y-3">
                <li>Click the "Organization/Client" dropdown at the top</li>
                <li>Select a specific client to filter activities for that client only</li>
                <li>Leave blank to see activities from all your clients</li>
              </ol>
              <h3 className="font-semibold text-gray-900 mt-4">By Date</h3>
              <p>Look for date filters or sort options to find activities from a specific time period</p>
              <h3 className="font-semibold text-gray-900 mt-4">By Activity Type</h3>
              <p>Some views allow you to filter by activity type (uploads, downloads, shares, etc.)</p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Combine multiple filters to find exactly what you're looking for. For example,
                  filter by a specific client and date range to see recent activities.
                </p>
              </div>
            </div>
          </section>

          {/* Reading Activity Details */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-600" />
              Understanding Activity Details
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Each activity log entry typically shows:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Timestamp:</strong> When the activity occurred (date and time)
                </li>
                <li>
                  <strong>Activity Type:</strong> What happened (upload, download, share, etc.)
                </li>
                <li>
                  <strong>User:</strong> Who performed the action (you, the client, or system)
                </li>
                <li>
                  <strong>Document/Folder:</strong> Which item the activity relates to
                </li>
                <li>
                  <strong>Client:</strong> The client associated with the activity
                </li>
                <li>
                  <strong>Details:</strong> Additional information about the action
                </li>
              </ul>
            </div>
          </section>

          {/* Using Activity for Business Intelligence */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Using Activity for Insights</h2>
            <div className="space-y-4 text-gray-700">
              <p>The Activity Log provides valuable insights into your client relationships:</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">→</span>
                  <span>
                    <strong>Client Engagement:</strong> Monitor download activity to see when clients are accessing
                    documents
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">→</span>
                  <span>
                    <strong>Document Usage:</strong> Track which documents are most frequently accessed
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">→</span>
                  <span>
                    <strong>Compliance Tracking:</strong> Maintain audit trails of all document activities
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">→</span>
                  <span>
                    <strong>Issue Identification:</strong> Quickly spot unusual patterns or missing activities
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Best Practices */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Review activity logs regularly to stay updated on client interactions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Use filters to focus on specific clients or time periods</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Track when clients download documents to ensure they're receiving important information</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Monitor shares to confirm successful external communications</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Keep activity logs for audit and compliance purposes</span>
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
                    <td className="px-4 py-2 font-medium">View Activity Log</td>
                    <td className="px-4 py-2">Dashboard → Activity</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Filter by Client</td>
                    <td className="px-4 py-2">Click Organization/Client dropdown → Select client</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">View Recent Activity</td>
                    <td className="px-4 py-2">Activity log shows newest entries first (reverse chronological)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Check Client Engagement</td>
                    <td className="px-4 py-2">Filter by client → Look for download activities</td>
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
          <Link href="/dashboard/activity">
            <Button className="bg-amber-600 hover:bg-amber-700">Go to Activity Log</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
