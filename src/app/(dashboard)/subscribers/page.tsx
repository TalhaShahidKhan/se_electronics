import { getSubscribersMetadata } from "@/actions";
import { DelayedLoading, SubscriberList, Toolbar } from "@/components";
import { SearchParams } from "@/types";
import { Suspense } from "react";

export default async function Subscribers({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const pagination = await getSubscribersMetadata({ ...params });

  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-4">
      <Toolbar title="Subscribers" pagination={pagination} />
      <div className="overflow-auto flex-1">
        <table id="feedbacks" className="w-full border">
          <thead>
            <tr className="border-b sticky top-0 z-10 bg-gray-100">
              <th className="text-left py-4 text-sm px-2">Subscriber Id</th>
              <th className="text-left py-4 text-sm px-2">Customer Name</th>
              <th className="text-left py-4 text-sm px-2">Phone Number</th>
              <th className="text-left py-4 text-sm px-2">District</th>
              <th className="text-left py-4 text-sm px-2">Date</th>
              <th className="text-left py-4 text-sm px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <Suspense
              key={params?.query}
              fallback={
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-600">
                    <DelayedLoading />
                  </td>
                </tr>
              }
            >
              <SubscriberList {...params} />
            </Suspense>
          </tbody>
        </table>
      </div>
    </div>
  );
}
