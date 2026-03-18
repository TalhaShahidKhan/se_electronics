"use client";

import { ArrowLeft, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface MobilePageHeaderProps {
  title: string;
  backHref?: string;
  Icon?: LucideIcon;
  showBackButton?: boolean;
}

/**
 * A mobile-first page header component that matches the premium dashboard aesthetic.
 * Features a dark brand top strip, white background, and an icon/back button in a rounded box.
 */
export function MobilePageHeader({ 
  title, 
  backHref, 
  Icon,
  showBackButton = true 
}: MobilePageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="md:hidden flex flex-col w-full bg-white sticky top-0 z-40">
      {/* Top Brand Strip - matching the dark bar in screenshot */}
      <div className="h-2 bg-[#0A1A3A] w-full" />
      
      <div className="px-4 py-4 flex items-center gap-4 bg-white border-b border-gray-100/50 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
        {showBackButton ? (
          <button 
            onClick={handleBack}
            aria-label="Go back"
            className="flex items-center justify-center size-10 min-w-10 bg-gray-100 rounded-xl text-[#0A1A3A] hover:bg-gray-200 active:scale-90 transition-all shadow-sm"
          >
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
        ) : Icon ? (
          <div className="flex items-center justify-center size-10 min-w-10 bg-gray-100 rounded-xl text-[#0A1A3A] shadow-sm">
            <Icon size={20} strokeWidth={3} />
          </div>
        ) : (
          <div className="size-2" />
        )}
        
        <h1 className="font-black text-xl text-[#0A1A3A] tracking-tighter line-clamp-1">
          {title}
        </h1>
      </div>
    </div>
  );
}
