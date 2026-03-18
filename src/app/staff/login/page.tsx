"use client";

import { staffLogin } from "@/actions";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AlertTriangle, PhoneCall, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import { useActionState } from "react";
import Modal from "@/components/ui/Modal";
import { contactDetails } from "@/constants";

export default function StaffLoginPage() {
  const [state, loginAction, isPending] = useActionState(staffLogin, undefined);
  const [username, setUsername] = useState("");
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  useEffect(() => {
    if (state && !state.success && (state as any).isBlocked) {
      setShowBlockedModal(true);
    }
  }, [state]);

  const handleSubmit = () => {
    if (!username.trim()) {
      toast.error("Please enter your username");
      return;
    }
  };

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
            Service Time Member
          </p>
        </div>

        {/* White Form Section with curved top */}
        <div className="bg-white -mt-8 rounded-t-2xl relative z-10 px-6 pt-2 pb-8">
          {/* Light blue label bar */}
          <div className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl py-3 px-4 mb-6 mt-4 border border-sky-200">
            <h2 className="text-center text-[13px] font-extrabold text-brand tracking-wider uppercase">
              Staff Portal Login
            </h2>
          </div>

          <form
            action={loginAction}
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 placeholder:font-medium placeholder:uppercase placeholder:text-[11px] placeholder:tracking-wider focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                placeholder="Your Username"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 placeholder:font-medium placeholder:uppercase placeholder:text-[11px] placeholder:tracking-wider focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                placeholder="Your Password"
                required
              />
            </div>

            {state && !state.success && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm font-semibold text-center">
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand text-white font-bold py-3.5 px-4 rounded-xl text-sm uppercase tracking-[0.15em] hover:bg-brand-800 disabled:bg-brand/50 transition-all transform active:scale-[0.98] mt-2"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            <p>Technical & Electrician Staff Portal</p>
            <p className="mt-1">© 2026 SE Electronics</p>
          </div>
        </div>
      </div>

      {/* Blocked Account Modal */}
      <Modal
        isVisible={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        title="Account Blocked"
        width="500"
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="size-20 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">
            অ্যাক্সেস সংরক্ষিত
          </h2>
          
          <p className="text-gray-600 font-medium leading-relaxed mb-8 px-4">
            আপনার অ্যাকাউন্টটি বর্তমানে ব্লক করা আছে। পুনরায় সক্রিয় করতে আমাদের এডমিন প্যানেলের সাথে যোগাযোগ করুন।
          </p>

          <div className="w-full space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Contact Administrator
            </p>
            
            <a 
              href={`tel:${contactDetails.customerCare}`}
              className="flex items-center justify-center gap-4 w-full bg-brand text-white font-black py-5 px-6 rounded-2xl shadow-xl shadow-brand/20 hover:shadow-2xl hover:bg-brand-700 transition-all active:scale-[0.98] group"
            >
              <div className="bg-white/20 p-2 rounded-lg group-hover:rotate-12 transition-transform">
                <PhoneCall size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase opacity-70 leading-none mb-1">Call Admin Now</p>
                <p className="text-lg leading-none">{contactDetails.customerCare}</p>
              </div>
            </a>

            <button
              onClick={() => setShowBlockedModal(false)}
              className="w-full py-4 text-gray-400 font-bold uppercase tracking-widest text-[11px] hover:text-gray-600 transition-colors"
            >
              Close and Try Again
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
