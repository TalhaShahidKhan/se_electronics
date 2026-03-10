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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-6">
            {staffData.photoUrl && (
              <Image
                src={staffData.photoUrl}
                alt={staffData.name}
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{staffData.name}</h1>
              <p className="text-gray-600 capitalize">{staffData.role}</p>
              <p className="text-sm text-gray-500">ID: {staffData.staffId}</p>
              <p className="text-sm text-gray-500">
                Username:{" "}
                {(staffData as { username?: string }).username || "Not set"}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-yellow-500">
                  {"★".repeat(Math.floor(stats?.rating || 0))}
                  {"☆".repeat(5 - Math.floor(stats?.rating || 0))}
                  <span className="text-gray-600 ml-1">
                    ({stats?.rating || 0})
                  </span>
                </span>
                <span className="text-sm text-gray-600">
                  {stats?.totalServices || 0} services
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <button
                  disabled
                  className="bg-gray-100 text-gray-400 px-4 py-2 rounded cursor-not-allowed border border-gray-200"
                  title="Only admin can change staff details"
                >
                  Edit Profile
                </button>
                <form action={staffLogout}>
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Logout
                  </button>
                </form>
              </div>
              <p className="text-[10px] text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded border border-orange-100">
                * Contact Admin to update your profile details
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded text-center">
            <div className="text-2xl font-bold">
              {stats?.totalServices || 0}
            </div>
            <div className="text-sm text-gray-600">Total Services</div>
          </div>
          <div className="bg-green-50 p-4 rounded text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats?.successfulServices || 0}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-red-50 p-4 rounded text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats?.canceledServices || 0}
            </div>
            <div className="text-sm text-gray-600">Canceled</div>
          </div>
          <div className="bg-blue-50 p-4 rounded text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(staffData.hasRepairExperience &&
                staffData.repairExperienceYears) ||
                (staffData.role === "technician"
                  ? staffData.repairExperienceYears || 0
                  : staffData.installationExperienceYears || 0)}
            </div>
            <div className="text-sm text-gray-600">Experience (Years)</div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div>
            <strong>Phone:</strong> {staffData.phone}
          </div>
          <div>
            <strong>Address:</strong> {staffData.currentStreetAddress},{" "}
            {staffData.currentDistrict}, {staffData.currentPoliceStation},{" "}
            {staffData.currentPostOffice}
          </div>
          <div>
            <strong>Skills:</strong>{" "}
            {typeof staffData.skills === "string"
              ? (() => {
                  try {
                    return (
                      JSON.parse(staffData.skills || "[]") as string[]
                    ).join(", ");
                  } catch {
                    return staffData.skills || "N/A";
                  }
                })()
              : (staffData.skills || []).join(", ")}
          </div>
          <div>
            <strong>Bio:</strong> {staffData.bio || "N/A"}
          </div>
          <div>
            <strong>Father's Name:</strong> {staffData.fatherName}
          </div>
          <div>
            <strong>Permanent Address:</strong>{" "}
            {staffData.permanentStreetAddress}, {staffData.permanentDistrict},{" "}
            {staffData.permanentPoliceStation}, {staffData.permanentPostOffice}
          </div>
          <div>
            <strong>Payment Preference:</strong> {staffData.paymentPreference}
          </div>
          {staffData.walletNumber && (
            <div>
              <strong>Wallet Number:</strong> {staffData.walletNumber}
            </div>
          )}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold mb-2">Identification & Documents</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">NID Front</p>
                {staffData.nidFrontPhotoKey && (
                  <Image
                    src={
                      staffData.nidFrontPhotoUrl ||
                      (await getObjectUrl(staffData.nidFrontPhotoKey))
                    }
                    alt="NID Front"
                    width={200}
                    height={120}
                    className="rounded border"
                  />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">NID Back</p>
                {staffData.nidBackPhotoKey && (
                  <Image
                    src={
                      staffData.nidBackPhotoUrl ||
                      (await getObjectUrl(staffData.nidBackPhotoKey))
                    }
                    alt="NID Back"
                    width={200}
                    height={120}
                    className="rounded border"
                  />
                )}
              </div>
            </div>
            {staffData.docs && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Other Documents</p>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    try {
                      const docs = JSON.parse(staffData.docs || "[]");
                      return docs.map((doc: string, idx: number) => (
                        <a
                          key={idx}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 px-3 py-1 rounded text-sm text-blue-600 hover:underline"
                        >
                          Doc {idx + 1}
                        </a>
                      ));
                    } catch {
                      return <span className="text-gray-400 italic">None</span>;
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service History */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Recent Services</h2>
        {services.length === 0 ? (
          <p className="text-gray-500">No services assigned yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Service ID</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service: any) => (
                  <tr key={service.serviceId} className="border-b">
                    <td className="p-2 font-mono text-sm">
                      {service.serviceId}
                    </td>
                    <td className="p-2">{service.customerName}</td>
                    <td className="p-2">
                      {service.productModel} ({service.productType})
                    </td>
                    <td className="p-2">{service.type}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusColor(service.statusHistory?.[0]?.status || "pending")}`}
                      >
                        {service.statusHistory?.[0]?.status || "pending"}
                      </span>
                    </td>
                    <td className="p-2">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 space-y-1">
                      {service.statusHistory?.[0]?.status !== "completed" &&
                        service.statusHistory?.[0]?.status !== "canceled" && (
                          <Link
                            href={`/service-report?serviceId=${service.serviceId}`}
                            className="text-blue-600 hover:underline text-xs font-bold block"
                          >
                            REPORT TASK
                          </Link>
                        )}
                      {service.statusHistory?.[0]?.status === "completed" && (
                        <StaffDashboardActions
                          staffId={session.userId!}
                          serviceId={service.serviceId}
                        />
                      )}
                      <Link
                        href={`/service-track?trackingId=${service.serviceId}`}
                        className="text-gray-400 hover:text-gray-600 text-[10px] font-bold block"
                      >
                        TRACKING LINK
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment History */}
      {stats?.payments && stats.payments.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Payment ID</th>
                  <th className="text-left p-2">Amount (Tk)</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.payments.map((payment: any) => (
                  <tr key={payment.paymentId} className="border-b">
                    <td className="p-2 font-mono text-sm">
                      {payment.paymentId}
                    </td>
                    <td className="p-2 font-bold">
                      ৳{payment.amount.toLocaleString()}
                    </td>
                    <td className="p-2 capitalize">{payment.paymentMethod}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
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
                    <td className="p-2 text-gray-500 text-sm">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
