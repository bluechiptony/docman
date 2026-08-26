"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/providers/auth.provider";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const LoginSchema = Yup.object().shape({
  emailAddress: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginComponent() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const initialValues = { emailAddress: "", password: "" };

  async function handleFormSubmit(values: { emailAddress: string; password: string }) {
    try {
      await login(values.emailAddress, values.password);
    } catch (error) {
      // Error is handled in the auth provider with toast
    }
  }

  return (
    <div className="flex h-screen w-full">
      {/* Left Side - Background Image */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center flex-col justify-between p-12"
        style={{
          backgroundImage: "url(/images/doc_man_2.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-semibold">🏠</span>
          </div>
          <span className="text-white text-xl font-semibold">Docman</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-white text-5xl font-bold leading-tight">Manage your documents</h2>
          <p className="text-white text-lg opacity-90">
            The all in one platform to manage your documents
            <br />
            collaborate with your teammates
          </p>
          <div className="flex gap-2">
            <div className="h-2 w-8 bg-white rounded-full"></div>
            <div className="h-2 w-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Docman &nbsp;
              <span className="text-xl italic font-light">For Vic Lawrence And Associates</span>
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={LoginSchema}
            onSubmit={(values) => {
              handleFormSubmit(values);
            }}
          >
            {({ values, handleChange, handleBlur, handleSubmit, errors, touched }) => (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Your Email Address</Label>
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      className="border-gray-300"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                      Remember Me
                    </label>
                  </div>
                  <Link href="forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Login
                </Button>

                {/* Sign Up Link */}
                {/* <p className="text-center text-sm text-gray-600 pt-4">
                  Don't have any account?{" "}
                  <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                    Register
                  </Link>
                </p> */}
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
