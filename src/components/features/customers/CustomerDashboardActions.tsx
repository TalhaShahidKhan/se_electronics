"use client";

import { useState } from "react";
import ContactAdminModal from "./ContactAdminModal";
import ReportStaffModal from "./ReportStaffModal";

interface CustomerDashboardActionsProps {
  customerId: string;
  assignedStaff?: {
    staffId: string;
    name: string;
    serviceId: string;
  };
}

export default function CustomerDashboardActions({
  customerId,
  assignedStaff,
}: CustomerDashboardActionsProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2">
        {assignedStaff && (
          <button
            onClick={() => setShowReportModal(true)}
            className="text-red-500 hover:text-red-700 text-xs font-semibold underline underline-offset-2 text-left"
          >
            Report this staff
          </button>
        )}
        <button
          onClick={() => setShowContactModal(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold text-left"
        >
          Contact Admin
        </button>
      </div>

      {showContactModal && (
        <ContactAdminModal
          customerId={customerId}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {showReportModal && assignedStaff && (
        <ReportStaffModal
          customerId={customerId}
          staffId={assignedStaff.staffId}
          staffName={assignedStaff.name}
          serviceId={assignedStaff.serviceId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
}
