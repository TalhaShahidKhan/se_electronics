import { getApplications } from "@/actions/applicationActions";
import { CopyButton } from "@/components/ui";
import { ApplicationTypes } from "@/constants";
import { SearchParams } from "@/types";
import { formatDate } from "@/utils";
import ApplicationActionButtons from "./ApplicationActionButtons";

export default async function ApplicationList(params: SearchParams) {
  const response = await getApplications(params);
  if (!response.success) {
    return (
      <tr>
        <td colSpan={8} className="text-center py-4 text-red-500">
          <p>{response.message}</p>
        </td>
      </tr>
    );
  }

  if (response.data!.length === 0) {
    return (
      <tr className="border-b">
        <td colSpan={8} className="text-center py-4 text-gray-600">
          <p>No data</p>
        </td>
      </tr>
    );
  }

  return response.data!.map((application) => (
    <tr key={application.id} className="border-b">
      <td className="py-4 px-2 whitespace-nowrap">
        <div className="flex items-center">
          <span>{application.applicationId}</span>
          <CopyButton content={application.applicationId} />
        </div>
      </td>
      <td className="text-left py-4 px-2">{application.applicantName}</td>
      <td className="text-left py-4 px-2">{application.applicantPhone}</td>
      <td className="text-left py-4 px-2">{application.applicantDistrict}</td>
      <td className="py-4 px-2 whitespace-nowrap">
        {ApplicationTypes[application.type]}
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        {formatDate(application.createdAt!)}
      </td>
      <ApplicationActionButtons
        applicationData={{
          status: application.status,
          applicantId: application.applicantId,
          applicationId: application.applicationId,
          type: application.type,
          rejectReason: application.rejectReason,
        }}
      />
    </tr>
  ));
}
