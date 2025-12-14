"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/providers/auth.provider";
import { useRouter } from "next/navigation";

const LoginSchema = Yup.object().shape({
  emailAddress: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginComponent() {
  const { login } = useAuth();
  const router = useRouter();
  const initialValues = { emailAddress: "", password: "" };
  
  async function handleFormSubmit(values: { emailAddress: string; password: string }) {
    try {
      await login(values.emailAddress, values.password);
    } catch (error) {
      // Error is handled in the auth provider with toast
      console.error("Login error:", error);
    }
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 pb-20 gap-16 sm:p-20 bg-radial-blue">
      <div className="w-1/4">
        <Card className="p-4 rounded-sm">
          <h1 className="text-center  text-black text-2xl ">Log in to your account</h1>
          <Formik
            initialValues={initialValues}
            onSubmit={(values) => {
              handleFormSubmit(values);
            }}
          >
            {({ values, handleChange, handleBlur, handleSubmit, errors, touched }) => (
              <>
                <div className="">
                  <Label className="m-1">Email address</Label>
                  <Input
                    placeholder="jon.snow@winterfell.co.we"
                    type="email"
                    value={values.emailAddress}
                    onChange={handleChange("emailAddress")}
                    onBlur={handleBlur("emailAddress")}
                    className="outline-none focus:outline-none focus-visible:ring-blue-300 focus-visible:ring-1"
                  />
                  {errors.emailAddress && touched.emailAddress && (
                    <span className="block text-tiny text-red-500">{errors.emailAddress}</span>
                  )}
                </div>
                <div className="">
                  <Label className="m-1">Password</Label>
                  <Input
                    placeholder="S3<u7e94$sw02D"
                    type="password"
                    value={values.password}
                    onChange={handleChange("password")}
                    onBlur={handleBlur("password")}
                    className="outline-none focus:outline-none focus-visible:ring-blue-300 focus-visible:ring-1"
                  />
                  {errors.password && touched.password && (
                    <span className="block text-tiny text-red-500">{errors.password}</span>
                  )}
                </div>
                <div className="">
                  <span className="m-1 block text-xs text-right">
                    Forgot your Password?{" "}
                    <Link href={"forgot-password"} className="text-blue-600 hover:text-blue-800">
                      Recover Here
                    </Link>
                  </span>
                </div>
                <div className="p-1">
                  <Button 
                    type="button"
                    className="w-full cursor-pointer" 
                    onClick={() => handleSubmit()}
                  >
                    Login
                  </Button>
                </div>
              </>
            )}
          </Formik>
        </Card>
      </div>
    </div>
  );
}
