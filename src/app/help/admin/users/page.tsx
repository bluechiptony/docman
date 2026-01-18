"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users, Mail, Shield, Trash2 } from "lucide-react";

export default function UsersHelpPage() {
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
            <Users className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management Guide</h1>
              <p className="text-gray-600 mt-1">Manage users, roles, permissions, and access levels</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                As an administrator, you have full control over user management. This includes inviting new users,
                managing roles and permissions, and removing users from your organization.
              </p>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900">
                  <strong>Admin Only:</strong> This section is only available to users with administrator privileges.
                </p>
              </div>
            </div>
          </section>

          {/* Inviting Users */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-red-600" />
              Inviting New Users
            </h2>
            <div className="space-y-4 text-gray-700">
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Settings → Users</li>
                <li>Click the "Invite Users" button</li>
                <li>Enter the email address of the user you want to invite</li>
                <li>Select the user's role (Admin, Manager, Editor, Viewer)</li>
                <li>Click "Send Invitation"</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> You can invite multiple users at once by entering multiple email addresses
                  separated by commas.
                </p>
              </div>
            </div>
          </section>

          {/* User Roles */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              User Roles & Permissions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔴 Admin</h3>
                <p className="text-gray-700 mb-2">
                  Full system access. Can manage users, settings, and all organization data.
                </p>
                <p className="text-sm text-gray-600">Permissions: All</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🟡 Manager</h3>
                <p className="text-gray-700 mb-2">
                  Can manage documents, folders, and teams. Cannot modify system settings or manage other admins.
                </p>
                <p className="text-sm text-gray-600">
                  Permissions: View, Create, Edit, Delete (documents), Invite Users
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🟢 Editor</h3>
                <p className="text-gray-700 mb-2">
                  Can view, create, and edit documents. Cannot delete or modify organization settings.
                </p>
                <p className="text-sm text-gray-600">Permissions: View, Create, Edit (documents)</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔵 Viewer</h3>
                <p className="text-gray-700 mb-2">
                  Read-only access. Can view documents but cannot create, edit, or delete.
                </p>
                <p className="text-sm text-gray-600">Permissions: View only</p>
              </div>
            </div>
          </section>

          {/* Managing Users */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Active Users</h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Changing User Roles</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Go to Settings → Users</li>
                  <li>Find the user and click on their profile</li>
                  <li>Click "Change Role"</li>
                  <li>Select the new role</li>
                  <li>Click "Update"</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Viewing User Activity</h3>
                <p>
                  Click on any user to view their activity log, showing when they accessed documents, made changes, and
                  other important actions.
                </p>
              </div>
            </div>
          </section>

          {/* Removing Users */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-600" />
              Removing Users
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>To remove a user from your organization:</p>
              <ol className="list-decimal list-inside space-y-3">
                <li>Navigate to Settings → Users</li>
                <li>Find the user you want to remove</li>
                <li>Click the menu icon (⋮) next to their name</li>
                <li>Select "Remove User"</li>
                <li>Confirm the action</li>
              </ol>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Warning:</strong> Removing a user will immediately revoke their access. They will not be able
                  to access any documents or organization data.
                </p>
              </div>
            </div>
          </section>

          {/* Pending Invitations */}
          <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Pending Invitations</h2>
            <div className="space-y-4 text-gray-700">
              <p>View all pending invitations in the Users section. You can:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Resend invitations that haven't been accepted</li>
                <li>Cancel pending invitations</li>
                <li>View invitation expiration dates</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Invitations expire after 7 days. If the user hasn't accepted, you can resend the
                  invitation.
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
                <span>Regularly review user roles and permissions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Follow the principle of least privilege - grant only necessary permissions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Immediately remove users who leave the organization</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Keep an audit trail of user changes for compliance</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✓</span>
                <span>Have at least 2-3 administrators for redundancy</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <Link href="/help">
            <Button variant="outline">← Back to Help</Button>
          </Link>
          <Link href="/dashboard/users">
            <Button className="bg-red-600 hover:bg-red-700">Go to User Management</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
