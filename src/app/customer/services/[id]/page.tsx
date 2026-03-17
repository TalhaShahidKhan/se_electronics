import { getServiceById } from "@/actions";
import { verifyCustomerSession } from "@/actions/customerActions";
import { formatDate } from "@/utils";

import {
  ArrowLeft,
  Settings,
  User,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  CreditCard,
  Wrench,
  Clock,
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
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-gray-300">
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
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border border-gray-300-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">

          {/* BACK BUTTON */}
          <Link
            href="/customer/services"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
          >
            <ArrowLeft size={20} />
          </Link>

          <h1 className="font-bold text-lg md:text-xl">
            Service Details
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-3 md:p-6 space-y-4">

        {/* SERVICE HEADER CARD */}
        <div className="bg-white rounded-xl shadow border border-gray-300 p-4 text-sm">

          <div className="flex justify-between items-center">
            <p className="font-semibold">
              Service ID#{" "}
              <span className="text-gray-700">{service.serviceId}</span>
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">

            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
              Completed
            </span>

            <div className="flex items-center gap-1 text-xs">
              <CreditCard size={14} className="text-green-600" />
              Cash on Delivery (COD)
            </div>

            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
              Paid
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs mt-2">
            <Calendar size={14} />
            Service Date : {formatDate(service.createdAt!)}
          </div>
        </div>

        {/* WARRANTY */}
        <div className="bg-white border border-gray-300 rounded-xl p-4 text-sm">

          <div className="flex justify-between items-center">
            <p className="font-semibold flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-500" />
              Warranty
            </p>

            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
              Expired
            </span>
          </div>

        </div>

        {/* CUSTOMER INFO */}
        <div className="bg-white border border-gray-300 rounded-xl p-4 text-sm">

          <p className="font-semibold mb-3">Customer Information</p>

          <div className="space-y-2 text-gray-700 text-xs md:text-sm">

            <p className="flex items-center gap-2">
              <User size={15} className="text-blue-500" />
              {service.customerName}
            </p>

            <p className="flex items-center gap-2">
              <Phone size={15} className="text-green-500" />
              {service.customerPhone}
            </p>

            <p className="flex items-center gap-2">
              <Settings size={15} className="text-purple-500" />
              Product : {service.productModel}
            </p>

            <p className="flex items-center gap-2">
              <MapPin size={15} className="text-red-500" />
              {service.customerAddress}
            </p>

          </div>
        </div>

        {/* TECHNICIAN */}
        {service.appointedStaff && (
          <div className="bg-white border border-gray-300 rounded-xl p-4 text-sm">

            <p className="font-semibold mb-3">
              Technician Information
            </p>

            <div className="space-y-2 text-gray-700 text-xs md:text-sm">

              <p className="flex items-center gap-2">
                <User size={15} className="text-indigo-500" />
                {service.appointedStaff.name}
              </p>

              <p className="flex items-center gap-2">
                <Phone size={15} className="text-green-500" />
                {service.appointedStaff.phone}
              </p>

              <p className="flex items-center gap-2">
                <Wrench size={15} className="text-orange-500" />
                {service.staffRole}
              </p>

            </div>
          </div>
        )}

        {/* SERVICE CENTER */}
        <div className="bg-white border border-gray-300 rounded-xl p-4 text-sm">

          <p className="font-semibold mb-3">
            Current Servicing Center
          </p>

          <div className="space-y-2 text-xs md:text-sm text-gray-700">

            <p className="flex items-center gap-2">
              <MapPin size={15} className="text-red-500" />
              {service.customerAddress}
            </p>

            <p className="flex items-center gap-2">
              <Phone size={15} className="text-green-500" />
              Call : {service.customerPhone}
            </p>

          </div>
        </div>

        {/* ONGOING */}
        <div className="bg-white border border-gray-300 rounded-xl p-4 text-sm">

          <div className="flex justify-between items-center mb-3">

            <p className="font-semibold text-red-500">
              ⚠ Ovijog
            </p>

            <button className="text-xs bg-black text-white px-3 py-1 rounded">
              New Complain
            </button>

          </div>

          <div className="text-xs md:text-sm text-gray-700 space-y-2">

            <p>
              Complaining ID#{" "}
              <span className="font-semibold">
                {service.serviceId}
              </span>
            </p>

            <p>IPS Service</p>

            <p className="flex items-center gap-2">
              <User size={14} />
              {service.appointedStaff?.name}
            </p>

            <p className="flex items-center gap-2">
              <Calendar size={14} />
              {formatDate(service.createdAt!)}
            </p>

          </div>

        </div>

      </main>
    </div>
  );
}