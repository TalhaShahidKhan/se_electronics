"use client";

import { submitComplaint } from "@/actions/complaintActions";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Download,
  CheckCircle2,
  CloudUpload,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils";

export default function FormalComplainForm({
  customerId,
  staffs,
  customer,
}: {
  customerId: string;
  staffs: any[];
  customer: any;
}) {
  const [state, action, isPending] = useActionState(submitComplaint, undefined);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(state.message);
        if (state.data) {
          setComplaintId(state.data as string);
        }
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  if (state?.success && complaintId) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 sm:p-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Complaint Submitted!
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Your complaint has been formally recorded with Tracking Number{" "}
          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
            {complaintId}
          </span>
          . The management will review it shortly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href={`/customer/complain/doc/${complaintId}`}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all"
          >
            <ExternalLink size={18} />
            View Document
          </Link>
          <Link
            href={`/customer/complain`}
            className="flex items-center justify-center gap-2 bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand/90 transition-all shadow-md"
          >
            Back to Dashboard
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="bg-white shadow-xl rounded-md border border-gray-200 p-8 sm:p-12 flex flex-col w-full font-serif md:font-sans relative"
    >
      <input type="hidden" name="customerId" value={customerId} />

      <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-gray-900 mb-2">
          Service Quality Complaint Form
        </h1>
      </div>

      <div className="mb-8 space-y-1 text-sm text-gray-800">
        <p className="font-bold">To</p>
        <p className="font-bold">
          Head of Administration / Service Quality Officer
        </p>
        <p className="font-bold">SE Electronics Head Office</p>
        <p className="mt-4">
          <span className="font-bold">Subject:</span> Formal Complaint Filing.
        </p>
        <p className="mt-4 text-justify leading-relaxed">
          Sir,
          <br />
          With respect, I would like to formally submit a complaint regarding
          the subject matter mentioned below. Kindly review the provided
          details.
        </p>
      </div>

      {/* Complainee's Information Section */}
      <fieldset className="border border-gray-300 rounded-md p-6 mb-8 bg-gray-50/50">
        <legend className="text-lg font-bold text-gray-800 px-3 uppercase tracking-wider bg-white border border-gray-300 rounded-md py-1">
          Customer's Information
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Customer Name
            </label>
            <div className="w-full bg-white border border-gray-200 p-2.5 rounded-md text-gray-900 shadow-sm font-medium">
              {customer?.name || "N/A"}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Mobile Number
            </label>
            <div className="w-full bg-white border border-gray-200 p-2.5 rounded-md text-gray-900 shadow-sm font-mono">
              {customer?.phone || "N/A"}
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Registered Address
            </label>
            <div className="w-full bg-white border border-gray-200 p-2.5 rounded-md text-gray-900 shadow-sm font-medium">
              {customer?.address || "N/A"}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Customer ID
            </label>
            <div className="w-full bg-white border border-gray-200 p-2.5 rounded-md text-gray-900 shadow-sm font-mono">
              {customerId}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Date of Registration
            </label>
            <div className="w-full bg-white border border-gray-200 p-2.5 rounded-md text-gray-900 shadow-sm font-medium">
              {customer?.createdAt ? formatDate(customer.createdAt) : "N/A"}
            </div>
          </div>
        </div>
        <p className="text-sm text-rose-500 mt-4 font-semibold italic">
          * If you want to change your information, visit your profile.
        </p>
      </fieldset>

      {/* Complaint Details Section */}
      <fieldset className="border border-emerald-300 rounded-md p-6 mb-8 bg-emerald-50/30">
        <legend className="text-lg font-bold text-emerald-800 px-3 uppercase tracking-wider bg-white border border-emerald-300 rounded-md py-1">
          Complaint Details
        </legend>

        <div className="space-y-6 pt-2">
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-md">
            <p className="text-sm font-semibold text-emerald-800 mb-3">
              Specify the accused staff / member using the options below{" "}
              <span className="text-rose-500">*</span>
            </p>
            <select
              name="staffId"
              required
              className="w-full p-3 bg-white border border-emerald-200 rounded-md outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-800 shadow-sm"
            >
              <option value="">-- Choose Accused Staff --</option>
              {staffs.map((staff) => (
                <option key={staff.staffId} value={staff.staffId}>
                  {staff.name} - {staff.role.toUpperCase()} (ID: {staff.staffId}
                  )
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">
                Service ID (Optional)
              </label>
              <input
                type="text"
                name="serviceId"
                placeholder="e.g. SRV-1234..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">
                Complaint Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                required
                placeholder="State the core issue..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">
              Complaint Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              required
              placeholder="Describe the incident, dates, and what happened in descriptive detail..."
              rows={6}
              className="w-full p-3 bg-white border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 resize-y shadow-sm"
            ></textarea>
          </div>

          {/* Upload Evidence */}
          <label className="border border-dashed border-gray-300 rounded-md p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
            <input
              type="file"
              name="evidence"
              accept="image/*"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <CloudUpload
              size={32}
              className={`transition-colors mb-2 ${selectedFile ? "text-emerald-500" : "text-gray-400 group-hover:text-emerald-500"}`}
            />
            <p className="text-sm font-bold text-gray-700">
              {selectedFile ? selectedFile.name : "Upload Evidence"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {selectedFile
                ? "File selected"
                : "(Click here to upload a screenshot or image limit: 5MB)"}
            </p>
          </label>
        </div>
      </fieldset>

      <p className="text-sm text-gray-700 italic mb-8 border-l-4 border-gray-300 pl-3">
        Kindly request to take appropriate action regarding this matter.
      </p>

      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-md shadow-md transition-all active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
        >
          {isPending
            ? "Submitting Application..."
            : "Submit Formal Application"}
        </button>
        <div className="text-center">
          <button
            type="button"
            className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-wider underline underline-offset-4"
          >
            Preview the application
          </button>
        </div>
      </div>
    </form>
  );
}
