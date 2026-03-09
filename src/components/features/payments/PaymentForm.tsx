"use client";

import { createPayment, updatePayment } from "@/actions";
import { InputField, Modal } from "@/components/ui";
import { PaymentDataType, PaymentTypes } from "@/types";
import { useState } from "react";
import { toast } from "react-toastify";

export default function PaymentForm({
  paymentInfo,
  mode,
  onBack,
  onClose,
}: {
  paymentInfo?: Partial<PaymentDataType>;
  mode: "create" | "update";
  onBack?: () => void;
  onClose: () => void;
}) {
  const [paymentData, setPaymentData] = useState({
    ...paymentInfo,
    date: new Date(),
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentTypes>(
    paymentData?.paymentMethod || "bkash",
  );
  const [isPending, setIsPending] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
  ) => {
    const value = event.target.value;
    if (key.startsWith("senderBankInfo")) {
      setPaymentData({
        ...paymentData,
        senderBankInfo: {
          ...paymentData.senderBankInfo!,
          [key.split(".")[1]]: value,
        },
      });
    } else {
      setPaymentData({ ...paymentData, [key]: value });
    }
  };

  const submitHandler = async () => {
    setIsPending(true);
    let res;
    if (mode === "create") {
      if (!paymentData.staffId || !paymentData.paymentMethod) {
        toast.error("Staff and payment method are required");
        setIsPending(false);
        return;
      }
      res = await createPayment({ ...paymentData, staffId: paymentData.staffId, paymentMethod: paymentData.paymentMethod } as Parameters<typeof createPayment>[0]);
    } else if (mode === "update") {
      if (!paymentData.staffId || !paymentData.paymentMethod) {
        toast.error("Staff and payment method are required");
        setIsPending(false);
        return;
      }
      res = await updatePayment(paymentData.paymentId!, { ...paymentData, staffId: paymentData.staffId, paymentMethod: paymentData.paymentMethod } as Parameters<typeof updatePayment>[1]);
    }
    if (res) {
      toast(res.message, {
        type: res.success ? "success" : "error",
      });
      if (res.success) {
        onClose();
      }
    }
    setIsPending(false);
  };

  const checkEmptyField = (event: React.FormEvent<HTMLFormElement>) => {
    if (!paymentInfo) return;
    const formData = new FormData(event.currentTarget);
    const tempPaymentInfo = Object.fromEntries(formData);

    for (const key in tempPaymentInfo) {
      if (key === "paymentDate") {
        const newDate = new Date(tempPaymentInfo[key] as string);
        if (paymentInfo.date && newDate.getTime() !== paymentInfo.date.getTime()) {
          setHasUpdates(true);
          return;
        }
      } else if (tempPaymentInfo[key] !== (paymentInfo as Record<string, unknown>)[key]?.toString()) {
        setHasUpdates(true);
        return;
      }
    }
    setHasUpdates(false);
  };

  return (
    <Modal
      isVisible
      title={mode === "create" ? "Add Payment" : "Update Payment"}
      onClose={onClose}
    >
      {mode === "create" && (
        <button
          className="text-blue-600 __center mb-2 hover:underline"
          onClick={onBack}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Back
        </button>
      )}
      <div className="flex flex-col gap-6 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 text-start">
            <label className="text-sm">
              Payment Method{" "}
              {!paymentInfo && <span className="text-red-500 text-lg">*</span>}
              <select
                disabled
                value={paymentData.paymentMethod}
                className="__input p-0 px-2 mt-1"
              >
                <option value="bkash">বিকাশ</option>
                <option value="nagad">নগদ</option>
                <option value="rocket">রকেট</option>
                <option value="bank">ব্যাংক</option>
              </select>
            </label>
          </div>
          <InputField
            required={paymentInfo ? false : true}
            value={paymentData.amount}
            onChange={(e) => inputChangeHandler(e, "amount")}
            label="Amount"
            name="amount"
            type="number"
          />
        </div>
        {paymentMethod === "bank" ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                readOnly
                defaultValue={paymentData?.receiverBankInfo?.bankName}
                label="Receiver Bank Name"
              />
              <InputField
                required={paymentInfo ? false : true}
                value={paymentData?.senderBankInfo?.bankName}
                onChange={(e) =>
                  inputChangeHandler(e, "senderBankInfo.bankName")
                }
                label="Sender Bank Name"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                readOnly
                defaultValue={paymentData?.receiverBankInfo?.accountHolderName}
                label="Receiver Account Name"
              />
              <InputField
                required={paymentInfo ? false : true}
                value={paymentData?.senderBankInfo?.accountHolderName || ""}
                onChange={(e) =>
                  inputChangeHandler(e, "senderBankInfo.accountHolderName")
                }
                label="Sender Account Name"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                readOnly
                defaultValue={paymentData?.receiverBankInfo?.accountNumber}
                label="Receiver Account Number"
              />
              <InputField
                required={paymentInfo ? false : true}
                value={paymentData?.senderBankInfo?.accountNumber}
                onChange={(e) =>
                  inputChangeHandler(e, "senderBankInfo.accountNumber")
                }
                label="Sender Account Number"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                readOnly
                defaultValue={paymentData?.receiverBankInfo?.branchName}
                label="Receiver Branch Name"
              />
              <InputField
                required={paymentInfo ? false : true}
                value={paymentData?.senderBankInfo?.branchName}
                onChange={(e) =>
                  inputChangeHandler(e, "senderBankInfo.branchName")
                }
                label="Sender Branch Name"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <InputField
              readOnly
              defaultValue={paymentData?.receiverWalletNumber || ""}
              label="Receiver Wallet Number"
              type="tel"
            />
            <InputField
              required={paymentInfo ? false : true}
              value={paymentData.senderWalletNumber ?? ""}
              onChange={(e) => inputChangeHandler(e, "senderWalletNumber")}
              label="Sender Wallet Number"
              type="tel"
            />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentMethod !== "bank" && (
            <InputField
              required={paymentInfo ? false : true}
              value={paymentData.transactionId ?? ""}
              onChange={(e) => inputChangeHandler(e, "transactionId")}
              label="Transaction ID"
            />
          )}
          <InputField
            required={paymentInfo ? false : true}
            value={
              (typeof paymentData?.date === "string"
                ? new Date(paymentData.date)
                : paymentData.date
              )
                .toISOString()
                .split("T")[0]
            }
            onChange={(e) => inputChangeHandler(e, "date")}
            label="Payment Date"
            type="date"
          />
        </div>
        <div className="grid grid-cols-1">
          <label className="text-sm">
            <span>Task Description (optional)</span>
            <textarea
              value={paymentData?.description || ""}
              onChange={(e) => inputChangeHandler(e, "description")}
              className="__input h-32 mt-2"
            ></textarea>
          </label>
        </div>
        <button disabled={isPending} onClick={submitHandler} className="__btn">
          {mode === "create"
            ? isPending
              ? "Adding..."
              : "Add"
            : isPending
              ? "Updating..."
              : "Update"}
        </button>
        {/* <button disabled={(paymentInfo && !hasUpdates) || isProcessing} className="__btn">{isProcessing ? paymentInfo ? 'Updating...' : 'Adding...' : paymentInfo ? 'Update' : 'Add'}</button> */}
      </div>
    </Modal>
  );
}
