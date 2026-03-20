"use client";

import {
  deleteStaff,
  sendIdCardDownloadLink,
  setStaffCredentials,
  toggleStaffStatus,
} from "@/actions";
import { Modal } from "@/components/ui";
import { StaffsType } from "@/types";
import { useRef, useState } from "react";
import { Id, toast } from "react-toastify";
import { ShieldCheck, ShieldOff, CreditCard } from "lucide-react";
import RegistrationForm from "./RegistrationForm";
import StaffProfileModal from "./StaffProfileModal";
import PaymentForm from "../payments/PaymentForm";
import clsx from "clsx";

export default function StaffActionButtons({
  staffData,
  variant = "inline",
}: {
  staffData: StaffsType;
  variant?: "inline" | "details";
}) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewProfileModal, setShowViewProfileModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [credentials, setCredentials] = useState({
    username: (staffData as { username?: string }).username || "",
    password: "",
  });
  const [isSending, setIsSending] = useState(false);
  const toastId = useRef<Id | null>(null);

  const sendDownloadLink = async () => {
    setIsSending(true);
    toastId.current = toast("Sending...", { autoClose: false });
    const res = await sendIdCardDownloadLink({
      staffId: staffData.staffId,
      staffName: staffData.name,
      phoneNumber: staffData.phone,
      role: staffData.role,
    });
    setIsSending(false);
    toast.update(toastId.current, {
      type: res.success ? "success" : "error",
      render: res.message,
      autoClose: 1500,
    });
  };

  const setCredentialsHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast.error("Username and password required");
      return;
    }
    setIsSending(true);
    toastId.current = toast("Setting credentials...", { autoClose: false });
    const res = await setStaffCredentials(
      staffData.staffId,
      credentials.username,
      credentials.password,
    );
    setIsSending(false);
    toast.update(toastId.current, {
      type: res.success ? "success" : "error",
      render: res.message,
      autoClose: 3000,
    });
    if (res.success) {
      setShowCredentialsModal(false);
    }
  };

  const handleToggleStatus = async () => {
    const isBlocking = staffData.isActiveStaff;
    const confirmed = window.confirm(
      `${isBlocking ? "Block" : "Unblock"} staff member ${staffData.name}?`,
    );
    if (confirmed) {
      toastId.current = toast(`${isBlocking ? "Blocking" : "Unblocking"}...`, {
        autoClose: false,
      });
      const res = await toggleStaffStatus(staffData.staffId, !isBlocking);
      toast.update(toastId.current, {
        type: res.success ? "success" : "error",
        render: res.message,
        autoClose: 1500,
      });
    }
  };

  const deleteTechnicianHandler = async () => {
    const confirmed = window.confirm(
      "Delete technician " + staffData.name + "?",
    );
    if (confirmed) {
      toastId.current = toast("Deleting...", { autoClose: false });
      const res = await deleteStaff(staffData.staffId);
      toast.update(toastId.current, {
        type: res.success ? "success" : "error",
        render: res.message,
        autoClose: 1500,
      });
    }
  };

  const renderButtons = () => {
    if (variant === "details") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setShowPayModal(true)}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors border border-teal-100"
          >
            <CreditCard size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Pay Staff
            </span>
          </button>

          <button
            onClick={() => setShowUpdateModal(true)}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-100"
          >
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
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Edit Info
            </span>
          </button>

          <button
            onClick={() => setShowCredentialsModal(true)}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
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
                d="M15.75 5.25a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-1.5A.75.75 0 0 1 15 18.75v-1.5a.75.75 0 0 1 .75-.75h.75a3 3 0 0 0 3-3V8.25a3 3 0 0 0-3-3h-1.5Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 9.75h.008v.008H10.5V9.75Z"
              />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Auth Settings
            </span>
          </button>

          <button
            onClick={sendDownloadLink}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-colors border border-orange-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 -rotate-45"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Send Link
            </span>
          </button>

          <a
            target="_blank"
            href={`/pdf/download?type=id-card&id=${staffData.staffId}`}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-sky-50 text-sky-600 rounded-md hover:bg-sky-100 transition-colors border border-sky-100"
          >
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
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Download ID
            </span>
          </a>

          <button
            onClick={handleToggleStatus}
            className={clsx(
              "flex flex-col items-center justify-center gap-2 p-4 rounded-md transition-colors border",
              staffData.isActiveStaff
                ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100",
            )}
          >
            {staffData.isActiveStaff ? (
              <ShieldOff size={24} />
            ) : (
              <ShieldCheck size={24} />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {staffData.isActiveStaff ? "Block Staff" : "Activate Staff"}
            </span>
          </button>

          <button
            onClick={deleteTechnicianHandler}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 transition-colors border border-rose-100"
          >
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
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.244 2.244 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Delete Staff
            </span>
          </button>
        </div>
      );
    }

    return (
      <div className="__center gap-4 mt-4">
        <button
          onClick={() => setShowPayModal(true)}
          title="Pay Staff (Add Balance)"
          className="size-10 __center text-teal-600"
        >
          <CreditCard size={24} />
        </button>
        <button
          onClick={() => setShowViewProfileModal(true)}
          title="View Profile"
          className="size-10 __center"
        >
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
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
        <button
          onClick={() => setShowUpdateModal(true)}
          title="Edit Info"
          className="size-10 __center"
        >
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
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </button>
        <button
          onClick={() => setShowCredentialsModal(true)}
          title="Set Login Credentials"
          className="size-10 __center"
        >
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
              d="M15.75 5.25a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-1.5A.75.75 0 0 1 15 18.75v-1.5a.75.75 0 0 1 .75-.75h.75a3 3 0 0 0 3-3V8.25a3 3 0 0 0-3-3h-1.5Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 9.75h.008v.008H10.5V9.75Z"
            />
          </svg>
        </button>
        <button
          onClick={sendDownloadLink}
          title="Send ID Card download link"
          className="size-10 __center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 -rotate-45"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </button>
        <a
          target="_blank"
          href={`/pdf/download?type=id-card&id=${staffData.staffId}`}
          data-disable-progressbar-trigger
          title="Download Id Card"
        >
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
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </a>
        <button
          onClick={handleToggleStatus}
          title={staffData.isActiveStaff ? "Block Staff" : "Activate Staff"}
          className={`size-10 __center ${staffData.isActiveStaff ? "text-orange-500" : "text-green-500"}`}
        >
          {staffData.isActiveStaff ? (
            <ShieldOff size={24} />
          ) : (
            <ShieldCheck size={24} />
          )}
        </button>
        <button
          onClick={deleteTechnicianHandler}
          title="Delete"
          className="size-10 __center text-red-500"
        >
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
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <>
      {showViewProfileModal && (
        <StaffProfileModal
          staffDataPayload={staffData}
          onClose={() => setShowViewProfileModal(false)}
        />
      )}
      {showUpdateModal && (
        <Modal
          isVisible
          title="Update Staff"
          onClose={() => setShowUpdateModal(false)}
        >
          <RegistrationForm
            mode="update"
            staffData={staffData}
            onRegistrationComplete={() => setShowUpdateModal(false)}
          />
        </Modal>
      )}
      {showCredentialsModal && (
        <Modal
          isVisible
          title="Set Login Credentials"
          onClose={() => setShowCredentialsModal(false)}
        >
          <form onSubmit={setCredentialsHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                className="w-full border rounded p-2"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Current:{" "}
                {(staffData as { username?: string }).username || "Not set"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="w-full border rounded p-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
            >
              {isSending ? "Saving..." : "Save Credentials"}
            </button>
          </form>
        </Modal>
      )}
      {showPayModal && (
        <PaymentForm
          mode="create"
          paymentInfo={{
            staffId: staffData.staffId,
            // staffName is not a valid property in PaymentDataType, so we remove it
            paymentMethod: staffData.paymentPreference || "bkash",
            receiverWalletNumber: staffData.walletNumber,
            receiverBankInfo: staffData.bankInfo,
          }}
          onClose={() => setShowPayModal(false)}
        />
      )}
      {renderButtons()}
    </>
  );
}
