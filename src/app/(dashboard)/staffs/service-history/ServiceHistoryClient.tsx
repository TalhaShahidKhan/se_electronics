"use client";

import { getServiceHistoryById } from "@/actions";
import { Spinner, StatusBadge } from "@/components/ui";
import { ServicesType, StaffsType } from "@/types";
import { formatDate } from "@/utils";
import { Search, User, ArrowLeft, Wrench, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

export default function ServiceHistoryClient({ staffs }: { staffs: StaffsType[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffsType | null>(null);
  const [services, setServices] = useState<Partial<ServicesType>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredStaffs = staffs.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.staffId?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.currentDistrict?.toLowerCase().includes(q)
    );
  });

  const selectStaff = async (staff: StaffsType) => {
    setSelectedStaff(staff);
    setIsLoading(true);
    const res = await getServiceHistoryById(staff.staffId);
    if (res.success) {
      setServices([...res.data as unknown as Partial<ServicesType>[]]);
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-1 overflow-auto p-1 space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search staff by name, ID, phone..."
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredStaffs.map((staff) => (
          <Link
            key={staff.staffId}
            href={`/staffs/service-history/${staff.staffId}`}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand/20 hover:shadow-md transition-all text-left"
          >
            <div className="size-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
              <Image src={staff.photoUrl || "/placeholder-avatar.png"} alt={staff.name} width={48} height={48} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{staff.name}</p>
              <p className="text-sm text-gray-500">{staff.phone}</p>
              <p className="text-sm text-gray-500 mt-0.5">- {staff.staffId}</p>
            </div>
            <div className="text-brand">
              <Wrench size={16} />
            </div>
          </Link>
        ))}
      </div>

      {filteredStaffs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>No staff found matching your search.</p>
        </div>
      )}
    </div>
  );
}
