"use client";

import { sendCertificateLink } from "@/actions/staffActions";
import { Modal } from "@/components/ui";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CertificateModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const res = await sendCertificateLink(formData);
    if (res.success) {
      toast.success(res.message);
      onClose();
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <Modal isVisible title="Certificate" onClose={onClose}>
      <form action={handleSubmit} className="space-y-3">
        <div className="flex gap-x-3">
          <input
            type="text"
            name="memberNumber"
            className="__input"
            placeholder="Member Number (e.g. SE001)"
            required
          />
          <input
            type="text"
            name="phone"
            className="__input"
            placeholder="Phone Number"
            required
          />
        </div>
        <div className="flex gap-x-3">
          <input
            type="text"
            name="address"
            className="__input"
            placeholder="Address"
            required
          />
          <input
            type="text"
            name="district"
            className="__input"
            placeholder="District"
            required
          />
        </div>
        <div className="flex gap-x-3">
          <input
            type="text"
            name="shopName"
            className="__input"
            placeholder="Shop Name"
            required
          />
          <input
            type="text"
            name="ownerName"
            className="__input"
            placeholder="Shop Owner Name"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-x-3">
          <input
            type="text"
            name="shopId"
            className="__input"
            placeholder="Shop ID"
            required
          />
          <input
            type="text"
            name="staffId"
            className="__input"
            placeholder="Staff ID"
            required
          />
        </div>
        <div className="flex justify-end gap-x-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button disabled={loading} type="submit" className="__btn">
            {" "}
            {loading ? "Sending..." : "Send Link"}{" "}
          </button>
        </div>
      </form>
    </Modal>
  );
}
