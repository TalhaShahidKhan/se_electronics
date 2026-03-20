import { getServiceById } from "@/actions"; // this is srvice data
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
  CardSim,
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
  // const session: {
  //
  // this is sessin data from api
  if (!session.isAuth || !session.customer) {
    redirect("/customer/login");
  }

  const response = await getServiceById(id);
  // const session: {
  //     isAuth: boolean;
  //     userId?: undefined;
  //     username?: undefined;
  //     role?: undefined;
  //     customer?: undefined;
  // } | {
  //     isAuth: boolean;
  //     userId: {};
  //     username: unknown;
  //     role: string;
  //     customer: {
  //         id: string;
  //         name: string;
  //         customerId: string;
  //         phone: string;
  //         address: string;
  //         vipCardNumber: string | null;
  //         vipStatus: "pending" | "processing" | "approved" | "rejected" | null;
  //     };
  // }

  if (!response.success) {
    if (response.message === "Service not found") {
      notFound();
    }

    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-gray-300">
          {response.message}
        </div>
      </div>
    );
  }

  const service = response.data;

  if (!service) {
    notFound();
  }
  const latestStatus =
    service.statusHistory[service.statusHistory.length - 1]?.status;

  const createdDate = new Date(service.createdAt);

  // Add 24 months
  const expireDate = new Date(createdDate);
  expireDate.setMonth(expireDate.getMonth() + 24);

  // Check status
  const isExpired = new Date() > expireDate;
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border border-gray-300-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          {/* BACK BUTTON */}
          <Link
            href="/customer/services"
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition"
          >
            <ArrowLeft size={20} />
          </Link>

          <h1 className="font-bold text-md md:text-xl">Service Details</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-3 md:p-6 space-y-4">
        {/* SERVICE HEADER CARD */}
        <div className="bg-white rounded-md shadow border border-gray-300 p-4 text-sm">
          <div className="flex justify-between items-center">
            <p className="font-semibold">
              Service ID#{" "}
              <span className="text-gray-700">{service.serviceId}</span>
            </p>
          </div>

          {/* dynamic this from api section */}
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            {/* <span className="bg-green-100 text-green-700 text-md px-2 py-1 rounded">
              {response.data.isActive ? 'Valid' : "expired"} 
            </span> */}
            <span className="bg-green-100 text-green-700 text-md px-2 py-1 rounded">
              {latestStatus}
            </span>

            <div className="flex items-center gap-1 text-md">
              <CreditCard size={14} className="text-green-600" />
              Payment
            </div>

            <span className="bg-green-100 text-green-700 text-md px-2 py-1 rounded">
              Paid
            </span>
          </div>

          <div className="flex items-center gap-2 text-md mt-2">
            <Calendar size={14} />
            Service Date : {formatDate(service.createdAt!)}
          </div>
        </div>

        {/* dynamic this section from api WARRANTY */}
        <div className="bg-white border border-gray-300 rounded-md p-4 text-sm">
          <div className="flex justify-between items-center">
            <p className="font-semibold flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-500" />
              Warranty
            </p>

            <span
              className={`text-md px-2 py-1 rounded ${
                isExpired
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isExpired ? "Expired" : `Valid `}
            </span>
          </div>
        </div>

        {/* CUSTOMER INFO */}
        <div className="bg-white border border-gray-300 rounded-md p-4 text-sm">
          <p className="font-semibold mb-3">
            Customer Information
            <p>
              {/* here will show the status like the photo */}
              {/* warrenty expired or not from api */}
            </p>
          </p>

          <div className="space-y-2 text-gray-700 text-md md:text-sm">
            <p className="flex items-center gap-2">
              <User size={15} className="text-blue-500" />
              {service.customerName}
            </p>
            <p className="flex items-center gap-2">
              <CardSim size={15} className="text-blue-500" />
              {"Customer Id: " + service.customerId}
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
            <p className="flex items-center gap-2  justify-between">
              <p>{"product Model " + service.productModel}</p>{" "}
              <p className="text-red-400">
                Expire in {expireDate.toLocaleDateString()}
              </p>
            </p>
          </div>
        </div>

        {/* TECHNICIAN */}
        {service.appointedStaff && (
          <div className="bg-white border border-gray-300 rounded-md p-4 text-sm">
            <p className="font-semibold mb-3">Technician Information</p>

            <div className="space-y-2 text-gray-700 text-md md:text-sm">
              <p className="flex items-center gap-2">
                <User size={15} className="text-indigo-500" />
                {service.appointedStaff.name}
              </p>

              <p className="flex items-center gap-2">
                <CardSim size={15} className="text-green-500" />
                {"Technician Id " + service.staffId}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-green-500" />
                {service.appointedStaff.phone}
              </p>

              <p className="flex items-center gap-2">
                <User size={15} className="text-orange-500" />
                {service.staffRole}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={15} className="text-red-500" />
                {"Service Area " + service.customerAddress}
              </p>
            </div>
          </div>
        )}

        {/* SERVICE CENTER */}
        <div className="bg-white border border-gray-300 rounded-md p-4 text-sm">
          <p className="font-semibold mb-3">Current Servicing Center</p>

          <div className="space-y-2 text-md md:text-sm text-gray-700">
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
        <div className="bg-white border border-gray-300 rounded-md p-4 text-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold ">
              <span className="text-red-500 text-md">⚠</span> Ovijog
            </p>

            {/* new complain left side  will like the photo corner . customer info status corner also  */}
            <Link
              href={"/customer/complain"}
              className="text-md bg-black text-white px-3 py-1 rounded"
            >
              New Complain
            </Link>
          </div>

          <div className="text-md md:text-sm text-gray-700 space-y-2">
            <p>
              Complaining ID#{" "}
              <span className="font-semibold">{service.serviceId}</span>
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
