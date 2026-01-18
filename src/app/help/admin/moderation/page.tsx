"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Eye, CheckCircle, XCircle, Filter } from "lucide-react";

export default function ModerationHelpPage() {
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
            <Eye className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moderation Guide</h1>
              <p className="text-gray-600 mt-1">Review, approve, and manage content moderation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Moderation Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                The Moderation dashboard helps administrators review, approve, and manage documents that require
                approval before they can be shared or published.
              </p>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900">
                  <strong>Admin Only:</strong> Moderation features are only available to administrators.
                </p>
              </div>
            </div>
          </section>

          {/* Pending Review */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-red-600" />
              Reviewing Documents
            </h2>
            <div className="space-y-6 text-gray-700">
              <p>Documents pending review appear in the Moderation queue. To review a document:</p>
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Moderation from the dashboard</li>
                <li>Select a document from the pending review queue</li>
                <li>Review the document content and metadata</li>
                <li>Check the submission details and notes</li>
                <li>Make your decision (Approve or Reject)</li>
              </ol>
            </div>
          </section>

          {/* Approval Process */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Approving Documents
            </h2>
            <div className="space-y-6">
              <div className="text-gray-700">
                <p className="mb-4">When you approve a document:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>The document becomes publicly visible/shareable</li>
                  <li>The submitter receives an approval notification</li>
                  <li>The document is removed from the pending queue</li>
                  <li>The approval is logged in the audit trail</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900">
                  <strong>Tip:</strong> Add a comment when approving to let the submitter know feedback or next steps.
                </p>
              </div>
            </div>
          </section>

          {/* Rejecting Documents */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />
              Rejecting Documents
            </h2>
            <div className="space-y-6">
              <div className="text-gray-700">
                <p className="mb-4">When you reject a document:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>The document returns to the submitter for revision</li>
                  <li>A rejection reason/comment is sent to the submitter</li>
                  <li>The document remains in draft status</li>
                  <li>The rejection is logged in the audit trail</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Important:</strong> Always provide clear feedback when rejecting a document so the submitter
                  knows how to fix it.
                </p>
              </div>
            </div>
          </section>

          {/* Filtering & Search */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-6 h-6 text-red-600" />
              Filtering & Searching
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Use filters to find documents more efficiently:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Filter by status (Pending, Approved, Rejected)</li>
                <li>Filter by submission date</li>
                <li>Filter by document type</li>
                <li>Search by document name or submitter</li>
                <li>Filter by priority level</li>
              </ul>
            </div>
          </section>

          {/* Moderation Queue */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing the Moderation Queue</h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Priority Levels</h3>
                <p>Documents can be marked with priority levels:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>🔴 High: Requires immediate review</li>
                  <li>🟡 Medium: Standard review timeline</li>
                  <li>🟢 Low: Can be reviewed at your discretion</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Batch Actions</h3>
                <p>You can perform batch actions on multiple documents:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Approve multiple documents at once</li>
                  <li>Reject multiple documents with same feedback</li>
                  <li>Reassign to another moderator</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Audit Trail */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Audit Trail & History</h2>
            <div className="space-y-4 text-gray-700">
              <p>All moderation actions are logged:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Who approved/rejected the document</li>
                <li>When the action occurred</li>
                <li>Approval/rejection comments</li>
                <li>Any revisions submitted by the author</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Review the audit trail to understand the document's review history and any
                  issues that occurred.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Moderation Best Practices</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Review documents promptly to avoid bottlenecks</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Provide clear, constructive feedback when rejecting</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Prioritize high-priority documents</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Maintain consistency in approval criteria</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Document your moderation policies for reference</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Regularly review the audit trail for compliance</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <Link href="/help">
            <Button variant="outline">← Back to Help</Button>
          </Link>
          <Link href="/dashboard/moderation">
            <Button className="bg-red-600 hover:bg-red-700">Go to Moderation</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
