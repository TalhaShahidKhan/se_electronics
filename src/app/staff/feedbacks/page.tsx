import { verifyStaffSession } from "@/actions";
import { getStaffFeedbacks } from "@/actions/feedbackActions";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";
import Link from "next/link";

export default async function StaffFeedbacksPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const feedbacksRes = await getStaffFeedbacks(userId);
  const feedbacksList = feedbacksRes.success ? (feedbacksRes.data ?? []) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-3">
          <Link href="/staff/profile" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-400" />
            <h1 className="text-lg font-bold">My Feedbacks</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 py-4 sm:py-6">
        {feedbacksList.length === 0 ? (
          <div className="__card p-8 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No feedbacks yet.</p>
            <p className="text-sm mt-1">When customers give feedback on your services, they&apos;ll appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacksList.map((feedback: any) => (
              <div key={feedback.id} className="__card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900">{feedback.customerName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {feedback.productModel} • <span className="capitalize">{feedback.serviceType} - {feedback.productType}</span>
                    </p>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">#{feedback.serviceId}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-yellow-500 text-sm tracking-wider">
                      {"★".repeat(feedback.rating || 0)}
                      {"☆".repeat(5 - (feedback.rating || 0))}
                    </span>
                  </div>
                </div>

                {feedback.feedbacks && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mt-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{feedback.feedbacks}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                  <div className="bg-brand-50 text-brand text-xs font-bold px-2.5 py-1 rounded-lg">
                    {feedback.rating}/5
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
