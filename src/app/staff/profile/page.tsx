import { staffLogout, verifyStaffSession } from "@/actions";
import {
  getMyServices,
  getStaffById,
  getStaffProfileStats,
} from "@/actions/staffActions";
import StaffDashboardActions from "@/components/features/staff/StaffDashboardActions";
import { getObjectUrl } from "@/lib/s3";
import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle,
  Clock,
  LogOut,
  MapPin,
  PhoneCall,
  User,
  XCircle,
  Wallet,
  FileText,
  Activity,
  History,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default async function StaffProfilePage() {
  const session = await verifyStaffSession();

  if (!session.isAuth) {
    // The middleware should redirect, but just in case
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">
          Access denied.{" "}
          <Link href="/staff/login" className="text-blue-600">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const userId = session.userId as string;
  // Fetch all data server-side
  const [profileRes, statsRes, servicesRes] = await Promise.all([
    getStaffById(userId),
    getStaffProfileStats(userId),
    getMyServices(userId),
  ]);

  const staffData = profileRes.success ? profileRes.data : null;
  const stats = statsRes.success ? statsRes.data : null;
  const services = servicesRes.success ? (servicesRes.data ?? []) : [];

  if (!staffData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Staff profile not found. Contact admin.
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
      staff_departed: "bg-purple-100 text-purple-800",
      staff_arrived: "bg-indigo-100 text-indigo-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const experienceYears =
    (staffData.hasRepairExperience && staffData.repairExperienceYears) ||
    (staffData.role === "technician"
      ? staffData.repairExperienceYears || 0
      : staffData.installationExperienceYears || 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar: Staff Details */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="size-12 sm:size-16 shrink-0 relative">
                {staffData.photoUrl ? (
                  <Image
                    src={staffData.photoUrl}
                    alt={staffData.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover w-full h-full border-2 border-blue-100"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <h1 className="text-lg sm:text-lg font-bold text-gray-900 leading-tight truncate">
                  {staffData.name}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-gray-500 capitalize flex items-center gap-1">
                  <Briefcase size={14} className="min-w-max" /> 
                  <span className="truncate">{staffData.role}</span> • ID: {staffData.staffId}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500 flex text-xs sm:text-sm tracking-widest">
                    {"★".repeat(Math.floor(stats?.rating || 0))}
                    {"☆".repeat(5 - Math.floor(stats?.rating || 0))}
                  </span>
                  <span className="text-gray-500 text-[10px] sm:text-xs ml-1 font-medium">({stats?.rating || 0})</span>
                </div>
              </div>
            </div>
            <form action={staffLogout}>
              <button className="p-2 sm:p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <LogOut size={20} />
              </button>
            </form>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
              <PhoneCall size={16} className="text-blue-500 shrink-0" />
              <span className="font-semibold truncate">{staffData.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
              <MapPin size={16} className="text-emerald-500 shrink-0" />
              <span className="font-medium truncate block">
                {staffData.currentStreetAddress || "Location not specified"}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-orange-600 font-medium bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 flex items-center justify-center gap-1">
            <ShieldCheck size={14} /> Contact Admin to update your profile details
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-3 sm:p-4 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        
        {/* Stats Grid - Inspired by Customer Actions Grid but for info */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-white aspect-square rounded-[1.25rem] sm:rounded-3xl p-2 sm:p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white mb-1 shadow-lg pointer-events-none">
              <Briefcase className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900 leading-none my-1">{stats?.totalServices || 0}</span>
            <span className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase">Assigned</span>
          </div>
          
          <div className="bg-white aspect-square rounded-[1.25rem] sm:rounded-3xl p-2 sm:p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white mb-1 shadow-lg pointer-events-none">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900 leading-none my-1">{stats?.successfulServices || 0}</span>
            <span className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase">Completed</span>
          </div>

          <div className="bg-white aspect-square rounded-[1.25rem] sm:rounded-3xl p-2 sm:p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-rose-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white mb-1 shadow-lg pointer-events-none">
              <XCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900 leading-none my-1">{stats?.canceledServices || 0}</span>
            <span className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase">Canceled</span>
          </div>

          <div className="bg-white aspect-square rounded-[1.25rem] sm:rounded-3xl p-2 sm:p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-amber-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white mb-1 shadow-lg pointer-events-none">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900 leading-none my-1">{experienceYears}</span>
            <span className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase">Years Exp.</span>
          </div>
        </div>

        {/* Info Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Recent Services */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:col-span-2">
            <div className="px-4 py-3 sm:p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Activity className="text-blue-600 w-5 h-5" />
              <h2 className="text-[15px] sm:text-lg font-bold text-gray-800">Recent Services</h2>
            </div>
            <div className="p-0 overflow-x-auto">
              {services.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No services assigned yet.</div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">
                      <th className="p-3 sm:px-4 py-3">Task ID</th>
                      <th className="p-3 sm:px-4 py-3">Customer</th>
                      <th className="p-3 sm:px-4 py-3">Product</th>
                      <th className="p-3 sm:px-4 py-3">Status</th>
                      <th className="p-3 sm:px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm divide-y divide-gray-100">
                    {services.slice(0, 10).map((service: any) => (
                      <tr key={service.serviceId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 sm:px-4 py-3 font-mono text-gray-500 text-[10px] sm:text-xs font-semibold">
                          #{service.serviceId.substring(0, 8)}
                        </td>
                        <td className="p-3 sm:px-4 py-3 font-medium text-gray-800">
                          {service.customerName}
                          <div className="text-[10px] sm:text-xs text-gray-400 font-normal">{new Date(service.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-3 sm:px-4 py-3 text-gray-600">
                          <span className="font-medium text-gray-800">{service.productModel}</span>
                          <div className="text-[10px] sm:text-xs text-gray-400 capitalize">{service.type} - {service.productType}</div>
                        </td>
                        <td className="p-3 sm:px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide inline-flex ${getStatusColor(service.statusHistory?.[0]?.status || "pending")}`}>
                            {service.statusHistory?.[0]?.status?.replace('_', ' ') || "pending"}
                          </span>
                        </td>
                        <td className="p-3 sm:px-4 py-3">
                          <div className="flex flex-col gap-1.5 min-w-[100px]">
                            {service.statusHistory?.[0]?.status !== "completed" &&
                              service.statusHistory?.[0]?.status !== "canceled" && (
                                <Link
                                  href={`/service-report?serviceId=${service.serviceId}`}
                                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-2.5 py-1.5 rounded-lg text-center transition-colors border border-blue-100"
                                >
                                  Report Task
                                </Link>
                              )}
                            {service.statusHistory?.[0]?.status === "completed" && (
                              <StaffDashboardActions
                                staffId={userId}
                                serviceId={service.serviceId}
                              />
                            )}
                            <Link
                              href={`/service-track?trackingId=${service.serviceId}`}
                              className="text-[10px] text-gray-500 hover:text-gray-700 font-bold text-center underline underline-offset-2"
                            >
                              Track Progress
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:col-span-2">
            <div className="px-4 py-3 sm:p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Wallet className="text-teal-600 w-5 h-5" />
              <h2 className="text-[15px] sm:text-lg font-bold text-gray-800">Payment History</h2>
            </div>
            <div className="p-0 overflow-x-auto">
              {!stats?.payments || stats.payments.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No payment records found.</div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">
                      <th className="p-3 sm:px-4 py-3">Date</th>
                      <th className="p-3 sm:px-4 py-3">Payment ID</th>
                      <th className="p-3 sm:px-4 py-3">Amount</th>
                      <th className="p-3 sm:px-4 py-3">Method</th>
                      <th className="p-3 sm:px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm divide-y divide-gray-100">
                    {stats.payments.map((payment: any) => (
                      <tr key={payment.paymentId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 sm:px-4 py-3 font-medium text-gray-600">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="p-3 sm:px-4 py-3 font-mono text-gray-400 text-[10px] sm:text-xs">
                          {payment.paymentId.substring(0, 8)}
                        </td>
                        <td className="p-3 sm:px-4 py-3 font-bold text-gray-900">
                          ৳{payment.amount.toLocaleString()}
                        </td>
                        <td className="p-3 sm:px-4 py-3 text-gray-600 capitalize">
                          {payment.paymentMethod}
                        </td>
                        <td className="p-3 sm:px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs uppercase font-bold tracking-wide inline-flex ${
                              payment.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : payment.status === "processing"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Detailed Profile Information */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:col-span-2">
            <div className="px-4 py-3 sm:p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <FileText className="text-purple-600 w-5 h-5" />
              <h2 className="text-[15px] sm:text-lg font-bold text-gray-800">Additional Profile Details</h2>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bio</h4>
                  <p className="text-sm font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {staffData.bio || "No bio provided."}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      try {
                        const skills = typeof staffData.skills === "string" 
                          ? JSON.parse(staffData.skills || "[]") 
                          : (staffData.skills || []);
                        
                        if (skills.length === 0) return <span className="text-sm text-gray-500 italic">None listed</span>;
                        
                        return skills.map((skill: string, idx: number) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-100">
                            {skill}
                          </span>
                        ));
                      } catch {
                        return <span className="text-sm text-gray-800">{staffData.skills || "N/A"}</span>;
                      }
                    })()}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Father's Name</h4>
                  <p className="text-sm font-medium text-gray-800">{staffData.fatherName || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Permanent Address</h4>
                  <p className="text-sm font-medium text-gray-800">
                    {[staffData.permanentStreetAddress, staffData.permanentDistrict, staffData.permanentPoliceStation, staffData.permanentPostOffice]
                      .filter(Boolean).join(", ") || "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Preference</h4>
                  <p className="text-sm font-medium text-gray-800 uppercase tracking-wide bg-teal-50 text-teal-800 px-3 py-1.5 rounded-lg border border-teal-100 inline-block">
                    {staffData.paymentPreference || "N/A"}
                  </p>
                </div>
                {staffData.walletNumber && (
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Wallet Number</h4>
                    <p className="text-sm font-mono font-bold text-gray-800 tracking-wider">
                      {staffData.walletNumber}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Identification Cards</h4>
                  <div className="flex gap-3">
                    {staffData.nidFrontPhotoKey && (
                      <div className="relative group rounded-xl overflow-hidden border-2 border-gray-100">
                        <Image
                          src={staffData.nidFrontPhotoUrl || (await getObjectUrl(staffData.nidFrontPhotoKey))}
                          alt="NID Front"
                          width={120}
                          height={80}
                          className="object-cover w-[100px] sm:w-[120px] h-[64px] sm:h-[80px]"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">FRONT</span>
                        </div>
                      </div>
                    )}
                    {staffData.nidBackPhotoKey && (
                      <div className="relative group rounded-xl overflow-hidden border-2 border-gray-100">
                        <Image
                          src={staffData.nidBackPhotoUrl || (await getObjectUrl(staffData.nidBackPhotoKey))}
                          alt="NID Back"
                          width={120}
                          height={80}
                          className="object-cover w-[100px] sm:w-[120px] h-[64px] sm:h-[80px]"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">BACK</span>
                        </div>
                      </div>
                    )}
                    {!staffData.nidFrontPhotoKey && !staffData.nidBackPhotoKey && (
                      <p className="text-sm text-gray-500 italic">No IDs uploaded</p>
                    )}
                  </div>
                </div>

                {staffData.docs && (
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const docs = JSON.parse(staffData.docs || "[]");
                          if (docs.length === 0) return <span className="text-sm text-gray-500 italic">None</span>;
                          return docs.map((doc: string, idx: number) => (
                            <a
                              key={idx}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-purple-50 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-600 hover:bg-purple-100 transition-colors border border-purple-100"
                            >
                              Doc {idx + 1}
                            </a>
                          ));
                        } catch {
                          return <span className="text-sm text-gray-400 italic">Invalid array</span>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
