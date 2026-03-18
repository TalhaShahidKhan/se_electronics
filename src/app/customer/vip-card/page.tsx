import { CustomerLayout } from "@/components/layout";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

export default function CustomerVipCardPage() {
  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4 flex items-center gap-4">
          <Link href="/customer/profile">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-lg flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            VIP Membership
          </h1>
        </div>

        <div className="p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-2xl">John Doe</h2>
                <p className="text-sm text-gray-400">VIP Member</p>
              </div>
              <Star size={32} className="text-yellow-400" fill="currentColor" />
            </div>
            <div className="text-center font-mono text-2xl tracking-widest pt-4">
              <span>CUST-1234-5678</span>
            </div>
            <div className="text-xs text-gray-500 text-center pt-2">
              Member since: 2023-01-01
            </div>
          </div>

          <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4">Benefits</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Priority Service</li>
              <li className="flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Exclusive Discounts</li>
              <li className="flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Extended Warranty</li>
              <li className="flex items-center gap-2"><Star size={16} className="text-yellow-500" /> 24/7 Support</li>
            </ul>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
