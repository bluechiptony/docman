"use client";

import { useState, useEffect, JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  HardDrive,
  Clock,
  Upload,
  Edit3,
  Trash2,
  FileSpreadsheet,
  FileImage,
  PieChart as PieChartIcon,
  FolderPlus,
  UserPlus,
  FileBarChart,
  PlusCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { QuickActions } from "./QuickActions";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDocuments: 1240,
    totalUsers: 87,
    storageUsed: 6.4,
    recentUploads: 12,
  });

  const [activityData] = useState([
    { day: "Mon", uploads: 8 },
    { day: "Tue", uploads: 14 },
    { day: "Wed", uploads: 10 },
    { day: "Thu", uploads: 18 },
    { day: "Fri", uploads: 12 },
    { day: "Sat", uploads: 5 },
    { day: "Sun", uploads: 7 },
  ]);

  const [recentActivity] = useState([
    {
      id: 1,
      user: "Alice Johnson",
      action: "uploaded",
      document: "Project Proposal.pdf",
      time: "2 mins ago",
      icon: Upload,
    },
    { id: 2, user: "David Kim", action: "edited", document: "Company Policy.docx", time: "10 mins ago", icon: Edit3 },
    { id: 3, user: "Maria Lopez", action: "deleted", document: "Old Budget.xlsx", time: "30 mins ago", icon: Trash2 },
    {
      id: 4,
      user: "John Doe",
      action: "uploaded",
      document: "Quarterly Report.pptx",
      time: "1 hour ago",
      icon: Upload,
    },
  ]);

  const [docTypeData] = useState([
    { name: "PDF", value: 520, color: "#3b82f6", icon: FileText },
    { name: "Word", value: 340, color: "#16a34a", icon: FileList },
    { name: "Excel", value: 210, color: "#facc15", icon: FileSpreadsheet },
    { name: "Images", value: 170, color: "#f97316", icon: FileImage },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        recentUploads: prev.recentUploads + Math.floor(Math.random() * 3),
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard Overview</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments.toLocaleString()}
          icon={<FileText className="text-blue-500" />}
        />
        <StatCard
          title="Active Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users className="text-green-500" />}
        />
        <StatCard
          title="Storage Used"
          value={`${stats.storageUsed} GB`}
          icon={<HardDrive className="text-amber-500" />}
        />
        <StatCard title="Recent Uploads" value={stats.recentUploads} icon={<Clock className="text-purple-500" />} />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Upload activity chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Upload Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="uploads" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity data={recentActivity} />

        {/* Document Type Breakdown */}
        <DocumentTypeBreakdown data={docTypeData} />
      </div>
      {/* Recent Activity */}
    </div>
  );
}

/* ----- COMPONENTS ----- */

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: JSX.Element }) {
  return (
    <Card className="bg-white shadow hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function RecentActivity({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-gray-100">
        {data.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600">
                  {activity.user
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {activity.user}{" "}
                    <span className="text-gray-600 font-normal">
                      {activity.action} <strong>{activity.document}</strong>
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              <Icon className="text-gray-400" size={18} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function DocumentTypeBreakdown({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="text-blue-500" size={20} /> Document Type Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
