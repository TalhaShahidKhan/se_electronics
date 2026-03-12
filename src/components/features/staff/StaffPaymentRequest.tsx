"use client";

import { requestPayment } from "@/actions/paymentRequestActions";
import { useActionState, useState } from "react";
import { toast } from "react-toastify";

interface StaffPaymentRequestProps {
  staffId: string;
  completedServices?: any[];
}

export default function StaffPaymentRequest({ staffId, completedServices = [] }: StaffPaymentRequestProps) {
  const [selectedService, setSelectedService] = useState("");
  const [state, formAction, isPending] = useActionState(async (_prev: any, formData: FormData) => {
    const res = await requestPayment(_prev, formData);
    if (res.success) {
      toast.success(res.message);
      setSelectedService("");
    } else {
      toast.error(res.message);
    }
    return res;
  }, undefined);

  const hasCompletedServices = completedServices.length > 0;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="staffId" value={staffId} />
      {!hasCompletedServices && <input type="hidden" name="serviceId" value="" />}

      {hasCompletedServices && (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Select Service (optional)
          </label>
          <select
            name="serviceId"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-white"
          >
            <option value="">-- None / Request from balance --</option>
            {completedServices.map((service: any) => (
              <option key={service.serviceId} value={service.serviceId}>
                #{service.serviceId.substring(0, 8)} - {service.customerName} ({service.productModel})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            Payment Method
          </label>
          <select
            name="paymentMethod"
            required
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-white"
          >
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Note (Optional)
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
        {isPending ? "Submitting..." : "Request Payment"}
      </button>
    </form>
  );
}
