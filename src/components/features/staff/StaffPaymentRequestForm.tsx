"use client";

import { requestPayment } from "@/actions/paymentRequestActions";
import { useActionState, useState } from "react";
import { toast } from "react-toastify";

interface StaffPaymentRequestFormProps {
  staffId: string;
}

export function StaffPaymentRequestForm({ staffId }: StaffPaymentRequestFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const res = await requestPayment(_prev, formData);
      if (res?.success) toast.success(res.message);
      else if (res?.success === false) toast.error(res.message);
      return res ?? _prev;
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="staffId" value={staffId} />

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Amount (৳)
        </label>
        <input
          type="number"
          name="amount"
          min="1"
          required
          placeholder="Enter amount"
          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Note (optional)
        </label>
        <textarea
          name="description"
          rows={2}
          placeholder="Any additional notes..."
          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand text-white font-bold py-3 rounded-xl text-sm uppercase tracking-wider hover:bg-brand-800 disabled:bg-brand/50 transition-all active:scale-[0.98]"
      >
        {isPending ? "Sending..." : "Request payment"}
      </button>
    </form>
  );
}
