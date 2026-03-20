"use client";

import { createFeedback } from "@/actions";
import { StarRating } from "@/components/ui";
import {
  contactDetails,
  customFeedbackQuestion,
  feedbackQuestions,
} from "@/constants";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "react-toastify";

export default function FeedbackForm({
  serviceId,
  customerId,
}: {
  serviceId: string;
  customerId?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [answers, setAnswers] = useState(feedbackQuestions.map(() => ""));
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [customAnswer, setCustomAnswer] = useState<{
    answer: string;
    amount?: number;
  }>({
    answer: "",
  });
  const handleAnswer = (index: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const hasEmptyAnswer =
      answers.some((ans) => ans === "") ||
      customAnswer.answer === "" ||
      (customAnswer.answer === "হ্যাঁ" && !customAnswer.amount);

    if (hasEmptyAnswer) {
      toast.error("প্রিয় গ্রাহক, অনুগ্রহ করে প্রয়োজনীয় তথ্য গুলো পূরণ করুন।");
      return;
    } else {
      toast.dismiss();
    }

    const feedbacks = feedbackQuestions.map((q, i) => ({
      question: q.question,
      answer: answers[i],
    }));
    feedbacks.push({
      question: customFeedbackQuestion,
      ...(comment !== "" && { comment: comment }),
      ...customAnswer,
    });

    setIsSubmitting(true);
    const res = await createFeedback({
      customerId: customerId,
      serviceId: serviceId,
      feedbacks,
      rating: rating > 0 ? rating : null,
    });
    setIsSubmitting(false);
    toast(res.message, {
      type: res.success ? "success" : "error",
    });
    setShowSuccessPage(res.success);
  };
  if (showSuccessPage) {
    return (
      <div className="absolute inset-0 flex flex-col gap-4 items-center text-center px-4 justify-start pt-32">
        <div className="text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={0.5}
            stroke="currentColor"
            className="size-28"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <p className="text-3xl">আপনার মূল্যবান ফিডব্যাকের জন্য ধন্যবাদ</p>
        <p>
          আপনার ফিডব্যাক এর মতামত এর প্রেক্ষিতে আমাদের কোম্পানি SE ELECTRONICS
          আরো ভালো সার্ভিস দেওয়ার আপ্রান চেষ্টা করবে
        </p>
        <a href="https://seipsbd.com/" className="__btn">
          Go to home
        </a>
      </div>
    );
  } else
    return (
      <div className="mx-auto max-w-[600px] text-center p-4">
        <div className="h-full font-bold mb-4 flex flex-col gap-0.5 bg-[#e9f8ff] border-[#6EC1E4] border p-6 rounded-md">
          <div className="text-2xl">কাস্টমার সার্ভিস ম্যানেজমেন্ট</div>
          <div className="text-lg">গ্রাহক সেবা মূল‌্যায়ন ফর্ম পূরণ করুন</div>
          <div className="text-lg">সার্ভিস নম্বর - {serviceId}</div>
          <div className="text-lg">Email : {contactDetails.email}</div>
          <div className="text-lg">
            হেল্পলাইন : {contactDetails.customerCare}
          </div>
          <div className="text-sm text-gray-500">
            হেড অফিস : {contactDetails.headOffice}
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-[#e9f8ff] border-[#6EC1E4] border p-6 rounded-md">
          {feedbackQuestions.map(({ question }, index) => (
            <div key={question} className="mt-6 flex flex-col gap-4">
              <p>
                {question} <span className="text-red-500 text-lg">*</span>{" "}
              </p>
              <div className="flex gap-6">
                <button
                  onClick={() => handleAnswer(index, "হ্যাঁ")}
                  className={clsx(
                    "__btn flex-1 hover:bg-green-600 hover:text-white border border-green-600",
                    answers[index] === "হ্যাঁ"
                      ? "bg-green-600 text-white"
                      : "bg-transparent text-black",
                  )}
                >
                  হ্যাঁ
                </button>
                <button
                  onClick={() => handleAnswer(index, "না")}
                  className={clsx(
                    "__btn flex-1 hover:bg-red-500 hover:text-white border border-red-500",
                    answers[index] === "না"
                      ? "bg-red-500 text-white"
                      : "bg-transparent text-black",
                  )}
                >
                  না
                </button>
              </div>
            </div>
          ))}
          <div className="mt-6 flex flex-col gap-4">
            <p>
              {customFeedbackQuestion}
              <span className="text-red-500 text-lg">*</span>
            </p>
            <div className="flex gap-6">
              <button
                onClick={() =>
                  setCustomAnswer({
                    ...customAnswer,
                    answer: "হ্যাঁ",
                  })
                }
                className={clsx(
                  "__btn flex-1 hover:bg-green-600 hover:text-white border border-green-600",
                  customAnswer.answer === "হ্যাঁ"
                    ? "bg-green-600 text-white"
                    : "bg-transparent text-black",
                )}
              >
                হ্যাঁ
              </button>
              <button
                onClick={() =>
                  setCustomAnswer({
                    answer: "না",
                  })
                }
                className={clsx(
                  "__btn flex-1 hover:bg-red-500 hover:text-white border border-red-500",
                  customAnswer.answer === "না"
                    ? "bg-red-500 text-white"
                    : "bg-transparent text-black",
                )}
              >
                না
              </button>
            </div>
            {customAnswer.answer === "হ্যাঁ" && (
              <input
                onChange={(e) =>
                  setCustomAnswer({
                    ...customAnswer,
                    amount: parseInt(e.target.value),
                  })
                }
                value={customAnswer.amount}
                autoFocus
                type="number"
                className="__input"
                placeholder="টাকার পরিমান"
              />
            )}
          </div>
          <div className="mt-6 flex flex-col gap-4">
            <p>আপনার অভিজ্ঞতা কেমন ছিল? রেটিং দিন। </p>
            <StarRating
              size={30}
              className="self-center"
              value={rating}
              onChange={(rating) => setRating(rating)}
            />
          </div>
          <div className="mt-6 flex flex-col gap-4">
            <label htmlFor="comment">মন্তব্য (optional)</label>
            <div className="flex gap-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                name="comment"
                id="comment"
                placeholder="আপনার মুল্যবান মন্তব্য লিখুন"
                className="__input h-36"
              ></textarea>
            </div>
          </div>
          <button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="__btn mx-auto w-64 disabled:bg-opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    );
}
