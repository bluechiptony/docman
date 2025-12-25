import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityLog } from "@/lib/activity-log.service";
import { ActivityLogItem } from "./ActivityLogItem";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityLogListProps {
  logs: ActivityLog[];
  loading?: boolean;
  showDocument?: boolean;
  showFolder?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
  className?: string;
}

export function ActivityLogList({
  logs,
  loading = false,
  showDocument = true,
  showFolder = true,
  hasMore = false,
  onLoadMore,
  emptyMessage = "No activity yet",
  className = "",
}: ActivityLogListProps) {
  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-1">
        {logs.map((log) => (
          <ActivityLogItem key={log.id} log={log} showDocument={showDocument} showFolder={showFolder} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
