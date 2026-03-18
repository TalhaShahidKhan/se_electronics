import { CustomerLayout } from "@/components/layout";
import { ArrowLeft, Wrench, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: "S-12345",
    product: "IPS 1500VA",
    status: "Completed",
    date: "2023-10-26",
  },
  {
    id: "S-12346",
    product: "Battery 200Ah",
    status: "In Progress",
    date: "2023-11-05",
  },
];

export default function CustomerServicesPage() {
  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4 flex items-center gap-4">
          <Link href="/customer/profile">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-lg flex items-center gap-2">
            <Wrench size={20} className="text-brand" />
            My Services
          </h1>
        </div>

        <div className="p-4 space-y-4">
          <Link href="/customer/request-service" className="w-full bg-brand text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2">
            <Plus size={20} />
            Request New Service
          </Link>

          <div className="space-y-3">
            {services.map((service) => (
              <Link key={service.id} href={`/customer/services/${service.id}`}>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">{service.product}</h3>
                    <p className="text-sm text-gray-500">Service ID: {service.id}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full mt-2 inline-block ${service.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {service.status}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
