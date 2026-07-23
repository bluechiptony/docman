import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { passwordStrength } from "@/lib/password-policy";

export function PasswordStrength({
  password,
  className,
}: {
  password: string;
  className?: string;
}) {
  const { score, results } = passwordStrength(password);
  const strength =
    score === 4
      ? { label: "Strong", color: "bg-green-600", text: "text-green-700" }
      : score >= 2
        ? { label: "Medium", color: "bg-amber-500", text: "text-amber-700" }
        : { label: "Weak", color: "bg-red-500", text: "text-red-600" };

  return (
    <div className={cn("space-y-2 rounded-md border bg-muted/20 p-3", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Password strength</span>
        <span className={cn("font-semibold", password ? strength.text : "text-muted-foreground")}>
          {password ? strength.label : "Enter a password"}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              "h-1.5 rounded-full bg-muted",
              password && score >= step && strength.color,
            )}
          />
        ))}
      </div>
      <ul className="grid gap-1 text-xs sm:grid-cols-2">
        {results.map((requirement) => (
          <li
            key={requirement.id}
            className={cn(
              "flex items-center gap-1.5",
              requirement.met ? "text-green-700" : "text-muted-foreground",
            )}
          >
            {requirement.met ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" />
            )}
            {requirement.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
