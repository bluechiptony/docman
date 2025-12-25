import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ActivityLog } from "@/lib/activity-log.service";
import {
  FileText,
  Folder,
  Upload,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Share2,
  UserPlus,
  UserMinus,
  Globe,
} from "lucide-react";

interface ActivityLogItemProps {
  log: ActivityLog;
  showDocument?: boolean;
  showFolder?: boolean;
}

export function ActivityLogItem({ log, showDocument = true, showFolder = true }: ActivityLogItemProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // Format as "9 Jun, 3:45 PM"
    const day = d.getDate();
    const month = d.toLocaleString("en", { month: "short" });
    const time = d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} ${month}, ${time}`;
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();

    if (actionLower.includes("upload")) return <Upload className="h-4 w-4 text-blue-500" />;
    if (actionLower.includes("approve")) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (actionLower.includes("reject")) return <XCircle className="h-4 w-4 text-red-500" />;
    if (actionLower.includes("flag")) return <Flag className="h-4 w-4 text-yellow-500" />;
    if (actionLower.includes("review")) return <Eye className="h-4 w-4 text-purple-500" />;
    if (actionLower.includes("share")) return <Share2 className="h-4 w-4 text-indigo-500" />;
    if (actionLower.includes("revoke")) return <UserMinus className="h-4 w-4 text-orange-500" />;
    if (actionLower.includes("public")) return <Globe className="h-4 w-4 text-cyan-500" />;
    if (actionLower.includes("folder")) return <Folder className="h-4 w-4 text-amber-500" />;

    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const formatActionText = (action: string) => {
    // Convert snake_case or SCREAMING_SNAKE_CASE to readable text
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getUserInitials = () => {
    if (!log.user) return "?";
    return `${log.user.firstName?.charAt(0) || ""}${log.user.lastName?.charAt(0) || ""}`;
  };

  const getUserName = () => {
    if (!log.user) return "Unknown User";
    return `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim();
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      {/* Icon */}
      <div className="mt-1 flex-shrink-0">{getActionIcon(log.action)}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{getUserName()}</span>
            <span className="text-sm text-muted-foreground">{formatActionText(log.action)}</span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.createdAt)}</span>
        </div>

        {/* Document/Folder reference */}
        {showDocument && log.document && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>{log.document.name}</span>
          </div>
        )}
        {showFolder && log.folder && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Folder className="h-3 w-3" />
            <span>{log.folder.name}</span>
          </div>
        )}

        {/* Additional details */}
        {log.details && (
          <div className="mt-1 text-xs text-muted-foreground">
            {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
          </div>
        )}
      </div>
    </div>
  );
}
