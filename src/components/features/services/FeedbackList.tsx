import { getFeedbacks } from "@/actions";
import {
  CopyButton,
  FeedbackActionButtons,
  ProfileLinkButton,
} from "@/components";
import { SearchParams } from "@/types";
import { formatDate } from "@/utils";

async function FeedbackList(params: SearchParams) {
  const response = await getFeedbacks(params);

  if (!response.success) {
    return (
      <tr>
        <td colSpan={9} className="text-center py-4 text-red-500">
          <p>{response.message}</p>
        </td>
      </tr>
    );
  }

  if (response.data.length === 0) {
    return (
      <tr className="border-b">
        <td colSpan={9} className="text-center py-4 text-gray-600">
          <p>No data</p>
        </td>
      </tr>
    );
  }

  const feedbacks = response.data;

  return feedbacks.map((feedback) => (
    <tr key={feedback.serviceId} className="border-b">
      <td className="py-4 px-2 whitespace-nowrap">
        <div className="flex items-center">
          <span>{feedback.serviceId}</span>
          <CopyButton content={feedback.serviceId} />
        </div>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        <p className="truncate max-w-52" title={feedback.service?.customerName}>
          {feedback.customerId ? (
            <ProfileLinkButton
              text={feedback.service?.customerName!}
              customerId={feedback.customerId}
            />
          ) : (
            feedback.service?.customerName
          )}
        </p>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        {feedback.service?.customerPhone}
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        <p
          title={`${feedback.service?.productType}-${feedback.service?.productModel}`}
          className="truncate w-52"
        >
          {feedback.service?.productType}-{feedback.service?.productModel}
        </p>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        {formatDate(feedback.createdAt!)}
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        <p title={feedback.service?.staffName} className="truncate max-w-52">
          {feedback.service?.staffId ? (
            <ProfileLinkButton
              text={feedback.service?.staffName}
              staffId={feedback.service?.staffId}
            />
          ) : (
            feedback.service?.staffName || "--"
          )}
        </p>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        {feedback.service?.staffPhone || "--"}
      </td>
      {/* <td className="hidden">
                    {(feedback.feedbacks! as { question: string, answer: string, amount?: number }[]).map(({ question, answer, amount }) =>
                        <p key={question}>
                            প্রশ্ন: {question}
                            উত্তর: {answer}
                            {amount && `টাকার পরিমান: ${amount}`}
                        </p>
                    )}
                </td> */}
      <td className="py-4 px-2 whitespace-nowrap">
        <FeedbackActionButtons feedbackData={feedback} />
      </td>
    </tr>
  ));
}

export default FeedbackList;
