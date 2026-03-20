import { getAdminStats } from "@/actions/adminActions";
import {
  CheckCircle,
  Clock,
  CreditCard,
  ShoppingBag,
  Users,
  Wrench,
} from "lucide-react";

export default async function AdminStats() {
  const statsResponse = await getAdminStats();

  if (!statsResponse.success || !statsResponse.data) {
    return <div className="text-red-500">Could not load stats</div>;
  }

  const stats = statsResponse.data;

  const cards = [
    {
      title: "Total Services",
      value: stats.totalServices,
      icon: Wrench,
      color: "bg-blue-500",
    },
    {
      title: "Active Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Staff Members",
      value: stats.totalStaff,
      icon: CheckCircle,
      color: "bg-purple-500",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Total Revenue",
      value: `৳${stats.totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: "bg-emerald-500",
    },
    {
      title: "Active Subs",
      value: stats.activeSubscriptions,
      icon: ShoppingBag,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-md sm:text-base font-bold text-gray-600 truncate">{card.title}</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 truncate">
                {card.value}
              </h3>
            </div>
            <div className={`${card.color} p-2.5 sm:p-3 rounded-md sm:rounded-md text-white shrink-0`}>
              <card.icon size={24} className="sm:w-7 sm:h-7" /> 
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
