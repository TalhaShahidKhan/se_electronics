import { getApplicationsMetadata } from "@/actions";
import {
  ApplicationFilter,
  ApplicationList,
  DelayedLoading,
  Toolbar,
} from "@/components";
import { ApplicationTypes, SearchParams } from "@/types";
import { Suspense } from "react";

export default async function Applications({
  searchParams,
}: {
  searchParams?: Promise<SearchParams & { type?: ApplicationTypes }>;
}) {
  const params = await searchParams;
  const pagination = await getApplicationsMetadata({ ...params });

  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-4">
      <Toolbar
        title="Applications"
        filters={<ApplicationFilter />}
        pagination={pagination}
      />
      <div className="overflow-auto flex-1">
        <table id="services" className="w-full border ">
          <thead>
            <tr className="sticky top-0 z-10 bg-gray-100 border-b">
              <th className="text-left py-4 text-sm px-2">Application ID</th>
              <th className="text-left py-4 text-sm px-2">Name</th>
              <th className="text-left py-4 text-sm px-2">Phone Number</th>
              <th className="text-left py-4 text-sm px-2">District</th>
              <th className="text-left py-4 text-sm px-2">Type</th>
              <th className="text-left py-4 text-sm px-2">Date</th>
              <th className="text-left py-4 text-sm px-2">Status</th>
              <th className="text-left py-4 text-sm px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <Suspense
              key={params?.query}
              fallback={
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-600">
                    <DelayedLoading />
                  </td>
                </tr>
              }
            >
              <ApplicationList {...params} />
            </Suspense>
          </tbody>
        </table>
      </div>
    </div>
  );
}
