"use client";

import { StaffsType } from "@/types";
import { useState } from "react";
import PaymentForm from "./PaymentForm";
import StaffMembersModal from "../staff/StaffMembersModal";

export default function AddPaymentButton() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showStaffMembers, setShowStaffMembers] = useState(false);
  const [selectedStaffMemberData, setSelectedStaffMemberData] =
    useState<Partial<StaffsType>>();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <>
      {showStaffMembers && (
        <StaffMembersModal
          onSelect={(staffData) => {
            setSelectedStaffMemberData({ ...staffData });
            setShowPaymentForm(true);
            setShowStaffMembers(false);
          }}
          onClose={() => setShowStaffMembers(false)}
        />
      )}
      {showPaymentForm && (
        <PaymentForm
          mode="create"
          paymentInfo={{
            paymentMethod: selectedStaffMemberData?.paymentPreference!,
            staffId: selectedStaffMemberData?.staffId!,
            ...(selectedStaffMemberData?.paymentPreference === "bank"
              ? {
                  receiverBankInfo: selectedStaffMemberData?.bankInfo!,
                }
              : {
                  receiverWalletNumber: selectedStaffMemberData?.walletNumber!,
                }),
          }}
          onBack={() => {
            setShowStaffMembers(true);
            setShowPaymentForm(false);
          }}
          // onSubmit={createPaymentHandler}
          onClose={() => setShowPaymentForm(false)}
        />
      )}
      <button onClick={() => setShowStaffMembers(true)} className="__btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <span className="hidden lg:block">Add payment</span>
      </button>
    </>
  );
}
