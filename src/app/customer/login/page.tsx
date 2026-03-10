"use client";

import { customerLogin } from "@/actions";
import Image from "next/image";
import { useActionState, useState } from "react";
import { toast } from "react-toastify";

export default function CustomerLoginPage() {
  const [state, loginAction, isPending] = useActionState(
    customerLogin,
    undefined,
  );
  const [username, setUsername] = useState("");

  const handleSubmit = () => {
    if (!username.trim()) {
      toast.error("Please enter your phone number or username");
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Login</h1>
          <p className="text-sm text-gray-500 mt-2">
            Access your service history and track progress
          </p>
        </div>

        <form
          action={loginAction}
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer ID or Invoice Number
            </label>
            <input
              type="text"
              name="customerId"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="e.g., CUST-1234 or INV-2026-0001"
              required
            />
          </div>

          {state && !state.success && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all transform active:scale-[0.98]"
          >
            {isPending ? "Authenticating..." : "Enter Profile"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>© 2026 SE Electronics Service Team</p>
          <p className="mt-2 italic">
            If you haven't set a password yet, please contact our support.
          </p>
        </div>
      </div>
    </div>
  );
}
