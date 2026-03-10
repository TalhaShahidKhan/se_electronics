import AdminStats from "@/components/features/admin/AdminStats";
import DashboardHeader from "@/components/features/admin/DashboardHeader";
import { ChevronRight, CreditCard, Plus, Users, Wrench } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-4">
      <DashboardHeader />

      {/* Stats Section */}
      <AdminStats />

      {/* Quick Links / Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Recommended Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard
              href="/services/repairs"
              title="Repair List"
              description="Manage service requests"
              icon={Wrench}
              color="text-blue-500 bg-blue-50"
            />
            <ActionCard
              href="/payments"
              title="Payments"
              description="Review payment requests"
              icon={CreditCard}
              color="text-green-500 bg-green-50"
            />
            <ActionCard
              href="/customers"
              title="Customers"
              description="View customer profiles"
              icon={Users}
              color="text-purple-500 bg-purple-50"
            />
           
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Service Platform 6.0</h2>
            <p className="text-blue-100 text-sm max-w-xs mb-8">
              Efficiently manage your electronics servicing business from one
              central dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex-1 min-w-[120px]">
              <p className="text-[10px] uppercase font-bold text-blue-200 mb-1 tracking-widest">
                Version
              </p>
              <p className="font-bold">v6.0.4 Enterprise</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex-1 min-w-[120px]">
              <p className="text-[10px] uppercase font-bold text-blue-200 mb-1 tracking-widest">
                Server Status
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="font-bold">All services active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ href, title, description, icon: Icon, color }: any) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white transition-all"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
          {title}
          <ChevronRight
            size={14}
            className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
          />
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}
