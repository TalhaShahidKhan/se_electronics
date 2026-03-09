import { getFeedbacksMetadata } from "@/actions";
import { DelayedLoading, FeedbackList, Toolbar } from "@/components";
import { SearchParams } from "@/types";
import { Suspense } from "react";

export default async function Feedback({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const pagination = await getFeedbacksMetadata({ ...params });

  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-4">
      <Toolbar title="Feedbacks" pagination={pagination} />
      <div className="overflow-auto flex-1">
        <table id="feedbacks" className="w-full border">
          <thead>
            <tr className="border-b sticky top-0 z-10 bg-gray-100">
              <th className="text-left py-4 px-2">Service ID</th>
              <th className="text-left py-4 px-2">Customer Name</th>
              <th className="text-left py-4 px-2">Customer Phone Number</th>
              <th className="text-left py-4 px-2">Product Model</th>
              <th className="text-left py-4 px-2">Date</th>
              <th className="text-left py-4 px-2">Serviceman Name</th>
              <th className="text-left py-4 px-2">Serviceman Phone Number</th>
              <th className="hidden">Feedbacks</th>
              <th className="text-left py-4 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <Suspense
              key={params?.query}
              fallback={
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-600">
                    <DelayedLoading />
                  </td>
                </tr>
              }
            >
              <FeedbackList {...params} />
            </Suspense>
          </tbody>
        </table>
      </div>
    </div>
  );
}
