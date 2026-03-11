import { verifyStaffSession } from "@/actions";
import { getStaffById } from "@/actions/staffActions";
import { getObjectUrl } from "@/lib/s3";
import { ArrowLeft, Briefcase, FileText, MapPin, PhoneCall, User, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function StaffDetailsPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const profileRes = await getStaffById(userId);
  const staffData = profileRes.success ? profileRes.data : null;

  if (!staffData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Staff profile not found. Contact admin.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-3">
          <Link href="/staff/profile" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <User size={20} className="text-blue-200" />
            <h1 className="text-lg font-bold">My Profile Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 py-4 sm:py-6 space-y-4">
        {/* Profile Photo & Basic Info */}
        <div className="__card p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="size-24 sm:size-28 shrink-0 rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50">
            {staffData.photoUrl ? (
              <Image
                src={staffData.photoUrl}
                alt={staffData.name}
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User size={40} />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-gray-900">{staffData.name}</h2>
            <p className="text-sm text-gray-500 capitalize flex items-center justify-center sm:justify-start gap-1 mt-1">
              <Briefcase size={14} /> {staffData.role} • ID: {staffData.staffId}
            </p>
            <p className="text-sm text-gray-500 mt-1">{staffData.fatherName ? `Father: ${staffData.fatherName}` : ""}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="__card p-5 sm:p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <PhoneCall size={18} className="text-brand shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Phone</p>
                <p className="text-sm font-semibold text-gray-800">{staffData.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <MapPin size={18} className="text-brand shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Current Address</p>
                <p className="text-sm font-semibold text-gray-800">
                  {[staffData.currentStreetAddress, staffData.currentDistrict, staffData.currentPoliceStation]
                    .filter(Boolean).join(", ") || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Permanent Address */}
        <div className="__card p-5 sm:p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Permanent Address</h3>
          <p className="text-sm font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {[staffData.permanentStreetAddress, staffData.permanentDistrict, staffData.permanentPoliceStation, staffData.permanentPostOffice]
              .filter(Boolean).join(", ") || "N/A"}
          </p>
        </div>

        {/* Bio & Skills */}
        <div className="__card p-5 sm:p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Bio & Skills</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Bio</p>
              <p className="text-sm font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {staffData.bio || "No bio provided."}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(() => {
                  try {
                    const skills = typeof staffData.skills === "string"
                      ? JSON.parse(staffData.skills || "[]")
                      : (staffData.skills || []);
                    if (skills.length === 0) return <span className="text-sm text-gray-500 italic">None listed</span>;
                    return skills.map((skill: string, idx: number) => (
                      <span key={idx} className="bg-brand-50 text-brand text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-100">
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
        <div className="__card p-5 sm:p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <Wallet size={18} className="text-teal-600 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Payment Method</p>
                <p className="text-sm font-semibold text-gray-800 uppercase">{staffData.paymentPreference || "N/A"}</p>
              </div>
            </div>
            {staffData.walletNumber && (
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Wallet size={18} className="text-teal-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Wallet Number</p>
                  <p className="text-sm font-mono font-bold text-gray-800 tracking-wider">{staffData.walletNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NID Photos */}
        <div className="__card p-5 sm:p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Identification Cards</h3>
          <div className="flex gap-3 flex-wrap">
            {staffData.nidFrontPhotoKey && (
              <div className="relative group rounded-xl overflow-hidden border-2 border-gray-100">
                <Image
                  src={staffData.nidFrontPhotoUrl || (await getObjectUrl(staffData.nidFrontPhotoKey))}
                  alt="NID Front"
                  width={150}
                  height={100}
                  className="object-cover w-[120px] sm:w-[150px] h-[80px] sm:h-[100px]"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold">FRONT</span>
                </div>
              </div>
            )}
            {staffData.nidBackPhotoKey && (
              <div className="relative group rounded-xl overflow-hidden border-2 border-gray-100">
                <Image
                  src={staffData.nidBackPhotoUrl || (await getObjectUrl(staffData.nidBackPhotoKey))}
                  alt="NID Back"
                  width={150}
                  height={100}
                  className="object-cover w-[120px] sm:w-[150px] h-[80px] sm:h-[100px]"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold">BACK</span>
                </div>
              </div>
            )}
            {!staffData.nidFrontPhotoKey && !staffData.nidBackPhotoKey && (
              <p className="text-sm text-gray-500 italic">No NID photos uploaded</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
