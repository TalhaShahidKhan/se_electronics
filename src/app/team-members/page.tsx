import { getAllTeamMembers } from "@/actions";
import { TeamMembers } from "@/components";
import { contactDetails } from "@/constants";
import { AppError } from "@/utils";

export const dynamic = "force-dynamic";

export default async function TeamMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ staffId?: string }>;
}) {
  const { staffId } = await searchParams;
  const teamMembers = await getAllTeamMembers();

  if (!teamMembers.success) {
    throw new AppError("টিম মেম্বারদের তথ্য পাওয়া যায়নি।");
  }

  const staffs = teamMembers.data!;
  return (
    <div className="mx-auto max-w-[1200px] text-center p-3">
      <div className="h-full font-bold mb-4 flex flex-col gap-0.5 p-6 rounded-md border-2">
        <div className="text-xl">এস ই ইলেকট্রনিকস সার্ভিস টিম মেম্বার</div>
        <div className="text-md">হেল্পলাইন : {contactDetails.customerCare}</div>
        <div className="text-md">Email : {contactDetails.email}</div>
        <div className="text-sm text-gray-500">
          হেড অফিস : {contactDetails.headOffice}
        </div>
      </div>
      <TeamMembers staffs={staffs} staffId={staffId} />
    </div>
  );
}
