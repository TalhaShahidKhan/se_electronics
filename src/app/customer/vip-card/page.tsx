import { verifyCustomerSession } from "@/actions/customerActions";
import Link from "next/link";
import { ArrowLeft, Crown, CheckCircle2, MessageCircle } from "lucide-react";
import { contactDetails } from "@/constants";

export default async function VipCardPage() {
    const session = await verifyCustomerSession();
    if (!session.isAuth || !session.customer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please log in to view this page</h2>
                    <Link href="/customer/login" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    const customer = session.customer;
    const whatsappNumber = contactDetails.whatsApp.replace(/\+/g, '');
    const whatsappMessage = encodeURIComponent(`Hello SE Electronics, I am ${customer.name} (ID: ${customer.customerId}, Phone: ${customer.phone}). I would like to request a VIP Card for exclusive benefits and priority service.`);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    const benefits = [
        "Priority Customer Support - Skip the queue!",
        "Exclusive Discounts on all regular maintenance plans",
        "Free minor repairs on selected services",
        "Extended warranty features for featured products",
        "Special home-delivery rates"
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] py-12 px-4 selection:bg-yellow-200">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/customer/profile" className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-xl">
                            <Crown className="text-yellow-600" size={28} />
                        </div>
                        VIP Membership
                    </h1>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all duration-700 group-hover:bg-yellow-500/20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none transition-all duration-700 group-hover:bg-blue-500/20"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <p className="text-yellow-500 font-bold uppercase tracking-[0.2em] text-xs mb-2">SE Electronics</p>
                                <h2 className="text-3xl font-black font-mono tracking-tight text-white/90">VIP CARD</h2>
                            </div>
                            <Crown size={40} className="text-yellow-400 opacity-80" />
                        </div>

                        <div className="mb-8 font-mono">
                            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Cardholder Name</p>
                            <p className="text-2xl font-bold uppercase tracking-wider">{customer.name}</p>
                        </div>
                        
                        <div className="flex justify-between items-end font-mono">
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Customer ID</p>
                                <p className="text-lg text-white/80">{customer.customerId}</p>
                            </div>
                            <div className="text-yellow-400/80 font-bold">
                                ELITE MEMBER
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">VIP Benefits</h3>
                    <ul className="space-y-4 mb-8">
                        {benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="mt-1 bg-yellow-100 rounded-full p-1 border border-yellow-200">
                                    <CheckCircle2 size={16} className="text-yellow-600" />
                                </div>
                                <span className="text-gray-700 leading-snug">{benefit}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <h4 className="font-bold text-gray-900 mb-2">How to apply?</h4>
                        <p className="text-sm text-gray-600 mb-6">
                            VIP status is currently handled manually by our team. Request your VIP card today by sending us a message on WhatsApp.
                        </p>
                        <a 
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl active:scale-95"
                        >
                            <MessageCircle size={24} />
                            Request via WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
