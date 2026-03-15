import { verifyStaffSession } from "@/actions";
import {
  getStaffById,
  getStaffProfileStats,
  staffLogout,
} from "@/actions/staffActions";
import { getObjectUrl } from "@/lib/s3";
import {
  Briefcase,
  FileText,
  LogOut,
  MapPin,
  PhoneCall,
  User,
  Wallet,
} from "lucide-react";
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
  console.log(staffData, "staff data");
  //  this is my staff data valid infor mation in staff data
  //   bankInfo
  // :
  // null
  // bio
  // :
  // null
  // canceledServices
  // :
  // 2
  // createdAt
  // :
  // Thu Mar 12 2026 12:53:07 GMT-0700 (Pacific Daylight Time) {}
  // createdFrom
  // :
  // "dashboard"
  // currentDistrict
  // :
  // "Dhaka"
  // currentPoliceStation
  // :
  // null
  // currentPostOffice
  // :
  // null
  // currentStreetAddress
  // :
  // "778 Zulauf Manors"
  // docs
  // :
  // null
  // fatherName
  // :
  // "Wilbur Marks"
  // hasInstallationExperience
  // :
  // false
  // hasRepairExperience
  // :
  // false
  // id
  // :
  // "3b7a79d6-8d7a-4bf1-bb5b-c740b9cee891"
  // installationExperienceYears
  // :
  // 0
  // ipAddress
  // :
  // null
  // isActiveStaff
  // :
  // true
  // isVerified
  // :
  // true
  // name
  // :
  // "Mrs. Blanche DuBuque"
  // nidBackPhotoKey
  // :
  // "demo/nid_back.jpg"
  // nidBackPhotoUrl
  // :
  // "https://service-manager.45739e2ef39226b7c581576fc26bd700.r2.cloudflarestorage.com/demo/nid_back.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=14d657e13ee022a16c895beca8ac3d24%2F20260314%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260314T173120Z&X-Amz-Expires=86400&X-Amz-Signature=f922893a809d27b3beb9651fb843148ab8fa116225d32fab57923a65c61f7a49&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
  // nidFrontPhotoKey
  // :
  // "demo/nid_front.jpg"
  // nidFrontPhotoUrl
  // :
  // "https://service-manager.45739e2ef39226b7c581576fc26bd700.r2.cloudflarestorage.com/demo/nid_front.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=14d657e13ee022a16c895beca8ac3d24%2F20260314%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260314T173120Z&X-Amz-Expires=86400&X-Amz-Signature=df08042eebbf84fa7ff90f2511f3276c6b16fd4a4b35631c3e73a1a038036674&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
  // password
  // :
  // "$2b$10$N7CHl3OD7RvpzFVg283vnucmEjsTmC/2/QS.F28Mb4uDH3pC5hUAi"
  // paymentPreference
  // :
  // "cash"
  // permanentDistrict
  // :
  // "Dhaka"
  // permanentPoliceStation
  // :
  // null
  // permanentPostOffice
  // :
  // null
  // permanentStreetAddress
  // :
  // "692 Edward Creek"
  // phone
  // :
  // "+8801317806120"
  // photoKey
  // :
  // "demo/photo.jpg"
  // photoUrl
  // :
  // "https://service-manager.45739e2ef39226b7c581576fc26bd700.r2.cloudflarestorage.com/demo/photo.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=14d657e13ee022a16c895beca8ac3d24%2F20260314%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260314T173120Z&X-Amz-Expires=86400&X-Amz-Signature=e239640cace62a6b28119f400fe1fd3677d8a6b65c618ba75534b9e5d496b1d8&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
  // profileCompleted
  // :
  // true
  // rating
  // :
  // 0
  // repairExperienceYears
  // :
  // 0
  // role
  // :
  // "technician"
  // skills
  // :
  // null
  // staffId
  // :
  // "STF79225"
  // successfulServices
  // :
  // 0
  // totalServices
  // :
  // 4
  // updatedAt
  // :
  // Sat Mar 14 2026 05:39:49 GMT-0700 (Pacific Daylight Time) {}
  // userAgent
  // :
  // null
  // username
  // :
  // "01310673602"
  // walletNumber
  // :
  // null
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
    ? staffData.nidFrontPhotoUrl ||
      (await getObjectUrl(staffData.nidFrontPhotoKey))
    : null;
  const nidBackUrl = staffData.nidBackPhotoKey
    ? staffData.nidBackPhotoUrl ||
      (await getObjectUrl(staffData.nidBackPhotoKey))
    : null;

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="min-h-screen bg-gray-100 ">
        {/* HEADER */}
        <div className="bg-brand text-white px-4 sm:px-6 py-5 sm:py-6 mt-5 rounded-t-md shadow-sm mx-2">
          <div className="max-w-6xl mx-auto flex  justify-between items-center gap-4">
            {/* Title */}
            <h1 className="text-lg sm:text-xl font-bold tracking-wide">
              Staff Profile
            </h1>

            {/* Logout */}
            <form action={staffLogout}>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white text-sm font-bold shadow-sm"
              >
                <LogOut size={18} />
                Logout
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-12 pb-10 space-y-6 ">
          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow">
              <Image
                src={staffData.photoUrl}
                alt={staffData.name}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>

            <div className="text-center md:text-left flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {staffData.name}
              </h2>

              <p className="text-lg text-gray-600">
                Staff ID: {staffData.staffId}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="bg-brand/10 text-brand text-sm font-bold px-3 py-2 rounded-md capitalize">
                  {staffData.role}
                </span>

                {staffData.isVerified && (
                  <span className="bg-green-100 text-green-600 text-sm font-bold px-3 py-2 rounded-md">
                    Verified
                  </span>
                )}

                {staffData.isActiveStaff && (
                  <span className="bg-blue-100 text-blue-600 text-sm font-bold px-3 py-2 rounded-md">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* PERFORMANCE STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-100 border border-green-400  p-3 rounded-md shadow-sm  text-center">
              <p className="text-2xl font-bold text-green-600">
                {staffData.totalServices}
              </p>
              <p className="text-xs text-green-600 font-bold uppercase">
                Total Services
              </p>
            </div>

            <div className="bg-violet-100 border border-violet-400  p-3 rounded-md shadow-sm  text-center">
              <p className="text-2xl font-bold text-violet-600">
                {staffData.successfulServices}
              </p>
              <p className="text-xs text-violet-600 font-bold uppercase">
                Successful
              </p>
            </div>

            <div className="bg-red-100 border border-red-400  p-3 rounded-md shadow-sm  text-center">
              <p className="text-2xl font-bold text-red-500">
                {staffData.canceledServices}
              </p>
              <p className="text-xs text-red-500 font-bold uppercase">
                Canceled
              </p>
            </div>

            <div className="bg-orange-100 border border-orange-400  p-3 rounded-md shadow-sm  text-center">
              <p className="text-2xl font-bold text-orange-500">
                {staffData.rating}
              </p>
              <p className="text-xs text-orange-500 font-bold uppercase">
                Rating
              </p>
            </div>
          </div>

          {/* INFO GRID */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* CONTACT */}
            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase">
                Contact
              </h3>

              <p className="text-md font-semibold text-gray-800">
                Phone: {staffData.phone}
              </p>

              <p className="text-md text-gray-700">
                Father: {staffData.fatherName}
              </p>
            </div>

            {/* EXPERIENCE */}
            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase">
                Experience
              </h3>

              <p className="text-md text-gray-700">
                Repair Experience:{" "}
                {staffData.hasRepairExperience
                  ? `${staffData.repairExperienceYears} Years`
                  : "No"}
              </p>

              <p className="text-md text-gray-700">
                Installation Experience:{" "}
                {staffData.hasInstallationExperience
                  ? `${staffData.installationExperienceYears} Years`
                  : "No"}
              </p>
            </div>

            {/* ADDRESSES */}
            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase">
                Current Address
              </h3>

              <p className="text-md text-gray-700">
                {staffData.currentStreetAddress}, {staffData.currentDistrict}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-3">
              <h3 className="text-md font-bold text-gray-400 uppercase">
                Permanent Address
              </h3>

              <p className="text-md text-gray-700">
                {staffData.permanentStreetAddress},{" "}
                {staffData.permanentDistrict}
              </p>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
              Payment Method
            </h3>

            <p className="text-md font-semibold text-gray-800 uppercase">
              {staffData.paymentPreference}
            </p>
          </div>

          {/* NID DOCUMENTS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
              NID Documents
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Image
                src={staffData.nidFrontPhotoUrl}
                alt="NID Front"
                width={300}
                height={200}
                className="rounded-lg border"
              />

              <Image
                src={staffData.nidBackPhotoUrl}
                alt="NID Back"
                width={300}
                height={200}
                className="rounded-lg border"
              />
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
