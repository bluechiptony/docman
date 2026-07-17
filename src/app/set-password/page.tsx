"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Formik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SetPasswordSchema = Yup.object().shape({
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function SetPasswordComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const initialValues = { password: "", confirmPassword: "" };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      toast.error("Invalid reset link. Please request a new password reset.");
      router.push("/forgot-password");
    } else {
      setToken(tokenParam);
    }
  }, [router]);

  const handleFormSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (!token) {
      toast.error("No reset token found");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/set-password", {
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      toast.success(response.data.message || "Password reset successfully!");

      // Redirect to login after success
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Side - Background Image */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center flex-col justify-between p-12"
        style={{
          backgroundImage: "url(/images/doc_man_3.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-semibold">🏠</span>
          </div>
          <span className="text-white text-xl font-semibold">Realnest</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-white text-5xl font-bold leading-tight">Find your sweet home</h2>
          <p className="text-white text-lg opacity-90">
            Schedule visit in just a few clicks
            <br />
            visits in just a few clicks
          </p>
          <div className="flex gap-2">
            <div className="h-2 w-8 bg-white rounded-full"></div>
            <div className="h-2 w-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Your Password</h1>
            <p className="text-gray-600">Create a strong password to secure your account</p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={SetPasswordSchema}
            onSubmit={(values) => {
              handleFormSubmit(values);
            }}
          >
            {({ values, handleChange, handleBlur, handleSubmit, errors, touched }) => (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Password Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={handleChange("password")}
                      onBlur={handleBlur("password")}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <span className="text-sm text-red-500">{errors.password}</span>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      value={values.confirmPassword}
                      onChange={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <span className="text-sm text-red-500">{errors.confirmPassword}</span>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !token}
                >
                  {loading ? "Resetting Password..." : "Set Password"}
                </Button>

                {/* Back to Login */}
                <p className="text-center text-sm text-gray-600 pt-4">
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                    Back to Login
                  </Link>
                </p>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
