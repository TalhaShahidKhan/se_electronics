"use client";

import { StaffsType } from "@/types";
import Image from "next/image";
import { useState } from "react";
import StaffProfileModal from "@/components/features/staff/StaffProfileModal";
import { User, Phone, MapPin, Eye, ShieldCheck, ShieldAlert } from "lucide-react";
import clsx from "clsx";

export default function StaffListClient({ staffs }: { staffs: StaffsType[] }) {
  const [selectedStaff, setSelectedStaff] = useState<StaffsType | null>(null);

  return (
    <div className="flex-1 overflow-auto p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {staffs.map((staff) => (
          <div
            key={staff.id}
            onClick={() => setSelectedStaff(staff)}
            className="group bg-white border border-gray-100 rounded-[2rem] p-5 text-center transition-all hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 cursor-pointer relative overflow-hidden active:scale-[0.98]"
          >
            {/* Status Indicator */}
            <div className="absolute top-4 right-4">
              {staff.isActiveStaff ? (
                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-full" title="Active">
                  <ShieldCheck size={16} />
                </div>
              ) : (
                <div className="bg-rose-50 text-rose-600 p-1.5 rounded-full" title="Blocked">
                  <ShieldAlert size={16} />
                </div>
              )}
            </div>

            {/* Profile Image */}
            <div className="relative mx-auto mb-5">
              <div className="size-32 sm:size-40 rounded-[2.5rem] overflow-hidden __center mx-auto border-4 border-gray-50 group-hover:border-brand/10 transition-colors bg-gray-50">
                <Image 
                  src={staff.photoUrl} 
                  alt={staff.name} 
                  width={160} 
                  height={160} 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5">
                <span className="text-[10px] font-black text-brand uppercase tracking-widest">{staff.staffId}</span>
              </div>
            </div>

            {/* Staff Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-gray-900 group-hover:text-brand transition-colors line-clamp-1 px-2">
                  {staff.name}
                </h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                  {staff.role}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Phone size={14} className="text-brand/40" />
                  <span className="text-sm font-bold">{staff.phone}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <MapPin size={14} className="text-brand/40" />
                  <span className="text-sm font-bold truncate max-w-[150px]">{staff.currentDistrict}</span>
                </div>
              </div>

              {/* View Details Hint */}
              <div className="pt-2">
                <div className="w-full py-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-brand group-hover:text-white transition-all flex items-center justify-center gap-2">
                  <Eye size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">View Details</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedStaff && (
        <StaffProfileModal
          staffDataPayload={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </div>
  );
}
