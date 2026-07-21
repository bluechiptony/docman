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
  PieChart as PieChartIcon,
  FolderPlus,
  UserPlus,
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
import { QuickActions } from "./QuickActions";
import { useAuth } from "@/providers/auth.provider";
import { getDashboardOverview, getRecentActivity } from "@/lib/dashboard.service";
import { type ActivityLog } from "@/lib/activity-log.service";

type RecentActivityItem = {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  Icon: typeof Upload;
};

type UploadPoint = { day: string; uploads: number };
type DocTypeSlice = { name: string; value: number; color: string };
const RANGE_OPTIONS = [7, 14, 30];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdminOrSupport =
    user?.authentication?.role === "SUPER_ADMIN" || user?.authentication?.role === "ADMINISTRATOR";

  const [stats, setStats] = useState({
    documents: 0,
    users: 0,
    folders: 0,
    storageUsedBytes: 0,
    recentUploads: 0,
  });
  const [activityData, setActivityData] = useState<UploadPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [docTypeData, setDocTypeData] = useState<DocTypeSlice[]>([]);
  const [rangeDays, setRangeDays] = useState<number>(7);

  useEffect(() => {
    if (!user?.selectedOrganization?.id) return;
    let cancelled = false;

    const loadOverview = async () => {
      setOverviewLoading(true);
      setOverviewError(null);
      try {
        const orgId = user?.selectedOrganization?.id;
        if (!orgId) return;

        const overview = await getDashboardOverview(orgId, rangeDays);
        if (!overview || cancelled) return;

        setStats({
          documents: overview.totals.documents,
          users: overview.totals.users,
          folders: overview.totals.folders,
          storageUsedBytes: overview.totals.storageUsedBytes,
          recentUploads: overview.recentUploads,
        });

        setActivityData(
          overview.uploadsPerDay.map((row) => ({
            day: formatDay(row.date),
            uploads: row.uploads,
          })),
        );

        setDocTypeData(assignColors(overview.documentTypeBreakdown));
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard stats";
          setOverviewError(errorMessage);
        }
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    };

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [user?.selectedOrganization?.id, rangeDays]);

  useEffect(() => {
    if (!user?.selectedOrganization?.id) return;
    let cancelled = false;

    const loadRecentActivity = async () => {
      setActivityLoading(true);
      setActivityError(null);
      try {
        const orgId = user?.selectedOrganization?.id;
        if (!orgId) return;
        const logs = await getRecentActivity(orgId, 5);
        if (cancelled) return;
        setRecentActivity(logs.map(mapActivityToItem));
      } catch (err) {
        if (!cancelled) setActivityError("Failed to load recent activity");
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    };

    loadRecentActivity();
    return () => {
      cancelled = true;
    };
  }, [user?.selectedOrganization?.id]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard Overview</h1>

      {/* <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-600">Upload range:</span>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((days) => (
            <button
              key={days}
              onClick={() => setRangeDays(days)}
              className={`rounded-full px-3 py-1 text-sm border ${
                rangeDays === days ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div> */}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Documents"
          value={stats.documents.toLocaleString()}
          icon={<FileText className="text-blue-500" />}
        />
        <StatCard
          title="Total Folders"
          value={stats.folders.toLocaleString()}
          icon={<FolderPlus className="text-indigo-500" />}
        />
        {isAdminOrSupport && (
          <StatCard
            title="Active Users"
            value={stats.users.toLocaleString()}
            icon={<Users className="text-green-500" />}
          />
        )}
        {isAdminOrSupport && (
          <StatCard
            title="Storage Used"
            value={formatStorageSize(stats.storageUsedBytes)}
            icon={<HardDrive className="text-amber-500" />}
          />
        )}
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
        <RecentActivity data={recentActivity} loading={activityLoading} error={activityError} />

        {/* Document Type Breakdown */}
        <DocumentTypeBreakdown data={docTypeData} loading={overviewLoading} error={overviewError} />
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

function formatStorageSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function RecentActivity({
  data,
  loading,
  error,
}: {
  data: RecentActivityItem[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-gray-500">Loading activity...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-red-500">{error}</CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-gray-500">No recent activity yet</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-gray-100">
        {data.map((activity) => {
          const Icon = activity.Icon;
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
                      {activity.action} <strong>{activity.target}</strong>
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

const actionIconMap: Record<string, typeof Upload> = {
  upload: Upload,
  create: FolderPlus,
  update: Edit3,
  delete: Trash2,
  share: UserPlus,
};

function mapActivityToItem(log: ActivityLog): RecentActivityItem {
  const fullName = [log.user?.firstName, log.user?.lastName].filter(Boolean).join(" ") || "Someone";
  const actionLabel = formatAction(log.action);
  const target = log.document?.name || log.folder?.name || "item";
  const Icon = actionIconMap[log.action?.toLowerCase?.()] || Upload;

  return {
    id: log.id,
    user: fullName,
    action: actionLabel,
    target,
    time: formatTime(log.createdAt),
    Icon,
  };
}

function formatAction(action: string) {
  if (!action) return "did something to";
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

const colorPalette = ["#3b82f6", "#16a34a", "#f59e0b", "#f97316", "#a855f7", "#0ea5e9", "#ef4444"];

function assignColors(breakdown: { name: string; value: number }[]): DocTypeSlice[] {
  return breakdown.map((item, index) => ({
    ...item,
    color: colorPalette[index % colorPalette.length],
  }));
}

function formatDay(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function DocumentTypeBreakdown({
  data,
  loading,
  error,
}: {
  data: DocTypeSlice[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="text-blue-500" size={20} /> Document Type Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-gray-500">Loading breakdown...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="text-blue-500" size={20} /> Document Type Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-red-500">{error}</CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="text-blue-500" size={20} /> Document Type Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-gray-500">No document type data yet</CardContent>
      </Card>
    );
  }

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
