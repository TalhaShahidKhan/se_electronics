"use client";

import { getServiceById, getServiceMediaUrls } from "@/actions";
import { ImageWithLightbox, Modal, Spinner, StatusBadge } from "@/components";
import { generateUrl, parseUserAgent } from "@/utils";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ServiceViewModal({
  serviceId,
  service,
  onClose,
}: {
  serviceId?: string;
  service?: any;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [serviceData, setServiceData] = useState({ ...service });
  const [attachedMediaUrls, setAttachedMediaUrls] = useState<string[]>([]);
  let userAgentInfo;

  if (serviceData.userAgent) {
    userAgentInfo = parseUserAgent(serviceData.userAgent);
  }

  const mediaToggleHandler = async (
    e: React.ToggleEvent<HTMLDetailsElement>,
  ) => {
    const element = e.currentTarget;
    if (element.open && attachedMediaUrls.length === 0) {
      const res = await getServiceMediaUrls([
        serviceData.productFrontPhotoKey,
        serviceData.productBackPhotoKey,
        serviceData.warrantyCardPhotoKey,
      ]);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setAttachedMediaUrls(res.data ?? []);
    }
  };

  useEffect(() => {
    if (serviceId) {
      (async () => {
        setIsLoading(true);
        const res = await getServiceById(serviceId);
        if (res.success) {
          setServiceData({ ...res.data });
          setIsLoading(false);
        } else {
          toast.error(res.message);
          onClose();
        }
      })();
    }
  }, []);
  return (
    <Modal
      title={`${serviceData.type === "repair" ? "Repair" : "Install"} Service View`}
      isVisible={true}
      onClose={onClose}
    >
      {isLoading ? (
        <div className="__center h-32">
          <Spinner />
        </div>
      ) : (
        <div className="">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="font-semibold mb-2 p-1 bg-blue-100">
                Customer Info
              </div>
              <div>
                {serviceData.customerId && (
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Customer ID</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceData.customerId}
                    </span>
                  </div>
                )}
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">নাম</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    {serviceData.customerName}
                  </span>
                </div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">মোবাইল নাম্বার</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    {serviceData.customerPhone}
                  </span>
                </div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">মেমো নং</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  {serviceData.memoNumber ? (
                    <span className="font-semibold">
                      {serviceData.memoNumber}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">IP Address</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  {serviceData.ipAddress ? (
                    <span className="font-semibold">
                      {serviceData.ipAddress}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">Device Type</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  {userAgentInfo ? (
                    <span className="font-semibold">
                      {userAgentInfo.device} ({userAgentInfo.os})
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">Browser Type</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  {userAgentInfo ? (
                    <span className="font-semibold">
                      {userAgentInfo.browser}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2 p-1 bg-blue-100">
                Address Info
              </div>
              <div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">বর্তমান ঠিকানা</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    {serviceData.customerAddress}
                  </span>
                </div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">জেলা</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  {serviceData.customerAddressDistrict ? (
                    <span className="font-semibold">
                      {serviceData.customerAddressDistrict}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">থানা</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  {serviceData.customerAddressPoliceStation ? (
                    <span className="font-semibold">
                      {serviceData.customerAddressPoliceStation}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="w-32 flex-shrink-0">পোস্ট অফিস</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  {serviceData.customerAddressPostOffice ? (
                    <span className="font-semibold">
                      {serviceData.customerAddressPostOffice}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2 p-1 bg-blue-100">
                Product Info
              </div>
              <div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">পণ্যের ধরণ</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    {serviceData.productType?.toUpperCase()}
                  </span>
                </div>
                {serviceData.productType === "ips" && serviceData.ipsBrand && (
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">আইপিএস ব্র্যান্ড</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceData.ipsBrand}
                    </span>
                  </div>
                )}
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">পণ্যের মডেল</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    {serviceData.productModel}
                  </span>
                </div>
                <div className="flex items-center border-b py-1">
                  <span className="w-32 flex-shrink-0">পণ্যের ওয়াট/ভিএ</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  {serviceData.powerRating ? (
                    <span className="font-semibold">
                      {serviceData.powerRating}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">পণ্যের সমস্যা</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  {serviceData.reportedIssue ? (
                    <p className="italic break-all whitespace-pre-wrap">
                      {serviceData.reportedIssue}
                    </p>
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2 p-1 bg-blue-100">
                {serviceData.type === "repair" ? "Technician" : "Electrician"}{" "}
                Info
              </div>
              {serviceData.staffName ? (
                <div>
                  {serviceData.staffId && (
                    <div className="flex border-b py-1">
                      <span className="w-32 flex-shrink-0">
                        {serviceData.type === "repair"
                          ? "Technician"
                          : "Electrician"}{" "}
                        ID
                      </span>
                      <span className="mr-4 flex-shrink-0">:</span>
                      <span className="font-semibold">
                        {serviceData.staffId}
                      </span>
                    </div>
                  )}
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">নাম</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceData.staffName}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">মোবাইল নাম্বার</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {serviceData.staffPhone}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-gray-400 text-sm italic">
                  Not assigned
                </span>
              )}
            </div>
          </div>
          {service && (
            <div className="mt-5">
              <div className="font-semibold mb-2 p-1 bg-blue-100">
                Service Info
              </div>
              <div>
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">Status</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    <StatusBadge
                      status={
                        serviceData.statusHistory[0].statusType === "system"
                          ? serviceData.statusHistory[0].status!
                          : "custom"
                      }
                    />
                  </span>
                </div>
                {serviceData.statusHistory[0].cancelReason && (
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Cancel Reson</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <p className="text-sm">
                      {serviceData.statusHistory[0].cancelReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {serviceData.serviceId && (
            <div className="mt-4">
              <Link
                prefetch={false}
                href={generateUrl("service-tracking", {
                  trackingId: serviceData.serviceId,
                })}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                Open tracking page
              </Link>
            </div>
          )}
          {serviceData.createdFrom === "public_form" && (
            <details
              onToggle={mediaToggleHandler}
              className="select-none cursor-pointer border-t mt-4 pt-4"
            >
              <summary>Attached Photos</summary>
              {attachedMediaUrls.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {attachedMediaUrls.map((url, index) => (
                    <div key={url}>
                      <ImageWithLightbox src={url} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="__center text-gray-400 h-32">
                  <Spinner />
                </div>
              )}
            </details>
          )}
        </div>
      )}
    </Modal>
  );
}
