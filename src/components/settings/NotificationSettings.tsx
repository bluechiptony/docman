"use client";

import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function NotificationSettings() {
  const [email, setEmail] = useLocalStorage("settings.notifyEmail", true);
  const [push, setPush] = useLocalStorage("settings.notifyPush", false);

  return (
    <div className="space-y-4 py-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">Email Notifications</p>
          <p className="text-sm text-gray-500">Get updates via email about document activity.</p>
        </div>
        <Switch checked={email} onCheckedChange={setEmail} />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">Push Notifications</p>
          <p className="text-sm text-gray-500">Receive real-time alerts on this device.</p>
        </div>
        <Switch checked={push} onCheckedChange={setPush} />
      </div>
    </div>
  );
}
