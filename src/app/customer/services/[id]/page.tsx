import { getServiceById } from "@/actions";
import { verifyCustomerSession } from "@/actions/customerActions";
import { ImageWithLightbox, StatusBadge } from "@/components/ui";
import { formatDate } from "@/utils";
import { 
  ArrowLeft, 
  Settings, 
  Zap, 
  User, 
  Smartphone, 
  Calendar, 
  MapPin, 
  Phone,
  CheckCircle2,
  Clock,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifyCustomerSession();

  if (!session.isAuth || !session.customer) {
    redirect("/customer/login");
  }

  const response = await getServiceById(id);

  if (!response.success) {
    if (response.message === "Service not found") {
      notFound();
    }
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
          {response.message}
        </div>
      </div>
    );
  }

  const service = response.data;

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/customer/services"
            className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 border-l pl-4 border-gray-100">Service Details</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto p-4 flex flex-col gap-6">
        {/* Status Card */}
        <div className="bg-gradient-to-br from-brand to-brand-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Service Identifier</p>
                <h2 className="text-2xl font-black tracking-wider">{service.serviceId}</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <span className="text-xs font-black uppercase tracking-widest">
                  {service.type === "install" ? "Installation" : "Repair"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Clock className="text-white/80" />
               </div>
               <div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Request Date</p>
                  <p className="font-bold">{formatDate(service.createdAt)}</p>
               </div>
            </div>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute -right-8 -bottom-8 size-48 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute left-1/4 top-0 size-24 bg-brand-light/20 rounded-full blur-2xl" />
        </div>

        {/* Timeline Preview (Current Status) */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] mb-6 px-2">Status Timeline</h3>
          <div className="flex flex-col gap-6">
            {service.statusHistory.map((history: any, idx: number) => (
              <div key={idx} className="flex gap-4 relative">
                {/* Line connects to next item */}
                {idx < service.statusHistory.length - 1 && (
                  <div className="absolute left-[1.35rem] top-10 w-0.5 h-10 bg-gray-100" />
                )}
                <div className={`shrink-0 size-11 rounded-2xl flex items-center justify-center z-10 ${
                  idx === service.statusHistory.length - 1 ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-gray-50 text-gray-400'
                }`}>
                  {idx === service.statusHistory.length - 1 ? <CheckCircle2 size={24} /> : <div className="size-2 bg-gray-300 rounded-full" />}
                </div>
                <div className="flex-1 pt-1">
                   <div className="flex justify-between items-start">
                      <p className={`text-sm font-black uppercase tracking-tight ${idx === service.statusHistory.length - 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {history.statusType === 'system' ? history.status : history.customLabel || 'Update'}
                      </p>
                      <span className="text-[10px] text-gray-400 font-bold">{formatDate(history.createdAt)}</span>
                   </div>
                   {history.customNote && <p className="text-xs text-gray-500 mt-1">{history.customNote}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Product Information</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Model</span>
                <span className="text-sm font-black text-gray-900Selection">{service.productModel}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type</span>
                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{service.productType}</span>
              </div>
              {service.ipsBrand && (
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">IPS Brand</span>
                  <span className="text-sm font-black text-gray-900">{service.ipsBrand}</span>
                </div>
              )}
              {service.reportedIssue && (
                <div className="flex flex-col gap-2 py-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reported Issue</span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl italic">"{service.reportedIssue}"</p>
                </div>
              )}
            </div>

            {/* Product Photos */}
            <div className="mt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Product Media</span>
              <div className="grid grid-cols-2 gap-3">
                {service.productFrontPhotoUrl && (
                  <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100">
                    <ImageWithLightbox src={service.productFrontPhotoUrl || undefined} />
                  </div>
                )}
                {service.productBackPhotoUrl && (
                  <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100">
                    <ImageWithLightbox src={service.productBackPhotoUrl || undefined} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Staff */}
        {service.appointedStaff && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-8">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <User size={20} />
              </div>
              <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Assigned Personnel</h3>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
               <div className="size-16 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                  <ImageWithLightbox src={service.appointedStaff.photoUrl || undefined} />
               </div>
               <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 truncate">{service.appointedStaff.name}</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{service.staffRole || 'Technician'}</p>
                  <div className="flex items-center gap-4 mt-3">
                     <a href={`tel:${service.appointedStaff.phone}`} className="flex items-center gap-2 text-brand text-xs font-black uppercase tracking-tight border-b-2 border-brand/20 pb-0.5">
                        <Phone size={14} />
                        Call Now
                     </a>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Location Section */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
           <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Location Details</h3>
          </div>
          <div className="p-5 bg-orange-50/30 rounded-3xl border border-orange-50">
             <p className="text-sm text-orange-900 font-bold leading-relaxed">
               {service.customerAddress}
             </p>
             <p className="text-xs text-orange-700/70 mt-2 font-medium">
               {[service.customerAddressPoliceStation, service.customerAddressDistrict, service.customerAddressPostOffice].filter(Boolean).join(', ')}
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
