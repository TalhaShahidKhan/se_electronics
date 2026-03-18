import { CustomerLayout } from "@/components/layout";
import { ArrowLeft, Bell, Check, Clock } from "lucide-react";
import Link from "next/link";

const notifications = [
  {
    id: 1,
    title: "Service Completed",
    message: "Your service request #12345 has been completed.",
    time: "2 hours ago",
    read: false,
    type: "service",
  },
  {
    id: 2,
    title: "Payment Received",
    message: "We have received your payment of ৳500.",
    time: "1 day ago",
    read: true,
    type: "payment",
  },
  {
    id: 3,
    title: "New Notice",
    message: "Please check the new notice about our holiday schedule.",
    time: "3 days ago",
    read: true,
    type: "notice",
  },
];

export default function CustomerNotificationsPage() {
  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4 flex items-center gap-4">
          <Link href="/customer/profile">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-lg flex items-center gap-2">
            <Bell size={20} className="text-brand" />
            Notifications
          </h1>
        </div>

        <div className="p-4 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg flex items-start gap-4 ${notification.read ? "bg-white" : "bg-blue-50 border border-blue-200"}`}>
              <div className={`mt-1 size-8 flex-shrink-0 rounded-full flex items-center justify-center ${notification.read ? "bg-gray-100 text-gray-400" : "bg-blue-500 text-white"}`}>
                {notification.type === "service" ? <Check size={16} /> : <Bell size={16} />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${notification.read ? "text-gray-700" : "text-blue-900"}`}>{notification.title}</h3>
                <p className={`text-sm ${notification.read ? "text-gray-500" : "text-blue-800"}`}>{notification.message}</p>
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Clock size={12} />
                  {notification.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}
