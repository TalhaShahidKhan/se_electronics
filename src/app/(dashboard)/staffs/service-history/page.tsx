import { getStaffs, getServiceHistoryById } from "@/actions";
import { Toolbar } from "@/components";
import { SearchParams } from "@/types";
import ServiceHistoryClient from "./ServiceHistoryClient";

export default async function ServiceHistoryPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const staffRes = await getStaffs({ ...params, limit: "100" });

  const staffs = staffRes.success ? staffRes.data! : [];

  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-4">
      <Toolbar title="Service History" pagination={{
        currentPage: 1,
        totalRecords: staffs.length,
        totalPages: 1,
        currentLimit: 100,
      }} />
      <ServiceHistoryClient staffs={staffs} />
    </div>
  );
}
