"use client";

import { createPayment, updatePayment } from "@/actions";
import { InputField, Modal } from "@/components/ui";
import { PaymentDataType } from "@/types";
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
  const [paymentData, setPaymentData] = useState<Partial<PaymentDataType>>({
    ...paymentInfo,
    date: paymentInfo?.date || new Date(),
    paymentMethod: paymentInfo?.paymentMethod || (paymentInfo as any)?.staff?.paymentPreference || "bkash",
    receiverWalletNumber:
      paymentInfo?.receiverWalletNumber || (paymentInfo as any)?.staff?.walletNumber || "",
    receiverBankInfo:
      paymentInfo?.receiverBankInfo || (paymentInfo as any)?.staff?.bankInfo || null,
  });


  const [isPending, setIsPending] = useState(false);

  const paymentMethod = paymentData.paymentMethod || "bkash";

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string
  ) => {
    const value = event.target.value;

    if (key.startsWith("senderBankInfo")) {
      const field = key.split(".")[1];

      setPaymentData((prev) => ({
        ...prev,
        senderBankInfo: {
          ...(prev.senderBankInfo || {}),
          [field]: value,
        } as any,
      }));
    } else {
      setPaymentData((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const submitHandler = async () => {
    try {
      setIsPending(true);

      if (!paymentData.staffId || !paymentData.paymentMethod) {
        toast.error("Staff and payment method are required");
        setIsPending(false);
        return;
      }

      let res;

      if (mode === "create") {
        res = await createPayment(paymentData as Parameters<typeof createPayment>[0]);
      } else {
        res = await updatePayment(
          paymentData.paymentId!,
          paymentData as Parameters<typeof updatePayment>[1]
        );
      }

      if (res) {
        toast(res.message, {
          type: res.success ? "success" : "error",
        });

        if (res.success) {
          onClose();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }

    setIsPending(false);
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
          Back
        </button>
      )}

      <div className="flex flex-col gap-6 rounded-lg">
        {/* Payment Method + Amount */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 text-start">
            <label className="text-sm">
              Payment Method
              <select
                disabled={true}
                value={paymentMethod}
                className="__input p-0 px-2 mt-1 appearance-none bg-gray-50 opacity-70 cursor-not-allowed"
              >
                <option value="bkash">বিকাশ</option>
                <option value="nagad">নগদ</option>
                <option value="rocket">রকেট</option>
                <option value="bank">ব্যাংক</option>
                <option value="cash">নগদ (Cash)</option>
              </select>
            </label>
          </div>


          <InputField
            required={!paymentInfo}
            value={paymentData.amount ?? ""}
            onChange={(e) => inputChangeHandler(e, "amount")}
            label="Amount"
            name="amount"
            type="number"
          />
        </div>

        {/* BANK PAYMENT */}
        {paymentMethod === "bank" ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                readOnly
                value={paymentData?.receiverBankInfo?.bankName ?? ""}
                label="Receiver Bank Name"
              />


              <InputField
                value={paymentData?.senderBankInfo?.bankName ?? ""}
                onChange={(e) =>
                  inputChangeHandler(e, "senderBankInfo.bankName")
                }
                label="Sender Bank Name"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                readOnly
                value={
                  paymentData?.receiverBankInfo?.accountHolderName ?? ""
                }
                label="Receiver Account Name"
              />


              <InputField
                value={paymentData?.senderBankInfo?.accountHolderName ?? ""}
                onChange={(e) =>
                  inputChangeHandler(e, "senderBankInfo.accountHolderName")
                }
                label="Sender Account Name"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                readOnly
                value={paymentData?.receiverBankInfo?.accountNumber ?? ""}
                label="Receiver Account Number"
              />


              <InputField
                value={paymentData?.senderBankInfo?.accountNumber ?? ""}
                onChange={(e) =>
                  inputChangeHandler(e, "senderBankInfo.accountNumber")
                }
                label="Sender Account Number"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                readOnly
                value={paymentData?.receiverBankInfo?.branchName ?? ""}
                label="Receiver Branch Name"
              />


              <InputField
                value={paymentData?.senderBankInfo?.branchName ?? ""}
                onChange={(e) =>
                  inputChangeHandler(e, "senderBankInfo.branchName")
                }
                label="Sender Branch Name"
              />
            </div>
          </>
        ) : paymentMethod !== "cash" ? (
          /* WALLET PAYMENT */
          <div className="flex flex-col sm:flex-row gap-4">
            <InputField
              readOnly
              value={paymentData?.receiverWalletNumber ?? ""}
              label="Receiver Wallet Number"
              type="tel"
            />

            <InputField
              value={paymentData?.senderWalletNumber ?? ""}
              onChange={(e) => inputChangeHandler(e, "senderWalletNumber")}
              label="Sender Wallet Number"
              type="tel"
            />
          </div>
        ) : null}


        {/* Transaction + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentMethod !== "bank" && paymentMethod !== "cash" && (
            <InputField
              value={paymentData.transactionId ?? ""}
              onChange={(e) => inputChangeHandler(e, "transactionId")}
              label="Transaction ID"
            />
          )}


          <InputField
            value={
              paymentData.date
                ? new Date(paymentData.date).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => inputChangeHandler(e, "date")}
            label="Payment Date"
            type="date"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm">
            Task Description
            <textarea
              value={paymentData.description ?? ""}
              onChange={(e) => inputChangeHandler(e, "description")}
              className="__input h-32 mt-2"
            />
          </label>
        </div>

        {/* Submit */}
        <button
          disabled={isPending}
          onClick={submitHandler}
          className="__btn"
        >
          {mode === "create"
            ? isPending
              ? "Adding..."
              : "Add"
            : isPending
            ? "Updating..."
            : "Update"}
        </button>
      </div>
    </Modal>
  );
}