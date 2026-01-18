"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Formik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

const ForgotPasswordSchema = Yup.object().shape({
  emailAddress: Yup.string().email("Invalid email address").required("Email is required"),
});

export default function ForgotPasswordComponent() {
  const initialValues = { emailAddress: "" };
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (values: { emailAddress: string }) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/forgot-password", {
        emailAddress: values.emailAddress,
      });

      toast.success(response.data.message || "Password reset link sent!");
      setSubmitted(true);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to send reset link. Please try again.");
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
          backgroundImage: "url(/images/doc_man_1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-semibold">🏠</span>
          </div>
          <span className="text-white text-xl font-semibold">
            Docman &nbsp;
            <span className="text-xs italic font-light">For VLA</span>
          </span>
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
          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Recover Your Account</h1>
                <p className="text-gray-600">Enter your email to reset your password</p>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={ForgotPasswordSchema}
                onSubmit={(values) => {
                  handleFormSubmit(values);
                }}
              >
                {({ values, handleChange, handleBlur, handleSubmit, errors, touched }) => (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                      <Input
                        placeholder="info.machu786@gmail.com"
                        type="email"
                        value={values.emailAddress}
                        onChange={handleChange("emailAddress")}
                        onBlur={handleBlur("emailAddress")}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.emailAddress && touched.emailAddress && (
                        <span className="text-sm text-red-500">{errors.emailAddress}</span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    {/* Back to Login */}
                    <p className="text-center text-sm text-gray-600 pt-4">
                      Remember your password?{" "}
                      <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                        Back to Login
                      </Link>
                    </p>
                  </form>
                )}
              </Formik>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <div className="text-4xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-4">
                  We've sent you a password reset link. Please check your email and click the link to proceed.
                </p>
              </div>
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
