"use client";

import { updateMyProfileForm } from "@/actions/staffActions";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface WalletSettingsFormProps {
  initialWalletNumber: string | null;
  initialPaymentPreference: string | null;
}

export function WalletSettingsForm({
  initialWalletNumber,
  initialPaymentPreference,
}: WalletSettingsFormProps) {
  const [walletNumber, setWalletNumber] = useState(initialWalletNumber ?? "");

  const [state, formAction, isPending] = useActionState(
    updateMyProfileForm,
    undefined,
  );

  useEffect(() => {
    if (!state) return;
    toast(state.message, {
      type: state.success ? "success" : "error",
    });
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="paymentPreference" value="bkash" />

      <div>
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1.5">
          bKash Number
        </label>
        <input
          type="tel"
          name="walletNumber"
          value={walletNumber}
          onChange={(e) => setWalletNumber(e.target.value)}
          placeholder="01XXXXXXXXX"
          required
          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-white"
        />
        <p className="mt-1 text-[11px] text-gray-500">
          এই নম্বরেই আপনার পেমেন্ট পাঠানো হবে। সঠিক bKash পার্সোনাল নাম্বার দিন।
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand text-white font-bold py-2.5 rounded-md text-sm uppercase tracking-wider hover:bg-brand-800 disabled:bg-brand/50 transition-all active:scale-[0.98]"
      >
        {isPending ? "Saving..." : "Save bKash number"}
      </button>

      {initialPaymentPreference && (
        <p className="text-[11px] text-gray-400">
          Current method:{" "}
          <span className="font-semibold uppercase">
            {initialPaymentPreference}
          </span>
        </p>
      )}
    </form>
  );
}
