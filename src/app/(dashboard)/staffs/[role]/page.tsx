import { getStaffs, getStaffsMetadata } from "@/actions";
import {
  StaffToolbarActionButtons,
  Toolbar,
} from "@/components";
import { SearchParams } from "@/types";
import StaffListClient from "./StaffListClient";

export default async function Technicians({
  params,
  searchParams,
}: {
  params: Promise<{ role: "technicians" | "electricians" }>;
  searchParams?: Promise<SearchParams>;
}) {
  const prms = await params;
  const sp = await searchParams;
  const role = prms.role === "technicians" ? "technician" : "electrician";
  const title = prms.role === "technicians" ? "Technicians" : "Electricians";

  const pagination = await getStaffsMetadata({ ...sp, role: role });
  const response = await getStaffs({ ...sp, role: role });

  if (!response.success) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>{response.message}</p>
      </div>
    );
  }

  const staffs = response.data!;

  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-4">
      <Toolbar
        title={title}
        actions={<StaffToolbarActionButtons />}
        pagination={pagination}
      />
      {staffs.length > 0 ? (
        <StaffListClient staffs={staffs} />
      ) : (
        <div className="text-center py-4 text-gray-600">
          <p>No data</p>
        </div>
      )}
    </div>
  );
}
