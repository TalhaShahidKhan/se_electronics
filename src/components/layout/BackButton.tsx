"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  backHref?: string;
}

export function BackButton({ backHref }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      aria-label="Go back"
      className="flex items-center justify-center size-10 min-w-10 bg-gray-100 rounded-xl text-[#0A1A3A] hover:bg-gray-200 active:scale-90 transition-all shadow-sm"
    >
      <ArrowLeft size={20} strokeWidth={3} />
    </button>
  );
}
