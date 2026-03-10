"use client";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

export default function EditProfilePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/staff/profile");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="bg-white rounded-3xl p-10 shadow-xl border border-orange-100 max-w-md text-center">
        <div className="bg-orange-50 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-10 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-4">
          Edit Profile Closed
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Staff profile editing is now restricted. Only the administrator can
          modify your profile details based on your request.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.back()}
            className="bg-black text-white px-8 py-3 rounded-2xl font-bold text-sm transition-transform active:scale-95"
          >
            Go Back
          </button>
          <p className="text-[10px] text-gray-400 font-medium">
            Redirecting to profile in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
