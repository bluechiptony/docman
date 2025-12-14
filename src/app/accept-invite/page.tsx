"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error("Invalid invite link - no token provided");
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/auth/validate-invite?token=${token}`);
        setEmail(response.data.email);
        setTokenValid(true);
      } catch (error: unknown) {
        const err = error as any;
        const message = err.response?.data?.message || "Invalid or expired invite link";
        toast.error(message);
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error("Please enter your first name");
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error("Please enter your last name");
      return false;
    }
    if (!formData.password) {
      toast.error("Please enter a password");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await apiClient.post("/auth/accept-invite", {
        token,
        email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
      });

      toast.success("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: unknown) {
      const err = error as any;
      const message = err.response?.data?.message || "Failed to create account. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Validating invite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid || !email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>The invite link is invalid or has expired</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              If you believe this is an error, please contact your administrator.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle>Complete Your Account Setup</CardTitle>
          </div>
          <CardDescription>You&apos;ve been invited to join. Create your account to get started.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Display */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registered Email</p>
              <p className="text-sm font-medium mt-1">{email}</p>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={submitting}
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={submitting}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={submitting}
                required
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={submitting}
                required
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
