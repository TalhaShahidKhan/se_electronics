"use client";

import { CustomerViewModal } from "@/components/features/customers";
import { useState } from "react";
import StaffProfileModal from "./StaffProfileModal";

export default function ProfileLinkButton({
  text,
  customerId,
  staffId,
}: {
  text: string;
  customerId?: string;
  staffId?: string;
}) {
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [showTechnicianInfo, setShowTechnicianInfo] = useState(false);
  return (
    <>
      {showCustomerInfo && (
        <CustomerViewModal
          customerId={customerId}
          onClose={() => setShowCustomerInfo(false)}
        />
      )}
      {showTechnicianInfo && (
        <StaffProfileModal
          staffId={staffId}
          onClose={() => setShowTechnicianInfo(false)}
        />
      )}
      <button
        className="text-blue-500 hover:underline cursor-pointer"
        onClick={() =>
          customerId
            ? setShowCustomerInfo(true)
            : staffId && setShowTechnicianInfo(true)
        }
      >
        {text}
      </button>
    </>
  );
}
