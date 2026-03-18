import { getComplaintById } from "@/actions/complaintActions";
import { StaffLayout } from "@/components/layout";
import { MobilePageHeader } from "@/components/layout/MobilePageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils";
import { MessageSquare, User, Phone, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StaffComplaintDetailsPage({
  params,
}: {
  params: { complaintId: string };
}) {
  const complaintRes = await getComplaintById(params.complaintId);
  if (!complaintRes.success || !complaintRes.data) {
    notFound();
  }
  const complaint = complaintRes.data;

  return (
    <StaffLayout balance={0}> {/* TODO: Add balance */}
      <MobilePageHeader
        title="Complaint Details"
        backHref="/staff/complaints"
        Icon={MessageSquare}
      />
      <div className="p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4 border-b pb-4">Complaint #{complaint.id.substring(0, 8)}</h2>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2"><User size={16} className="text-gray-500" /> <strong>Customer:</strong> {complaint.customerName}</p>
            <p className="flex items-center gap-2"><Phone size={16} className="text-gray-500" /> <strong>Phone:</strong> {complaint.customerPhone}</p>
            <p className="flex items-center gap-2"><Calendar size={16} className="text-gray-500" /> <strong>Date:</strong> {formatDate(complaint.createdAt)}</p>
            <p className="flex items-center gap-2"><Hash size={16} className="text-gray-500" /> <strong>Service ID:</strong> {complaint.serviceId || "N/A"}</p>
          </div>
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-bold mb-2">Complaint Message:</h4>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{complaint.message}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Take Action</h3>
          <form className="space-y-4">
            <Textarea placeholder="Write your response or notes here..." rows={5} />
            <div className="flex gap-4">
              <Button className="flex-1">Mark as Resolved</Button>
              <Button variant="outline" className="flex-1">Escalate</Button>
            </div>
          </form>
        </div>
      </div>
    </StaffLayout>
  );
}
