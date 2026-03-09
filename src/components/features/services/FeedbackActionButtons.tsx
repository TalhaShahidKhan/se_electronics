"use client";

import { deleteFeedback } from "@/actions";
import { Modal, StarRating } from "@/components/ui";
import { FeedbackDataType } from "@/types";
import { useRef, useState } from "react";
import { Id, toast } from "react-toastify";

function FeedbackActionButtons({
  feedbackData,
}: {
  feedbackData: FeedbackDataType;
}) {
  const [visibleFeedbacksModal, setVisibleFeedbacksModal] = useState(false);
  const feedbacksArray = feedbackData.feedbacks;
  const serviceId = feedbackData.serviceId;
  const serviceInfo = feedbackData.service;
  const toastId = useRef<Id | null>(null);

  const deleteFeedbackInfo = async () => {
    const confirmed = window.confirm("Delete service " + serviceId + "?");
    if (confirmed) {
      toastId.current = toast("Deleting...", { autoClose: false });
      const res = await deleteFeedback(serviceId);
      toast.update(toastId.current, {
        type: res.success ? "success" : "error",
        render: res.message,
        autoClose: 1500,
      });
    }
  };
  return (
    <>
      <Modal
        isVisible={visibleFeedbacksModal}
        title="Customer Feedbacks"
        onClose={() => setVisibleFeedbacksModal(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
              <div>
                <div className="font-semibold mb-2 p-1 bg-blue-100">
                  Customer Information
                </div>
                <div>
                  {/* Name */}
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Name</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceInfo.customerName}
                    </span>
                  </div>

                  {/* Service Id */}
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Service Id</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    {/* Assuming serviceId is available in the component scope or you meant serviceInfo.serviceId */}
                    <span className="font-semibold">{serviceId}</span>
                  </div>

                  {/* Customer Id (Conditional) */}
                  {serviceInfo.customerId && (
                    <div className="flex border-b py-1">
                      <span className="w-32 flex-shrink-0">Customer Id</span>
                      <span className="mr-4 flex-shrink-0">:</span>
                      <span className="font-semibold">
                        {serviceInfo.customerId}
                      </span>
                    </div>
                  )}

                  {/* Phone Number */}
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Phone Number</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceInfo.customerPhone}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Address</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceInfo.customerAddress}
                    </span>
                  </div>

                  {/* Product Model */}
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Product Model</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceInfo.productModel}
                    </span>
                  </div>

                  {/* Service Type */}
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Service Type</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceInfo.type === "install"
                        ? "Installation"
                        : "Repair"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {/* Dynamic Header: Electrician Information or Technician Information */}
                <div className="font-semibold mb-2 p-1 bg-blue-100">
                  {serviceInfo.type === "install"
                    ? "Electrician Information"
                    : "Technician Information"}
                </div>

                <div>
                  {/* Name */}
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Name</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceInfo.staffName}
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Phone Number</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceInfo.staffPhone}
                    </span>
                  </div>

                  {/* Rating (with conditional rendering for the value/component) */}
                  <div className="flex border-b py-1 items-center">
                    <span className="w-32 flex-shrink-0">Rating</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    {feedbackData.rating ? (
                      // Use a flex container for the rating component and the score text
                      <span className="font-semibold flex items-center gap-2">
                        {/* Assuming StarRating component exists and works here */}
                        <StarRating
                          value={feedbackData.rating}
                          readonly
                          size={24}
                        />
                        <span>({feedbackData.rating})</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm italic">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="max-h-[50vh] overflow-auto mt-10">
              <div className="text-md font-semibold mb-2">
                Customer Feedbacks:
              </div>
              {feedbacksArray.map((feedback) => (
                <div key={feedback.question}>
                  <div className="mb-1">
                    <span className="font-medium">প্রশ্ন: </span>
                    <span className="font-semibold text-gray-500">
                      {feedback.question}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">উত্তর: </span>
                    <span className="font-semibold text-gray-500">
                      {feedback.answer}
                    </span>
                  </div>
                  {feedback.amount && (
                    <div className="mb-1">
                      <span className="font-medium">টাকার পরিমান: </span>
                      <span className="font-semibold text-gray-500">
                        {feedback.amount}
                      </span>
                    </div>
                  )}
                  {feedback.comment && (
                    <div className="mb-1">
                      <span className="font-medium">মন্তব্য: </span>
                      <span className="font-semibold text-gray-500">
                        {feedback.comment}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-6 w-full justify-end">
            <button
              onClick={() => setVisibleFeedbacksModal(false)}
              className="__btn self-end"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      <div className="flex gap-4">
        <button
          title="See feedbacks"
          onClick={() => setVisibleFeedbacksModal(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
        <button
          onClick={deleteFeedbackInfo}
          title="Delete"
          className="text-red-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </div>
    </>
  );
}

export default FeedbackActionButtons;
