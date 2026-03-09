"use client";

import { CustomerForm, RefreshButton, Search } from "@/components";
import { useState } from "react";

export default function InvoiceToolbar() {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  return (
    <>
      {showInvoiceForm && (
        <CustomerForm mode="create" onClose={() => setShowInvoiceForm(false)} />
      )}
      <div className="flex flex-wrap items-center gap-4">
        <Search />
        <div className="flex justify-between flex-1">
          <RefreshButton />
          <button onClick={() => setShowInvoiceForm(true)} className="__btn">
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
            <span className="hidden lg:block">Create Invoice</span>
          </button>
        </div>
      </div>
    </>
  );
}
