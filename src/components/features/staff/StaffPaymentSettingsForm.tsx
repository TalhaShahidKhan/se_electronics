"use client";

import { updateMyProfileForm } from "@/actions/staffActions";
import type { BankInfo } from "@/types";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

type PaymentMethod = "bkash" | "nagad" | "rocket" | "bank";

interface StaffPaymentSettingsFormProps {
  initialPaymentPreference: string | null;
  initialWalletNumber: string | null;
  initialBankInfo: BankInfo | null;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank: "Bank Account",
};

export function StaffPaymentSettingsForm({
  initialPaymentPreference,
  initialWalletNumber,
  initialBankInfo,
}: StaffPaymentSettingsFormProps) {
  const [method, setMethod] = useState<PaymentMethod>(
    (initialPaymentPreference as PaymentMethod) || "bkash",
  );
  const [walletNumber, setWalletNumber] = useState(initialWalletNumber ?? "");
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: initialBankInfo?.bankName ?? "",
    accountHolderName: initialBankInfo?.accountHolderName ?? "",
    accountNumber: initialBankInfo?.accountNumber ?? "",
    branchName: initialBankInfo?.branchName ?? "",
  });

  const [state, formAction, isPending] = useActionState(
    updateMyProfileForm,
    undefined,
  );

  useEffect(() => {
    if (!state) return;
    toast(state.message, { type: state.success ? "success" : "error" });
  }, [state]);

  const isWallet =
    method === "bkash" || method === "nagad" || method === "rocket";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="paymentPreference" value={method} />

      <div>
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1.5">
          Preferred payment method
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-white"
        >
          <option value="bkash">{METHOD_LABELS.bkash}</option>
          <option value="nagad">{METHOD_LABELS.nagad}</option>
          <option value="rocket">{METHOD_LABELS.rocket}</option>
          <option value="bank">{METHOD_LABELS.bank}</option>
        </select>
      </div>

      {isWallet ? (
        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            {METHOD_LABELS[method]} number
          </label>
          <input
            type="tel"
            name="walletNumber"
            value={walletNumber}
            onChange={(e) => setWalletNumber(e.target.value)}
            placeholder="01XXXXXXXXX"
            required={isWallet}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-white"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            পেমেন্ট এই নম্বরে পাঠানো হবে। সঠিক পার্সোনাল নাম্বার দিন।
          </p>
        </div>
      ) : (
        <>
          <input type="hidden" name="walletNumber" value="" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Bank name
              </label>
              <input
                type="text"
                name="bankName"
                value={bankInfo.bankName}
                onChange={(e) =>
                  setBankInfo((p) => ({ ...p, bankName: e.target.value }))
                }
                placeholder="e.g. DBBL, City Bank"
                required
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Account holder name
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={bankInfo.accountHolderName}
                onChange={(e) =>
                  setBankInfo((p) => ({
                    ...p,
                    accountHolderName: e.target.value,
                  }))
                }
                placeholder="Your name"
                required
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Account number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={bankInfo.accountNumber}
                onChange={(e) =>
                  setBankInfo((p) => ({ ...p, accountNumber: e.target.value }))
                }
                placeholder="1234567890"
                required
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Branch name
              </label>
              <input
                type="text"
                name="branchName"
                value={bankInfo.branchName}
                onChange={(e) =>
                  setBankInfo((p) => ({ ...p, branchName: e.target.value }))
                }
                placeholder="e.g. Sylhet Branch"
                required
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-white"
              />
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand text-white font-bold py-2.5 rounded-md text-sm uppercase tracking-wider hover:bg-brand-800 disabled:bg-brand/50 transition-all active:scale-[0.98]"
      >
        {isPending ? "Saving..." : "Save payment details"}
      </button>
    </form>
  );
}
