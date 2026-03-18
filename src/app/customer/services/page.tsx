import { verifyCustomerSession } from "@/actions/customerActions";
import { getServiceHistoryById } from "@/actions/serviceActions";
import { AppError } from "@/utils";
import { 
  Calendar, 
  Navigation, 
  Plus, 
  Settings, 
  Zap, 
  FileText, 
  MessageSquareText,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import clsx from "clsx";
import { MobilePageHeader } from "@/components/layout";

export default async function CustomerServicesPage() {
  const session = await verifyCustomerSession();

  if (!session.isAuth || !session.customer) {
    redirect("/customer/login");
  }

  const { customer } = session;
  const servicesRes = await getServiceHistoryById(customer.customerId);

  if (!servicesRes.success) {
    throw new AppError("Failed to load services");
  }

  const services = servicesRes.data || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
      <MobilePageHeader 
        title="My Services" 
        backHref="/customer/profile" 
        Icon={Settings}
      />

      {/* Premium Dark Header (Desktop Only) */}
      <header className="hidden md:block sticky top-0 z-50 bg-brand text-white shadow-xl">
        <div className="max-w-xl mx-auto px-4 h-20 flex items-center gap-4 relative">
          <Link
            href="/customer/profile"
            className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 active:scale-95"
          >
            <ArrowLeft size={22} />
          </Link>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-lg font-black tracking-[0.15em] uppercase truncate">My Services</h1>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5">Service History & Status</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto p-4 sm:p-6 flex flex-col gap-8">
        {/* Request New Service - Premium Card */}
        <Link
          href="/get-service"
          className="group relative bg-brand-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-brand/20 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 size-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 group-hover:rotate-12 transition-transform">
              <Plus size={32} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Need Support?</h2>
              <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">Submit a new request today</p>
            </div>
          </div>
        </Link>

        {/* Service List Header */}
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em]">Recent Requests</h3>
           <div className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {services.length} Records
           </div>
        </div>

        {/* Service List */}
        <div className="flex flex-col gap-6">
          {services.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="bg-gray-50 p-8 rounded-full mb-6">
                <Settings size={48} className="text-gray-300 animate-spin-slow" />
              </div>
              <h3 className="text-gray-900 font-black text-xl mb-2">No Records Found</h3>
              <p className="text-gray-500 text-sm font-medium max-w-[15rem]">
                You haven't requested any services in our records yet.
              </p>
            </div>
          ) : (
            services.map((service) => {
              const currentStatus = service.statusHistory?.[0]?.status || "pending";
              const isCompleted = currentStatus === "completed";
              const isCanceled = currentStatus === "canceled";

              let statusLabel = "Processing";
              let statusIcon = Clock;
              let statusColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
              let stripeColor = "bg-amber-500";

              if (isCompleted) {
                statusLabel = "Completed";
                statusIcon = CheckCircle2;
                statusColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                stripeColor = "bg-emerald-500";
              } else if (isCanceled) {
                statusLabel = "Canceled";
                statusIcon = XCircle;
                statusColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
                stripeColor = "bg-rose-500";
              }

              const serviceDate = new Date(service.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              const StatusIcon = statusIcon;

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  {/* Status Indicator Stripe */}
                  <div className={clsx("absolute top-0 left-0 w-2 h-full", stripeColor)} />

                  <div className="p-6">
                    {/* Top Row: Type and Badge */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-50 text-brand rounded-2xl group-hover:scale-110 transition-transform">
                          {service.type === "install" ? <Zap size={22} /> : <Settings size={22} />}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{service.type === 'install' ? 'Installation' : 'Maintenance'}</p>
                           <h4 className="font-black text-gray-900 leading-tight">
                              {service.productType}
                           </h4>
                        </div>
                      </div>
                      <div className={clsx("px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2", statusColor)}>
                         <StatusIcon size={14} />
                         {statusLabel}
                      </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="ml-14 mb-8">
                       <h3 className="text-xl font-black text-gray-900 mb-1">
                          {service.productModel}
                       </h3>
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400 text-xs font-bold uppercase tracking-tight">
                          <span className="flex items-center gap-1.5">
                             <AlertCircle size={14} className="text-brand-300" />
                             {service.serviceId}
                          </span>
                          <span className="flex items-center gap-1.5">
                             <Calendar size={14} className="text-brand-300" />
                             {serviceDate}
                          </span>
                       </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-3 gap-3 border-t border-gray-50 pt-5">
                      <Link
                        href={`/customer/services/${service.serviceId}`}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 text-gray-600 hover:bg-brand-50 hover:text-brand transition-all active:scale-95"
                      >
                        <FileText size={20} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Details</span>
                      </Link>
                      
                      <Link
                        href={`/service-track?trackingId=${service.serviceId}`}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all active:scale-95"
                      >
                        <Navigation size={20} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Track</span>
                      </Link>

                      <Link
                        href={isCompleted ? `/service-feedback?serviceId=${service.serviceId}` : "#"}
                        className={clsx(
                          "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all active:scale-95",
                          isCompleted 
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                            : "bg-gray-50 text-gray-300 cursor-not-allowed grayscale"
                        )}
                      >
                        <MessageSquareText size={20} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Feedback</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Subtle bottom accent */}
      <div className="text-center mt-6">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">SE Electronics Portal v6.0</p>
      </div>
    </div>
  );
}
