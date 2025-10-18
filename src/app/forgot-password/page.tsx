import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 pb-20 gap-16 sm:p-20 bg-radial-blue">
      <div className="w-1/4">
        <Card className="p-4">
          <h1 className="text-center  text-black text-2xl ">Recover Your Account</h1>
          <div className="">
            <Label className="m-1">Email address</Label>
            <Input placeholder="jon.snow@winterfell.co.we" type="email" />
          </div>
          <div className="">
            <span className="m-1 block text-xs text-right">
              Don't need this now?{" "}
              <Link href={"/"} className="text-blue-600 hover:text-blue-800">
                Go Back
              </Link>
            </span>
          </div>
          <div className="p-1">
            <Button className="w-full cursor-pointer">Recover Account</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
