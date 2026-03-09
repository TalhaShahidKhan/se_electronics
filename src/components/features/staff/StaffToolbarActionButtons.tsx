"use client";

import { sendRegistrationLink } from "@/actions";
import { Modal } from "@/components/ui";
import { registrationLinkMessagePreview } from "@/constants";
import { useState } from "react";
import { toast } from "react-toastify";
import CertificateModal from "./CertificateModal";
import RegistrationForm from "./RegistrationForm";

export default function StaffToolbarActionButtons() {
  const [showSendLinkModal, setShowSendLinkModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  return (
    <div className="flex gap-x-3">
      {showSendLinkModal && (
        <RegistrasionLinkModal onClose={() => setShowSendLinkModal(false)} />
      )}
      {showRegistrationModal && (
        <Modal
          title="Add Staff Member"
          isVisible={true}
          onClose={() => setShowRegistrationModal(false)}
        >
          <RegistrationForm
            mode="create"
            onRegistrationComplete={() => setShowRegistrationModal(false)}
          />
        </Modal>
      )}
      {showCertificateModal && (
        <CertificateModal onClose={() => setShowCertificateModal(false)} />
      )}
      <button className="__btn" onClick={() => setShowCertificateModal(true)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5 -rotate-45"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
        <span className="hidden lg:block">Send Certificate</span>
      </button>
      <button className="__btn" onClick={() => setShowSendLinkModal(true)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5 -rotate-45"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
        <span className="hidden lg:block">Send registration link</span>
      </button>
      <button className="__btn" onClick={() => setShowRegistrationModal(true)}>
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
        <span className="hidden lg:block">Add Staff Member</span>
      </button>
    </div>
  );
}

const RegistrasionLinkModal = ({ onClose }: { onClose: () => void }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendRegistrationLinkHandler = async () => {
    setIsSending(true);
    const res = await sendRegistrationLink(phoneNumber);
    setIsSending(false);
    res.success ? onClose() : setPhoneNumber("");
    toast(res.message, { type: res.success ? "success" : "error" });
  };
  return (
    <Modal title="Send registration link" isVisible={true} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          autoFocus
          type="tel"
          className="__input"
          placeholder="Phone number"
        />
        <div className="mb-6">
          <label className="mb-2 block">Message preview:</label>
          <div className="max-w-96 text-gray-600">
            <p className="whitespace-pre-wrap text-sm">
              {registrationLinkMessagePreview}
            </p>
          </div>
        </div>
        <button
          disabled={!phoneNumber.trim() || isSending}
          onClick={sendRegistrationLinkHandler}
          className="__btn"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </Modal>
  );
};
