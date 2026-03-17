import { verifyStaffSession } from "@/actions";
import { getStaffFeedbacks } from "@/actions/feedbackActions";
import { getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { MessageSquare, Star } from "lucide-react";

export default async function StaffFeedbacksPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const [feedbacksRes, statsRes] = await Promise.all([
    getStaffFeedbacks(userId),
    getStaffProfileStats(userId),
  ]);

  const feedbacksList = feedbacksRes.success ? (feedbacksRes.data ?? []) : [];
  const stats = statsRes.success ? statsRes.data : null;

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="p-4 space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-yellow-100/50 rounded-xl text-yellow-600">
            <Star size={20} fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            Customer Feedbacks
          </h1>
        </div>

        {feedbacksList.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-bold text-gray-700">No feedbacks yet.</p>
            <p className="text-sm mt-1 text-gray-400 font-medium">
              When customers give feedback on your services, they&apos;ll appear
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacksList.map((feedback: any) => (
              <div
                key={feedback.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {feedback.customerName}
                    </h3>
                    <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-tight">
                      {feedback.productModel} • {feedback.productType}
                    </p>
                    <p className="text-[10px] font-bold font-mono text-gray-300 mt-1 uppercase">
                      Order #{feedback.serviceId.substring(0, 8)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={
                            s <= (feedback.rating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mt-1">
                      {feedback.rating}/5 RATING
                    </span>
                  </div>
                </div>

                {feedback.feedbacks && (
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 mb-4 relative">
                    <div className="absolute top-0 left-4 -translate-y-1/2 bg-white px-2">
                      <MessageSquare size={12} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed italic font-medium">
                      &ldquo;{feedback.feedbacks}&rdquo;
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      Submitted On
                    </span>
                    <span className="text-sm text-gray-600 font-bold">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-brand/5 px-3 py-1 rounded-full border border-brand/10">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-tight">
                      Verified
                    </span>
                    <div className="size-1 bg-brand rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
