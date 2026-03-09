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

  if (response.data.length === 0) {
    return (
      <tr className="border-b">
        <td colSpan={10} className="text-center py-4 text-gray-600">
          <p>No data</p>
        </td>
      </tr>
    );
  }

  const services = response.data;

  return services.map((service) => (
    <tr key={service.id} className="border-b">
      <td className="py-4 px-2 whitespace-nowrap">
        <div className="flex items-center">
          <span>{service.serviceId}</span>
          <CopyButton content={service.serviceId} />
        </div>
      </td>
      <td className={"py-4 px-2 whitespace-nowrap"}>
        <p title={service.customerName} className="truncate max-w-52">
          {service.customerId ? (
            <ProfileLinkButton
              text={service.customerName}
              customerId={service.customerId}
            />
          ) : (
            service.customerName
          )}
        </p>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">{service.customerPhone}</td>
      <td className="py-4 px-2 whitespace-nowrap">
        <p title={service.customerAddress} className="truncate max-w-52">
          {service.customerAddress}
        </p>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        <p
          title={`${service.productType.toUpperCase()}-${service.productModel}`}
          className="truncate max-w-52"
        >
          {service.productType.toUpperCase()}-{service.productModel}
        </p>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        {formatDate(service.createdAt!)}
      </td>
      <td
        className={
          "py-4 px-2 text-sm text-center font-semibold whitespace-nowrap"
        }
      >
        <StatusBadge
          status={
            service.statusHistory[0].statusType === "system"
              ? service.statusHistory[0].status!
              : "custom"
          }
        />
      </td>
      <td className={"py-4 px-2 whitespace-nowrap"}>
        <p className="truncate" title={service.staffName}>
          {service.staffId ? (
            <ProfileLinkButton
              text={service.staffName}
              staffId={service.staffId}
            />
          ) : (
            service.staffName || "--"
          )}
        </p>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        {service.staffPhone || "--"}
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        <ServiceActionButtons serviceData={service} />
      </td>
    </tr>
  ));
}
