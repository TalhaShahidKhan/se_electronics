import { getServices } from "@/actions";
import { ProfileLinkButton } from "@/components/features/staff";
import { CopyButton, StatusBadge } from "@/components/ui";
import { SearchParams } from "@/types";
import { formatDate } from "@/utils";
import ServiceActionButtons from "./ServiceActionButtons";

export default async function ServiceList(
  params: SearchParams & { type: "repair" | "install" },
) {
  const response = await getServices(params);

  if (!response.success) {
    return (
      <tr>
        <td colSpan={10} className="text-center py-4 text-red-500">
          <p>{response.message}</p>
        </td>
      </tr>
    );
  }

  if (response.data!.length === 0) {
    return (
      <tr className="border-b">
        <td colSpan={10} className="text-center py-4 text-gray-600">
          <p>No data</p>
        </td>
      </tr>
    );
  }

  const services = response.data!;

  return services.map((service: any) => (
    <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm sm:text-base">{service.serviceId}</span>
          <CopyButton content={service.serviceId} />
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {service.customerId ? (
            <ProfileLinkButton
              text={service.customerName}
              customerId={service.customerId}
            />
          ) : (
            <span className="font-bold text-gray-800 text-sm sm:text-base">{service.customerName}</span>
          )}
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-gray-700 font-bold text-sm sm:text-base">
        {service.customerPhone}
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <p title={service.customerAddress} className="truncate max-w-[200px] text-gray-600 text-xs sm:text-sm font-medium">
          {service.customerAddress}
        </p>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs sm:text-sm font-black uppercase tracking-wider border border-gray-200">
          {service.productType}-{service.productModel}
        </span>
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-gray-500 text-xs sm:text-sm font-bold">
        {formatDate(service.createdAt!)}
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-center">
        <StatusBadge
          status={
            service.statusHistory[0].statusType === "system"
              ? service.statusHistory[0].status!
              : "custom"
          }
        />
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {service.staffId ? (
            <ProfileLinkButton
              text={service.staffName}
              staffId={service.staffId}
            />
          ) : (
            <span className="text-gray-400 italic text-xs sm:text-sm font-medium">{service.staffName || "Unassigned"}</span>
          )}
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-gray-600 text-xs sm:text-sm font-bold">
        {service.staffPhone || "--"}
      </td>
      <td className="py-4 px-4 whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 transition-colors shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)]">
        <ServiceActionButtons serviceData={service} />
      </td>
    </tr>
  ));
}
