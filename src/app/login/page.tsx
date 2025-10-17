import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="w-1/4">
        <Card className="p-4">
          <h1 className="text-center  text-black text-2xl ">Log in to your account</h1>
          <div className="">
            <Label className="m-1">Email address</Label>
            <Input placeholder="jon.snow@winterfell.co.we" type="email" />
          </div>
          <div className="">
            <Label className="m-1">Password</Label>
            <Input placeholder="S3<u7e94$sw02D" type="password" className="outline-none focus:outline-none" />
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
            <Link href={"/dashboard"}>
              <Button className="w-full cursor-pointer">Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
