import {
  customerLogout,
  getCustomerById,
  verifyCustomerSession,
} from "@/actions/customerActions";
import { getServiceHistoryById } from "@/actions/serviceActions";
import { getSubscriptionsByPhone } from "@/actions/subscriptionActions";
import { StatusBadge } from "@/components";
import CustomerDashboardActions from "@/components/features/customers/CustomerDashboardActions";
import ServiceStepper from "@/components/features/services/ServiceStepper";
import {
  ChevronRight,
  CreditCard,
  ExternalLink,
  History,
  LogOut,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default async function CustomerProfilePage() {
  const session = await verifyCustomerSession();

  if (!session.isAuth) {
    return null;
  }

  const customer = session.customer!;

  const [servicesRes, customerRes, subscriptionsRes] = await Promise.all([
    getServiceHistoryById(customer.customerId),
    getCustomerById(customer.customerId),
    getSubscriptionsByPhone(customer.phone),
  ]);

  const services = servicesRes.success ? servicesRes.data! : [];
  const customerDetails = customerRes.success ? customerRes.data : null;
  const invoiceNumber = customerDetails?.invoiceNumber;
  const subscriptions =
    subscriptionsRes.success && subscriptionsRes.data
      ? subscriptionsRes.data
      : [];

  const latestActiveService = services.find(
    (s) =>
      !["completed", "canceled"].includes(
        s.statusHistory?.[s.statusHistory.length - 1]?.status,
      ),
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {/* Header section with floating info */}
        <section className="relative flex flex-col md:flex-row justify-between items-end gap-12 bg-black rounded-[40px] p-12 overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-white/10 text-white/60 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/5">
                Member Account
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                Verified
              </span>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight">
              Hello, {customer.name}
            </h1>
            <p className="text-gray-400 text-lg font-medium max-w-lg">
              Access your service history, track active repairs and manage your
              device warranties in one premium space.
            </p>
          </div>

          <div className="relative z-10 flex gap-4 w-full md:w-auto">
            <Link
              href="/get-service"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black px-10 py-5 rounded-2xl font-black text-sm hover:scale-[1.05] transition-all active:scale-[0.98] shadow-soft hover:bg-white/90"
            >
              <Wrench size={18} />
              Book Service
            </Link>
            <form action={customerLogout} className="flex-1 md:flex-none">
              <button className="w-full flex items-center justify-center gap-2 bg-white/10 text-white border border-white/10 px-10 py-5 rounded-2xl font-black text-sm hover:bg-white/20 transition-all active:scale-[0.98]">
                <LogOut size={18} />
                Logout
              </button>
            </form>
          </div>

          {/* Abstract elements */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            {/* Active Service Status (The vertical progress bar) */}
            {latestActiveService ? (
              <section className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 relative overflow-hidden group">
                <header className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
                      <Zap className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Active Service Tracker
                    </h2>
                  </div>
                  <span className="text-sm font-mono text-gray-400">
                    ID: {latestActiveService.serviceId}
                  </span>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
                  <div className="md:col-span-3">
                    <ServiceStepper
                      type={latestActiveService.type as "repair" | "install"}
                      history={latestActiveService.statusHistory}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-8">
                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        Device Details
                      </p>
                      <h4 className="text-xl font-black text-gray-900">
                        {latestActiveService.productModel}
                      </h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mt-1">
                        {latestActiveService.productType}
                      </p>
                      <hr className="my-6 border-gray-200" />
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400 font-bold uppercase tracking-tighter">
                            Request Type
                          </span>
                          <span className="text-blue-600 font-black italic">
                            {latestActiveService.type}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400 font-bold uppercase tracking-tighter">
                            Registered On
                          </span>
                          <span className="text-gray-700 font-bold">
                            {new Date(
                              latestActiveService.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {latestActiveService.staffName && (
                      <div className="bg-black text-white rounded-3xl p-6 shadow-xl shadow-gray-200">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 flex items-center justify-between">
                          Assigned Staff
                          <Star
                            size={10}
                            className="text-yellow-400 fill-yellow-400"
                          />
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/5">
                            <span className="text-xl font-black">@</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-black">
                              {latestActiveService.staffName}
                            </h4>
                            <a
                              href={`tel:${latestActiveService.staffPhone}`}
                              className="text-xs text-white/60 font-medium hover:text-white transition-colors"
                            >
                              {latestActiveService.staffPhone}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              <section className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-100">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                  <History size={40} className="text-gray-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  No Active Repairs
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto font-medium">
                  Everything looks good! Your devices are currently running
                  smooth.
                </p>
              </section>
            )}

            {/* Service History Table */}
            <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                  <History className="text-gray-200" size={32} />
                  Complete History
                </h2>
                <span className="text-xs bg-gray-100 px-4 py-2 rounded-full font-black text-gray-500 uppercase tracking-widest border border-gray-200/50">
                  {services.length} Records
                </span>
              </div>

              {services.length === 0 ? (
                <div className="p-20 text-center">
                  <p className="text-gray-300 font-bold uppercase tracking-widest text-xs">
                    No records available
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#FBFCFF]">
                      <tr>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          ID
                        </th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Device
                        </th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Technician
                        </th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {services.map((service: any) => (
                        <tr
                          key={service.serviceId}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-10 py-8 font-mono text-sm text-gray-400">
                            #{service.serviceId}
                          </td>
                          <td className="px-10 py-8">
                            <div className="font-black text-gray-900 text-lg leading-tight">
                              {service.productModel}
                            </div>
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1">
                              {service.type} - {service.productType}
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <StatusBadge
                              status={
                                service.statusHistory?.[
                                  service.statusHistory.length - 1
                                ]?.status || "pending"
                              }
                            />
                          </td>
                          <td className="px-10 py-8">
                            <div className="font-bold text-gray-900 italic">
                              {service.staffName || "Queueing"}
                            </div>
                            {service.appointedStaff?.rating > 0 && (
                              <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                                <Star size={10} fill="currentColor" />
                                <span className="font-bold">
                                  {service.appointedStaff.rating}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/service-track?trackingId=${service.serviceId}`}
                                className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-black hover:text-white transition-all shadow-soft group-hover:bg-white group-hover:border group-hover:border-gray-100"
                              >
                                <ExternalLink size={16} />
                              </Link>
                              {service.staffId && (
                                <CustomerDashboardActions
                                  assignedStaff={{
                                    staffId: service.staffId,
                                    name: service.staffName || "Staff",
                                    serviceId: service.serviceId,
                                  }}
                                  customerId={customer.customerId}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Area (Right) */}
          <div className="lg:col-span-4 flex flex-col gap-12">
            {/* Quick Actions Card */}
            <section className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
                <CreditCard size={24} />
                Quick Tools
              </h3>
              <div className="grid grid-cols-1 gap-4 relative z-10">
                <Link
                  href={`/pdf/download?type=invoice&id=${invoiceNumber}`}
                  className="flex items-center justify-between bg-white text-black p-6 rounded-3xl font-black text-sm hover:scale-[1.02] transition-all active:scale-[0.98]"
                >
                  Download Latest Invoice
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/check-warranty"
                  className="flex items-center justify-between bg-white/10 text-white border border-white/20 p-6 rounded-3xl font-black text-sm hover:bg-white/20 transition-all active:scale-[0.98]"
                >
                  Product Warranty Info
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/get-service"
                  className="flex items-center justify-between bg-white/10 text-white border border-white/20 p-6 rounded-3xl font-black text-sm hover:bg-white/20 transition-all active:scale-[0.98]"
                >
                  New Service Inquiry
                  <ChevronRight size={16} />
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
            </section>

            {/* Subscriptions section */}
            <section className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Zap className="text-emerald-500" size={24} />
                  Subscriptions
                </h3>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                  {subscriptions.length} active
                </span>
              </div>

              <div className="space-y-4">
                {subscriptions.length > 0 ? (
                  subscriptions.map((sub: any) => (
                    <div
                      key={sub.subscriptionId}
                      className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-emerald-500 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-gray-900 italic text-lg">
                          {sub.subscriptionType}
                        </h4>
                        <div className="size-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                          <CheckCircle2 size={18} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                        <span>{sub.subscriptionDuration} Months</span>
                        <span>•</span>
                        <span>৳{sub.totalFee?.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] font-mono text-gray-300 mt-4">
                        ID: {sub.subscriptionId}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                      No active subscriptions
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Support Card */}
            <section className="bg-emerald-50 rounded-[40px] p-10 border border-emerald-100">
              <h3 className="text-xl font-black text-emerald-800 mb-6 flex items-center gap-2">
                <ShieldCheck size={20} />
                Support Status
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-2.5 rounded-2xl">
                    <Phone size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest mb-0.5">
                      Helpline
                    </p>
                    <a
                      href={`tel:${process.env.ADMIN_PHONE_NUMBER}`}
                      className="text-emerald-900 font-black text-lg"
                    >
                      {process.env.ADMIN_PHONE_NUMBER || "+880 1234 5678"}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-2.5 rounded-2xl">
                    <MapPin size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest mb-0.5">
                      Main Center
                    </p>
                    <p className="text-emerald-900 font-black text-sm">
                      SE Electronics, Mirpur-10, Dhaka
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
