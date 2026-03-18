import { CustomerLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function CustomerComplainPage() {
  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4 flex items-center gap-4">
          <Link href="/customer/profile">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare size={20} className="text-brand" />
            Submit a Complaint
          </h1>
        </div>

        <div className="p-4 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm">
            <p>If you have any issues with our service or products, please let us know. We will try to resolve it as soon as possible.</p>
          </div>

          <form className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="serviceId">Service ID (Optional)</Label>
              <Input type="text" id="serviceId" placeholder="Enter the service ID if applicable" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="complaint">Your Complaint</Label>
              <Textarea id="complaint" placeholder="Describe your issue in detail..." rows={6} />
            </div>
            <Button className="w-full">Submit Complaint</Button>
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
}
