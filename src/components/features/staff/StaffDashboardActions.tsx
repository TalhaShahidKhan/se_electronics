"use client";

import { useState } from "react";
import PaymentRequestModal from "./PaymentRequestModal";

interface StaffDashboardActionsProps {
  staffId: string;
  serviceId: string;
}

export default function StaffDashboardActions({
  staffId,
  serviceId,
}: StaffDashboardActionsProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPaymentModal(true)}
        className="text-green-600 hover:text-green-800 text-sm font-bold underline underline-offset-2"
      >
        Request Payment
      </button>

      {showPaymentModal && (
        <PaymentRequestModal
          staffId={staffId}
          serviceId={serviceId}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
}
