"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePersistentState } from "@/hooks/usePersistentState";

export default function AppearanceSettings() {
  const [theme, setTheme] = usePersistentState("appearance_theme", "light");
  const [accent, setAccent] = usePersistentState("appearance_accent", "amber");
  const [fontScale, setFontScale] = usePersistentState("appearance_fontScale", [100]);
  const [compactMode, setCompactMode] = usePersistentState("appearance_compact", false);

  const handleSave = () => {
    alert("Appearance settings saved!");
    console.log({ theme, accent, fontScale, compactMode });
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme */}
        <div className="flex items-center justify-between">
          <Label htmlFor="theme" className="w-1/3">
            Theme
          </Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-2/3">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Accent Color */}
        <div className="flex items-center justify-between">
          <Label htmlFor="accent" className="w-1/3">
            Accent Color
          </Label>
          <Select value={accent} onValueChange={setAccent}>
            <SelectTrigger className="w-2/3">
              <SelectValue placeholder="Select accent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amber">Amber</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
              <SelectItem value="red">Red</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="flex items-center justify-between">
          <Label htmlFor="fontScale" className="w-1/3">
            Font Size
          </Label>
          <div className="flex flex-col w-2/3">
            <Slider id="fontScale" min={80} max={150} step={10} value={fontScale} onValueChange={setFontScale} />
            <span className="text-xs text-gray-500 mt-1">{fontScale[0]}%</span>
          </div>
        </div>

        {/* Compact Mode */}
        <div className="flex items-center justify-between">
          <Label htmlFor="compactMode" className="w-1/3">
            Compact Mode
          </Label>
          <Switch id="compactMode" checked={compactMode} onCheckedChange={setCompactMode} />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
