import Link from "next/link";
import { ArrowLeft, MapPin, Search, Navigation } from "lucide-react";
import geoData from "@/assets/data/geo-data.json";

export default function CoverageAreaPage() {
    const districts = Object.keys(geoData);
    const divisions = [
        { name: "Sylhet", regions: ["সিলেট", "সুনামগঞ্জ", "মৌলভীবাজার", "হবিগঞ্জ"] },
        { name: "Dhaka", regions: ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "কিশোরগঞ্জ", "নরসিংদী", "ফরিদপুর", "মাদারীপুর", "শরীয়তপুর", "গোপালগঞ্জ", "রাজবাড়ী"] },
        { name: "Chattogram", regions: ["চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "নোয়াখালী", "ফেনী", "লক্ষ্মীপুর", "রাঙ্গামাটি", "খাগড়াছড়ি", "বান্দরবান"] },
        { name: "Rajshahi", regions: ["রাজশাহী", "বগুড়া", "সিরাজগঞ্জ", "পাবনা", "নওগাঁ", "নাটোর", "চাঁপাইনবাবগঞ্জ", "জয়পুরহাট"] },
        { name: "Khulna", regions: ["খুলনা", "যশোর", "সাতক্ষীরা", "কুষ্টিয়া", "ঝিনাইদহ", "বাগেরহাট", "চুয়াডাঙ্গা", "মাগুরা", "নড়াইল", "মেহেরপুর"] },
        { name: "Barishal", regions: ["বরিশাল", "ভোলা", "পটুয়াখালী", "পিরোজপুর", "বরগুনা", "ঝালকাঠি"] },
        { name: "Rangpur", regions: ["রংপুর", "দিনাজপুর", "কুড়িগ্রাম", "গাইবান্ধা", "নীলফামারী", "ঠাকুরগাঁও", "লালমনিরহাট", "পঞ্চগড়"] },
        { name: "Mymensingh", regions: ["ময়মনসিংহ", "জামালপুর", "নেত্রকোনা", "শেরপুর"] }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 selection:bg-cyan-200">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/customer/profile" className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 rounded-xl">
                            <MapPin className="text-cyan-600" size={28} />
                        </div>
                        Coverage Area
                    </h1>
                </div>

                {/* Hero Section */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 overflow-hidden relative">
                    <Navigation className="absolute -bottom-10 -right-10 text-white/10 w-64 h-64 transform -rotate-45" />
                    
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-cyan-50 mb-6 border border-white/20">
                            Available Nationwide
                        </span>
                        <h2 className="text-4xl font-black mb-4">We are right where you need us!</h2>
                        <p className="text-cyan-50 text-lg leading-relaxed">
                            SE Electronics proudly offers technical support, maintenance, and expert installation services across all 64 districts in Bangladesh. Although our headquarters is in Sylhet, our dedicated network of electricians and technicians ensures that no matter where you are, top-tier service is just a request away.
                        </p>
                    </div>
                </div>

                {/* Divisions Grid */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Search className="text-cyan-500" />
                        Explore Our Network
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {divisions.map((div, i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                                <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    {div.name} Division
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {div.regions.map(region => (
                                        <span key={region} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium">
                                            {region}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 text-orange-800 flex items-start gap-4">
                    <div className="mt-1">
                        <svg className="w-6 h-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h5 className="font-bold text-lg mb-1">Notice for Remote Areas</h5>
                        <p className="text-sm">
                            Please note that travel and accommodation charges may apply for technicians traveling outside Sylhet City depending on the nature of the package and urgency. These details will be confirmed prior to finalizing the request.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
