import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ActivateAccountComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 pb-20 gap-16 sm:p-20 bg-radial-blue">
      <div className="w-1/4">
        <Card className="p-4 rounded-sm">
          <h1 className="text-center  text-black text-2xl ">Activate Your Account</h1>
          <span className="text-center  text-gray-600 text-2xl ">Activate Your Account</span>
          <div className="">
            <Label className="m-1">Password</Label>
            <Input
              placeholder="S3<u7e94$sw02D"
              type="password"
              className="outline-none focus:outline-none focus-visible:ring-blue-300 focus-visible:ring-1"
            />
          </div>
          <div className="">
            <Label className="m-1">Confirm Password</Label>
            <Input
              placeholder="S3<u7e94$sw02D"
              type="password"
              className="outline-none focus:outline-none focus-visible:ring-blue-300 focus-visible:ring-1"
            />
          </div>

          <div className="p-1">
            <Link href={"/dashboard"}>
              <Button className="w-full cursor-pointer">Set Password</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
