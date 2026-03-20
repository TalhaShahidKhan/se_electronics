import {
  verifyCustomerSession,
  applyForVipCard,
} from "@/actions/customerActions";
import Link from "next/link";
import {
  ArrowLeft,
  Crown,
  CheckCircle2,
  MessageCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { contactDetails } from "@/constants";
import { revalidatePath } from "next/cache";

export default async function VipCardPage() {
  const session = await verifyCustomerSession();
  if (!session.isAuth || !session.customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Please log in to view this page
          </h2>
          <Link
            href="/customer/login"
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const customer = session.customer;
  const vipStatus = (customer as any).vipStatus;
  const vipCardNumber = (customer as any).vipCardNumber;

  const benefits = [
    "Priority Customer Support - Skip the queue!",
    "Exclusive Discounts on all regular maintenance plans",
    "Free minor repairs on selected services",
    "Extended warranty features for featured products",
    "Special home-delivery rates",
  ];

  async function handleApply(formData: FormData) {
    "use server";
    await applyForVipCard();
    revalidatePath("/customer/vip-card");
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 selection:bg-blue-200">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/customer/profile"
            className="p-3 bg-white rounded-md shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-md">
              <Crown className="text-blue-600" size={28} />
            </div>
            VIP Membership
          </h1>
        </div>

        {vipStatus === "approved" ? (
          /* Approved VIP CARD - blue-700 */
          <div className="bg-[#1d4ed8] rounded-[2rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden group border-4 border-white/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all duration-700 group-hover:bg-white/10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none transition-all duration-700 group-hover:bg-blue-400/20"></div>

            <div className="relative z-10 font-mono">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-blue-100 font-bold uppercase tracking-[0.2em] text-sm mb-2">
                    SE Electronics
                  </p>
                  <h2 className="text-3xl font-black tracking-tight text-white/90">
                    VIP PREMIER
                  </h2>
                </div>
                <Crown size={40} className="text-white opacity-80" />
              </div>

              <div className="mb-10 font-mono">
                <p className="text-blue-100/60 text-[10px] uppercase tracking-[0.3em] mb-3">
                  VIP Card Number
                </p>
                <p className="text-2xl sm:text-3xl font-bold tracking-[0.2em] text-white">
                  {vipCardNumber
                    ? vipCardNumber.match(/.{1,4}/g)?.join(" ")
                    : "#### #### #### ####"}
                </p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-blue-100/60 text-[10px] uppercase tracking-[0.3em] mb-1">
                    Cardholder
                  </p>
                  <p className="text-lg font-bold uppercase tracking-wider">
                    {customer.name}
                  </p>
                </div>
                <div className="text-blue-100 font-black italic tracking-widest text-sm bg-white/10 px-3 py-1 rounded-md">
                  ELITE
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Normal/Pending State */
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] p-8 sm:p-12 text-gray-800 shadow-sm border border-gray-200 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm mb-2">
                    SE Electronics
                  </p>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">
                    VIP Card Application
                  </h2>
                </div>
                <Crown size={32} className="text-gray-300" />
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                {vipStatus === "pending" || vipStatus === "processing"
                  ? "Your application is currently being reviewed by our administrative team. We will notify you once it's approved."
                  : "Join our elite membership program to enjoy exclusive benefits, priority support, and special discounts on all services."}
              </p>

              {vipStatus === "pending" || vipStatus === "processing" ? (
                <div className="flex items-center gap-3 text-brand font-black uppercase tracking-widest text-sm bg-brand/5 p-4 rounded-md border border-brand/10">
                  <Clock className="animate-pulse" size={20} />
                  Status: {vipStatus.toUpperCase()}
                </div>
              ) : vipStatus === "rejected" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-red-600 font-black uppercase tracking-widest text-sm bg-red-50 p-4 rounded-md border border-red-100">
                    <CheckCircle2 size={20} />
                    Status: Rejected
                  </div>
                  <form action={handleApply}>
                    <button className="w-full bg-brand text-white font-black py-5 px-8 rounded-md shadow-xl shadow-brand/20 hover:shadow-2xl hover:bg-brand-700 transition-all active:scale-[0.98] uppercase tracking-widest text-sm">
                      Apply Again
                    </button>
                  </form>
                </div>
              ) : (
                <form action={handleApply}>
                  <button className="w-full bg-brand text-white font-black py-5 px-8 rounded-md shadow-xl shadow-brand/20 hover:shadow-2xl hover:bg-brand-700 transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                    <Crown size={20} />
                    Apply for VIP Card
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            VIP Member Benefits
          </h3>
          <ul className="space-y-5 mb-8">
            {benefits.map((benefit, i) => (
              <li
                key={i}
                className="flex items-start gap-4 p-4 rounded-md hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="mt-1 bg-blue-100 rounded-full p-1.5 border border-blue-200">
                  <CheckCircle2 size={16} className="text-blue-600" />
                </div>
                <span className="text-gray-700 leading-snug font-medium">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>

          <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <h4 className="font-bold text-lg mb-3">Need Assistance?</h4>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium">
              If you have any questions about our VIP program or your
              application, our support team is ready to help.
            </p>
            <a
              href={`https://wa.me/${contactDetails.whatsApp.replace(/\+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 px-6 rounded-md shadow-lg transition-all active:scale-95 text-sm uppercase tracking-widest"
            >
              <MessageCircle size={20} />
              Contact Support via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
