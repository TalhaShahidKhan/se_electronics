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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {card.value}
              </h3>
            </div>
            <div className={`${card.color} p-3 rounded-2xl text-white`}>
              <card.icon size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
