"use client";

import { getSubscriberById } from "@/actions";
import { Modal, Spinner } from "@/components/ui";
import { formatDate, parseUserAgent } from "@/utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function SubscriberViewModal({
  subscriberId,
  subscriber,
  onClose,
}: {
  subscriberId?: string;
  subscriber?: any;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(subscriberId ? true : false);
  const [subscriberData, setSubscriberData] = useState({ ...subscriber });
  const userAgentInfo = parseUserAgent(subscriberData.userAgent);

  useEffect(() => {
    if (subscriberId) {
      (async () => {
        setIsLoading(true);
        const res = await getSubscriberById(subscriberId);
        if (res.success) {
          setSubscriberData({ ...res.data });
          setIsLoading(false);
        } else {
          toast.error(res.message);
          onClose();
        }
      })();
    }
  }, []);
  return (
    <Modal title="Subscriber View" isVisible={true} onClose={onClose}>
      {isLoading ? (
        <div className="__center h-32">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Header */}
          <div>
            <div className="font-semibold mb-2 p-1 bg-blue-100">
              Customer Info
            </div>
            <div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Subscriber ID</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {subscriberData.subscriptionId}
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Name</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">{subscriberData.name}</span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Phone</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">{subscriberData.phone}</span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Created</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {formatDate(subscriberData.createdAt)}
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">IP Address</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {subscriberData.ipAddress}
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Device Type</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {userAgentInfo.device} ({userAgentInfo.os})
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Browser Type</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">{userAgentInfo.browser}</span>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div>
            <div className="text-md font-semibold mb-2 p-1 bg-blue-100">
              Subscription Info
            </div>
            <div className="">
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Package</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {subscriberData.subscriptionType === "battery_maintenance" &&
                    "Battery Maintenance"}
                  {subscriberData.subscriptionType ===
                    "ips_and_battery_maintenance" && "IPS + Battery"}
                  {subscriberData.subscriptionType === "full_maintenance" &&
                    "Full Maintenance"}
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Package Price</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  ৳{subscriberData.basePrice.toLocaleString()}
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Duration</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {subscriberData.subscriptionDuration} months
                </span>
              </div>
              {subscriberData.surchargeAmount !== 0 && (
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">Extra volt charge</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    ৳{subscriberData.surchargeAmount.toLocaleString()}
                  </span>
                </div>
              )}
              {subscriberData.discountAmount !== 0 && (
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">Discount</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    ৳{subscriberData.discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Total</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {subscriberData.discountAmount > 0 && (
                    <del>
                      ৳
                      {(
                        (subscriberData.basePrice +
                          subscriberData.surchargeAmount) *
                        subscriberData.subscriptionDuration
                      ).toLocaleString()}
                    </del>
                  )}
                  &nbsp;৳{subscriberData.totalFee.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="text-md font-semibold mb-2 p-1 bg-blue-100">
              Product Info
            </div>
            <div className="">
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Battery Type</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {subscriberData.batteryType}
                </span>
              </div>
              {subscriberData.ipsBrand && (
                <>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">IPS Brand</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {subscriberData.ipsBrand}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Power Rating</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {subscriberData.ipsPowerRating}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="text-md font-semibold mb-2 p-1 bg-blue-100">
              Address
            </div>
            <div className="">
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Address</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {subscriberData.streetAddress}
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">District</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">{subscriberData.district}</span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Police Station</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {subscriberData.policeStation}
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Post Office</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {subscriberData.postOffice}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <div className="text-md font-semibold mb-2 p-1 bg-blue-100">
              Payment Info
            </div>
            <div className="">
              <div className="flex border-b py-1">
                <span className="w-40 flex-shrink-0">Payment Method</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold capitalize">
                  {subscriberData.paymentType}
                </span>
              </div>

              {subscriberData.paymentType !== "bank" &&
                subscriberData.paymentType !== "cash" && (
                  <>
                    {subscriberData.walletNumber && (
                      <div className="flex border-b py-1">
                        <span className="w-40 flex-shrink-0">
                          Wallet Number
                        </span>
                        <span className="mr-4 flex-shrink-0">:</span>
                        <span className="font-semibold">
                          {subscriberData.walletNumber}
                        </span>
                      </div>
                    )}
                    {subscriberData.transactionId && (
                      <div className="flex border-b py-1">
                        <span className="w-40 flex-shrink-0">
                          Transaction ID
                        </span>
                        <span className="mr-4 flex-shrink-0">:</span>
                        <span className="font-semibold">
                          {subscriberData.transactionId}
                        </span>
                      </div>
                    )}
                  </>
                )}

              {subscriberData.paymentType === "bank" &&
                subscriberData.bankInfo && (
                  <>
                    <div className="flex border-b py-1">
                      <span className="w-40 flex-shrink-0">Bank Name</span>
                      <span className="mr-4 flex-shrink-0">:</span>
                      <span className="font-semibold">
                        {subscriberData.bankInfo.bankName}
                      </span>
                    </div>
                    <div className="flex border-b py-1">
                      <span className="w-40 flex-shrink-0">Account Holder</span>
                      <span className="mr-4 flex-shrink-0">:</span>
                      <span className="font-semibold">
                        {subscriberData.bankInfo.accountHolderName}
                      </span>
                    </div>
                    <div className="flex border-b py-1">
                      <span className="w-40 flex-shrink-0">Account Number</span>
                      <span className="mr-4 flex-shrink-0">:</span>
                      <span className="font-semibold">
                        {subscriberData.bankInfo.accountNumber}
                      </span>
                    </div>
                    <div className="flex border-b py-1">
                      <span className="w-40 flex-shrink-0">Branch</span>
                      <span className="mr-4 flex-shrink-0">:</span>
                      <span className="font-semibold">
                        {subscriberData.bankInfo.branchName}
                      </span>
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
