import { staffLogout, verifyStaffSession } from "@/actions";
import { getStaffById, getStaffProfileStats } from "@/actions/staffActions";
import { getObjectUrl } from "@/lib/s3";
import { Briefcase, FileText, MapPin, PhoneCall, User, Wallet, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StaffLayout } from "@/components/layout/StaffLayout";

export default async function StaffDetailsPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const [profileRes, statsRes] = await Promise.all([
    getStaffById(userId),
    getStaffProfileStats(userId),
  ]);

  const staffData = profileRes.success ? profileRes.data : null;
  const stats = statsRes.success ? statsRes.data : null;

  if (!staffData) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl font-bold">
          Staff profile not found. Contact administrator.
        </div>
      </div>
    );
  }

  // Pre-fetch S3 URLs if not available
  const nidFrontUrl = staffData.nidFrontPhotoKey 
    ? (staffData.nidFrontPhotoUrl || await getObjectUrl(staffData.nidFrontPhotoKey))
    : null;
  const nidBackUrl = staffData.nidBackPhotoKey
    ? (staffData.nidBackPhotoUrl || await getObjectUrl(staffData.nidBackPhotoKey))
    : null;

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="p-4 space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand/5 rounded-xl text-brand">
            <User size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">My Profile Details</h1>
        </div>

        {/* Profile Photo & Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="size-24 sm:size-28 shrink-0 rounded-2xl overflow-hidden border-2 border-brand/5 bg-gray-50 shadow-inner">
            {staffData.photoUrl ? (
              <Image
                src={staffData.photoUrl}
                alt={staffData.name}
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <User size={48} />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left flex-1 space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{staffData.name}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
              <span className="text-sm font-bold text-brand bg-brand/5 px-2.5 py-0.5 rounded-full capitalize">
                {staffData.role}
              </span>
              <span className="text-sm font-bold text-gray-400">
                ID: {staffData.staffId}
              </span>
            </div>
            {staffData.fatherName && (
              <p className="text-sm font-medium text-gray-500 mt-2">
                Father&apos;s Name: <span className="text-gray-700">{staffData.fatherName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Contact & Location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="size-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                <PhoneCall size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Phone Number</p>
                <p className="text-sm font-bold text-gray-800">{staffData.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="size-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Current Address</p>
                <p className="text-sm font-bold text-gray-800 truncate">
                  {[staffData.currentStreetAddress, staffData.currentDistrict, staffData.currentPoliceStation]
                    .filter(Boolean).join(", ") || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Permanent Address */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Permanent Residence</h3>
          <p className="text-sm font-bold text-gray-700 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 leading-relaxed">
            {[staffData.permanentStreetAddress, staffData.permanentDistrict, staffData.permanentPoliceStation, staffData.permanentPostOffice]
              .filter(Boolean).join(", ") || "N/A"}
          </p>
        </div>

        {/* Bio & Skills */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Professional Profile</h3>
          <div className="space-y-5">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 ml-1">About Me</p>
              <p className="text-sm font-medium text-gray-700 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 leading-relaxed italic">
                &ldquo;{staffData.bio || "No bio description provided."}&rdquo;
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 ml-1">Expertise & Skills</p>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  try {
                    const skills = typeof staffData.skills === "string"
                      ? JSON.parse(staffData.skills || "[]")
                      : (staffData.skills || []);
                    if (skills.length === 0) return <span className="text-xs text-gray-400 font-bold ml-1">No skills listed</span>;
                    return skills.map((skill: string, idx: number) => (
                      <span key={idx} className="bg-brand text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {skill}
                      </span>
                    ));
                  } catch {
                    return <span className="text-sm text-gray-500">{staffData.skills || "N/A"}</span>;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Payout Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-teal-50/30 border border-teal-100">
              <div className="size-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-[10px] text-teal-600 font-bold uppercase">Method</p>
                <p className="text-sm font-bold text-teal-800 uppercase tracking-wide">
                  {staffData.paymentPreference || "Not Set"}
                </p>
              </div>
            </div>
            {staffData.walletNumber && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50/30 border border-indigo-100">
                <div className="size-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase">Account / Wallet</p>
                  <p className="text-sm font-mono font-bold text-indigo-900 tracking-wider">
                    {staffData.walletNumber}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NID Photos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Identification Documents</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {nidFrontUrl ? (
              <div className="relative group rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[3/2] flex items-center justify-center">
                <Image
                  src={nidFrontUrl}
                  alt="NID Front"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1.5 text-center">
                  <span className="text-white text-[9px] font-bold uppercase tracking-widest">Front Side</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl aspect-[3/2] flex flex-col items-center justify-center text-gray-300">
                <FileText size={24} />
                <span className="text-[9px] font-bold mt-1">NO FRONT IMAGE</span>
              </div>
            )}
            {nidBackUrl ? (
              <div className="relative group rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[3/2] flex items-center justify-center">
                <Image
                  src={nidBackUrl}
                  alt="NID Back"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1.5 text-center">
                  <span className="text-white text-[9px] font-bold uppercase tracking-widest">Back Side</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl aspect-[3/2] flex flex-col items-center justify-center text-gray-300">
                <FileText size={24} />
                <span className="text-[9px] font-bold mt-1">NO BACK IMAGE</span>
              </div>
            )}
          </div>
          {!nidFrontUrl && !nidBackUrl && (
            <p className="text-xs text-gray-400 uppercase font-bold text-center mt-4">NID documentation missing from records</p>
          )}
        </div>

        {/* Logout Section */}
        <div className="pt-2 pb-6">
          <form action={staffLogout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-rose-50 text-rose-500 font-black text-sm uppercase hover:bg-rose-100 transition-all border border-rose-100 shadow-sm"
            >
              <LogOut size={20} />
              Logout from account
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
            SE Electronics Staff Portal v2.0
          </p>
        </div>
      </div>
    </StaffLayout>
  );
}
