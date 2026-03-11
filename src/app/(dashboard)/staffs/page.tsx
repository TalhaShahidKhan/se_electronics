import { Wrench, Zap } from "lucide-react";
import Link from "next/link";

export default function StaffRolesPage() {
  return (
    <div className="flex-1 overflow-auto flex flex-col gap-4">
      <div className="w-full max-w-4xl mx-auto mt-8 px-4 flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Staff Management
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Link
            href="/staffs/technicians"
            className="group flex flex-col items-center justify-center bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="bg-blue-50 p-6 rounded-3xl text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Wrench size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Technicians
            </h3>
            <p className="text-gray-500 text-center font-medium">
              View and manage repair technicians, update their profiles, and track performance.
            </p>
          </Link>

          <Link
            href="/staffs/electricians"
            className="group flex flex-col items-center justify-center bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="bg-emerald-50 p-6 rounded-3xl text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Zap size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Electricians
            </h3>
            <p className="text-gray-500 text-center font-medium">
              View and manage installation electricians, assign installations, and view ratings.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
