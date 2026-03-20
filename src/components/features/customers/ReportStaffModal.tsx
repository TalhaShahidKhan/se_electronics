"use client";

import { submitComplaint } from "@/actions/complaintActions";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ReportStaffModalProps {
  customerId: string;
  staffId: string;
  staffName: string;
  serviceId?: string;
  onClose: () => void;
}

export default function ReportStaffModal({
  customerId,
  staffId,
  staffName,
  serviceId,
  onClose,
}: ReportStaffModalProps) {
  const [state, action, isPending] = useActionState(submitComplaint, undefined);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onClose();
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 text-center">
            Report Issue with Staff
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-sm text-red-700 font-semibold mb-1">
            Reporting Staff:
          </p>
          <p className="text-sm font-bold text-red-900">
            {staffName} ({staffId})
          </p>
          {serviceId && (
            <p className="text-sm text-red-600 mt-1">Service ID: {serviceId}</p>
          )}
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="customerId" value={customerId} />
          <input type="hidden" name="staffId" value={staffId} />
          {serviceId && (
            <input type="hidden" name="serviceId" value={serviceId} />
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Unprofessional behavior"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about your experience..."
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-red-500 outline-none h-32 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-md text-gray-600 font-bold hover:bg-gray-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-bold hover:bg-red-700 active:scale-95 transition-all disabled:bg-red-300"
            >
              {isPending ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
