"use client";

import { login } from "@/actions";
import Image from "next/image";
import { useActionState } from "react";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function LoginPage() {
  const [response, loginAction, isPending] = useActionState(login, undefined);

  useEffect(() => {
    if (!response?.success) {
      toast.error(response?.message);
    }
  }, [response]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl">
        {/* Dark Navy Header Section */}
        <div className="bg-brand px-6 pt-10 pb-16 text-center relative">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo.jpg"
              alt="SE Electronics Logo"
              width={72}
              height={72}
              className="rounded-full border-2 border-white/20"
            />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wider uppercase">
            SE Electronics
          </h1>
          <p className="text-[11px] text-blue-200 font-semibold tracking-[0.2em] uppercase mt-1">
            Admin Dashboard
          </p>
        </div>

        {/* White Form Section with curved top */}
        <div className="bg-white -mt-8 rounded-t-2xl relative z-10 px-6 pt-2 pb-8">
          {/* Light blue label bar */}
          <div className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl py-3 px-4 mb-6 mt-4 border border-sky-200">
            <h2 className="text-center text-[13px] font-extrabold text-brand tracking-wider uppercase">
              Admin Login
            </h2>
          </div>

          <form action={loginAction} className="space-y-4">
            <div>
              <input
                name="username"
                autoCapitalize="off"
                type="text"
                placeholder="Your Username"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 placeholder:font-medium placeholder:uppercase placeholder:text-[11px] placeholder:tracking-wider focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                required
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                placeholder="Your Password"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 placeholder:font-medium placeholder:uppercase placeholder:text-[11px] placeholder:tracking-wider focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                required
              />
            </div>

            <button
              disabled={isPending}
              className="w-full bg-brand text-white font-bold py-3.5 px-4 rounded-xl text-sm uppercase tracking-[0.15em] hover:bg-brand-800 disabled:bg-brand/50 transition-all transform active:scale-[0.98] mt-2"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            <p>© 2026 SE Electronics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
