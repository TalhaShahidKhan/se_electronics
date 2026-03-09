"use client";

import {
  appointStaff,
  deleteService,
  getServiceMediaUrls,
  updateService,
} from "@/actions";
import geoData from "@/assets/data/geo-data.json";
import { StaffMembersModal } from "@/components/features/staff";
import { InputField, Modal, Spinner } from "@/components/ui";
import {
  batteryTypes,
  contactDetails,
  installCompleteMessagePreview,
  ipsBrands,
  productPowerRatings,
  productTypes,
  repairCompleteMessagePreview,
  serviceStatuses,
  stabilizerBrands,
  stabilizerPowerRatings,
} from "@/constants";
import { ProductTypes, ServicesType } from "@/types";
import { FileText } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { Id, toast } from "react-toastify";
import ServiceViewModal from "./ServiceViewModal";

type ServiceStatus =
  | "pending"
  | "in_progress"
  | "appointment_retry"
  | "service_center"
  | "completed"
  | "canceled";

const technicianAppointMessage = `জনাব {service_man_name},\nআপনাকে এস ই ইলেকট্রনিক্স কোম্পানির পন্য সার্ভিস করার জন্য নিয়োগ করা হয়েছে আপনি সম্মানিত কাস্টমার এর সাথে যোগাযোগ করে পন্যটির সমাধান দিন ধন্যবাদ।\nকাস্টমার নাম : {customer_name}\nকাস্টমার ফোন : {customer_phone_number}\nকাস্টমার সার্ভিস আই ডি নং : {service_id}\nপ্রোডাক্ট মডেল : {product_model}\nকাস্টমার লোকেশন : {customer_address}\nসার্ভিসিং সম্পর্কে তথ্য প্রদান করতে লিঙ্কটিতে ক্লিক করুন {service_status_update_url}`;
const electricianAppointMessage = `জনাব {service_man_name},\nআপনাকে এস ই ইলেকট্রনিক্স কোম্পানির পন্য IPS ইন্সটল করার জন্য নিয়োগ করা হয়েছে আপনি সম্মানিত কাস্টমার এর সাথে যোগাযোগ করে পন্যটির সমাধান দিন ধন্যবাদ।\nকাস্টমার নাম : {customer_name}\nকাস্টমার ফোন : {customer_phone_number}\nকাস্টমার সার্ভিস আই ডি নং : {service_id}\nপ্রোডাক্ট মডেল : {product_model}\nকাস্টমার লোকেশন : {customer_address}\nসার্ভিসিং সম্পর্কে তথ্য প্রদান করতে লিঙ্কটিতে ক্লিক করুন {service_status_update_url}`;

export default function ServiceActionButtons({
  serviceData,
}: {
  serviceData: ServicesType;
}) {
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showServiceReport, setShowServiceReport] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const toastId = useRef<Id | null>(null);

  const deleteServiceInfo = async () => {
    const confirmed = window.confirm(
      "Delete service " + serviceData.serviceId + "?",
    );
    if (confirmed) {
      toastId.current = toast("Deleting...", { autoClose: false });
      const res = await deleteService(serviceData.serviceId);
      toast.update(toastId.current, {
        type: res.success ? "success" : "error",
        render: res.message,
        autoClose: 1500,
      });
    }
  };
  return (
    <>
      {showAppointModal && (
        <AppointModel
          serviceData={serviceData}
          onClose={() => setShowAppointModal(false)}
        />
      )}
      {showViewModal && (
        <ServiceViewModal
          service={serviceData}
          onClose={() => setShowViewModal(false)}
        />
      )}
      {showEditModal && (
        <ServiceEditModal
          serviceData={serviceData}
          onClose={() => setShowEditModal(false)}
        />
      )}
      {showServiceReport && serviceData.staffReport && (
        <ServiceReportModal
          serviceReport={serviceData.staffReport}
          serviceType={serviceData.type}
          onClose={() => setShowServiceReport(false)}
        />
      )}
      <div className="flex gap-4">
        <button
          title="View detials"
          className="disabled:opacity-40"
          onClick={() => setShowViewModal(true)}
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
          title="View Report"
          className="disabled:opacity-30"
          disabled={!serviceData.staffReport}
          onClick={() => setShowServiceReport(true)}
        >
          <FileText stroke="currentColor" />
        </button>
        <button
          title={
            serviceData.type === "install"
              ? "Appoint Electrician"
              : "Appoint Technician"
          }
          onClick={() => {
            setShowAppointModal(true);
          }}
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
              d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
            />
          </svg>
        </button>
        <button title="Edit" onClick={() => setShowEditModal(true)}>
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
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </button>
        <button
          title="Delete"
          onClick={deleteServiceInfo}
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

const ServiceReportModal = ({
  serviceReport,
  serviceType,
  onClose,
}: {
  serviceReport: ServicesType["staffReport"];
  serviceType: ServicesType["type"];
  onClose: () => void;
}) => {
  return (
    <Modal isVisible title="Service Full Report" onClose={onClose}>
      <div className="max-h-[50vh] overflow-auto space-y-3">
        <div className="pb-3 border-b">
          <div className="text-sm text-gray-500 mb-1">
            {serviceType === "install"
              ? "কাস্টমার IPS প্যাকেজ টি হোম ইন্সটল করা হয়েছে?"
              : "কাস্টমারের পণ্যের সার্ভিসটি কি সম্পন্ন হয়েছে?"}
          </div>
          <div
            className={`font-semibold ${serviceReport?.resolved ? "text-green-600" : "text-red-600"}`}
          >
            {serviceReport?.resolved ? "হ্যাঁ" : "না"}
          </div>
        </div>

        {serviceReport?.resolved ? (
          <>
            <div className="pb-3 border-b">
              <div className="text-sm text-gray-500 mb-1">
                {serviceType === "install"
                  ? "তার ও অন্যান্য সামগ্রী কে দিয়েছে? এবং তার কতটুকু লেগেছে আর কি কি সামগ্রী ব্যবহার করেছেন তা নিম্নে লিখুন।"
                  : "প্রোডাক্ট এর কি সমস্যা ছিল এবং কি কি পার্টস ঠিক বা পরিবর্তন করতে হয়েছে?"}
              </div>
              <div>{serviceReport?.explanation}</div>
            </div>

            <div className="pb-3 border-b">
              <div className="text-sm text-gray-500 mb-1">
                যাতায়াত খরচ কত হয়েছে?
              </div>
              <div className="font-medium">
                {serviceReport?.travelCost} টাকা
              </div>
            </div>
          </>
        ) : (
          <div className="pb-3 border-b">
            <div className="text-sm text-gray-500 mb-1">
              {serviceType === "install"
                ? "কি কারনে ইন্সটল কাজ স্থগীত করা হয়েছে?"
                : "পণ্যটি ঠিক না হওয়ার কারণ কি?"}
            </div>
            <div>{serviceReport?.reason}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const AppointModel = ({
  serviceData,
  onClose,
}: {
  serviceData: ServicesType;
  onClose: () => void;
}) => {
  const [showStaffMembersModal, setShowStaffMembersModal] = useState(true);
  const [selectedStaffMember, setSelectedStaffMember] = useState(true);
  const [staffMemberData, setStaffMemberData] = useState<{
    staffId?: string;
    staffName: string;
    staffPhone: string;
  }>({ staffName: "", staffPhone: "" });
  const [isAppointing, setIsAppointing] = useState(false);

  const handleAppoint = async () => {
    setIsAppointing(true);
    const data = {
      serviceId: serviceData.serviceId,
      serviceType: serviceData.type,
      customerName: serviceData.customerName,
      customerPhone: serviceData.customerPhone,
      customerAddress: serviceData.customerAddress,
      productModel: serviceData.productModel,
      ...staffMemberData,
    };
    const response = await appointStaff(data);
    toast(response.message, { type: response.success ? "success" : "error" });
    if (response.success) {
      onClose();
    }
    setIsAppointing(false);
  };

  if (showStaffMembersModal) {
    return (
      <StaffMembersModal
        role={serviceData.type === "repair" ? "technician" : "electrician"}
        headerComponent={
          <button
            onClick={() => {
              setShowStaffMembersModal(false);
              setSelectedStaffMember(false);
              setStaffMemberData({ staffName: "", staffPhone: "" });
            }}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Enter info manually
          </button>
        }
        onSelect={(staffData) => {
          setStaffMemberData({
            staffId: staffData.staffId,
            staffName: staffData.name,
            staffPhone: staffData.phone,
          });
          setShowStaffMembersModal(false);
          setSelectedStaffMember(true);
        }}
        onClose={onClose}
      />
    );
  } else {
    return (
      <Modal isVisible title="Appoint Staff" onClose={onClose}>
        <div>
          <div className="flex justify-end h-10">
            <button
              onClick={() => setShowStaffMembersModal(true)}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Select from staff members
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex-1">
              <InputField
                label="Staff Name"
                disabled={!!selectedStaffMember}
                value={staffMemberData.staffName}
                onChange={(e) =>
                  setStaffMemberData({
                    ...staffMemberData,
                    staffName: e.target.value,
                  })
                }
              />
              <InputField
                label="Staff Phone"
                disabled={!!selectedStaffMember}
                value={staffMemberData.staffPhone}
                onChange={(e) =>
                  setStaffMemberData({
                    ...staffMemberData,
                    staffPhone: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <div className="text-md font-semibold">Customer Information</div>
              <div className="text-md flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="">Service Id:</span>
                  <span className="font-bold text-gray-600">
                    {serviceData.serviceId}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="">Name:</span>
                  <span className="font-bold text-gray-600">
                    {serviceData.customerName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="">Phone Number:</span>
                  <span className="font-bold text-gray-600">
                    {serviceData.customerPhone}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="">Address:</span>
                  <span className="font-bold text-gray-600">
                    {serviceData.customerAddress}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="">Product Model:</span>
                  <span className="font-bold text-gray-600">
                    {serviceData.productModel}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <span className="block h-[1px] bg-borderColor my-6"></span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-md font-semibold mb-2">
                Staff Message Preview
              </div>
              <p className="text-sm text-gray-500 sm:max-w-80 w-full whitespace-pre-wrap">
                {serviceData.type === "install"
                  ? electricianAppointMessage
                  : technicianAppointMessage}
              </p>
            </div>
            <div>
              <div className="text-md font-semibold mb-2">
                Customer Message Preview
              </div>
              {serviceData.type === "install" ? (
                <p className="text-sm text-gray-500 sm:max-w-80 w-full whitespace-pre-wrap">
                  প্রিয় গ্রাহক [Customer Name],
                  <br />
                  আপনার [Service Id] প্যাকেজ টি ইন্সটল করার জন্য অফিসিয়াল ইন্সটল
                  টিমকে নিযুক্ত করা হয়েছে। দ্রুত সময়ের মধ্যে ইন্সটল টিম আপনার
                  সাথে যোগাযোগ করে সমাধান করবে। যে কোন তথ্যের জন্য{" "}
                  {contactDetails.customerCare}
                </p>
              ) : (
                <p className="text-sm text-gray-500 sm:max-w-80 w-full whitespace-pre-wrap">
                  প্রিয় গ্রাহক [Customer Name],
                  <br />
                  আপনার [Service Id] সার্ভিসটি সমাধান করার জন্য সার্ভিস টিমকে
                  নিযুক্ত করা হয়েছে। দ্রুত সময়ের মধ্যে সার্ভিস টিম আপনার সাথে
                  যোগাযোগ করে সমাধান করবে। যে কোন তথ্যের জন্য{" "}
                  {contactDetails.customerCare}
                </p>
              )}
            </div>
          </div>
          <button
            disabled={isAppointing}
            onClick={handleAppoint}
            className="__btn w-full disabled:bg-opacity-50"
          >
            {isAppointing ? "Appointing..." : "Appoint"}
          </button>
        </div>
      </Modal>
    );
  }
};

const ServiceEditModal = ({
  serviceData,
  onClose,
}: {
  serviceData: ServicesType;
  onClose: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shouldSendSMS, setShouldSendSMS] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);
  const statusHistory = serviceData.statusHistory[0];
  const [currentServiceStatus, setServiceStatus] = useState(
    statusHistory.statusType === "custom" ? "custom" : statusHistory.status,
  );
  const [tempServiceData, setTempServiceData] = useState({
    ...serviceData,
    statusHistory: statusHistory,
  });
  const [attachedMediaUrls, setAttachedMediaUrls] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState(
    serviceData.productType,
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    serviceData.customerAddressDistrict || "",
  );
  const districts = Object.keys(geoData);
  const thanas = geoData[selectedDistrict as keyof typeof geoData] || [];
  const [response, updateServiceAction, isUpdating] = useActionState(
    (_, fd: FormData) =>
      updateService(
        fd,
        serviceData.serviceId,
        currentServiceStatus === "custom" ? statusHistory.id : undefined,
      ),
    undefined,
  );

  if (response) {
    toast(response.message, { type: response.success ? "success" : "error" });
    if (response.success) {
      onClose();
    }
  }

  const mediaToggleHandler = async (
    e: React.ToggleEvent<HTMLDetailsElement>,
  ) => {
    const element = e.currentTarget;
    if (element.open && attachedMediaUrls.length === 0) {
      const res = await getServiceMediaUrls([
        serviceData.warrantyCardPhotoKey!,
        serviceData.productFrontPhotoKey!,
        serviceData.productBackPhotoKey!,
      ]);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setAttachedMediaUrls(res.data);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const key = event.target.name;
    const value = event.target.value;

    if (key.startsWith("statusHistory")) {
      setTempServiceData({
        ...tempServiceData,
        statusHistory: {
          ...tempServiceData.statusHistory,
          [key.split(".")[1]]: value,
        },
      });
    } else {
      setTempServiceData({
        ...tempServiceData,
        [key]: value,
      });
    }
  };

  const handleUpdate = () => {
    const updates = {};

    for (const key in tempServiceData) {
      if (tempServiceData[key] != serviceData[key]) {
        updates[key] = tempServiceData[key];
      }
    }
  };

  const updateServiceHandler = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    const tempServiceInfo = Object.fromEntries(formData);
    const updates: any = {};

    for (const key in tempServiceInfo) {
      if (tempServiceInfo[key] != tempServiceData[key]) {
        updates[key] = tempServiceInfo[key];
      }
    }

    if (Object.keys(updates).length > 0) {
      if (updates.status && updates.status === "completed" && shouldSendSMS) {
        updates.messageInfo = {
          customerName: updates.customerName || tempServiceData.customerName,
          customerPhoneNumber:
            updates.customerPhoneNumber || tempServiceData.customerPhoneNumber,
          messageType: tempServiceData.serviceType,
        };
      }

      setIsLoading(true);

      const res = await updateService(tempServiceData.serviceId, updates);

      setIsLoading(false);
      setHasUpdates(!res.success);
      if (res.success) onClose();

      toast(res.message, { type: res.success ? "success" : "error" });
    }
  };

  const checkEmptyField = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const tempServiceInfo = Object.fromEntries(formData);
    for (const key in tempServiceInfo) {
      if (tempServiceInfo[key].toString().trim() != tempServiceData[key]) {
        setHasUpdates(true);
        break;
      } else {
        setHasUpdates(false);
      }
    }
  };

  return (
    <Modal isVisible title="Edit Service" onClose={onClose}>
      <form action={updateServiceAction}>
        {/* <input type="hidden" name="serviceId" value={serviceData.serviceId} /> */}
        {serviceData.createdFrom === "dashboard" ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <InputField
                label="Customer Name"
                name="customerName"
                value={tempServiceData.customerName}
                onChange={handleInputChange}
                required={false}
              />
              <InputField
                label="Customer Phone Number"
                name="customerPhone"
                value={tempServiceData.customerPhone}
                onChange={handleInputChange}
                required={false}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <InputField
                label="Customer Address"
                name="customerAddress"
                value={tempServiceData.customerAddress}
                onChange={handleInputChange}
                required={false}
              />
              <div className="flex-1 text-start">
                <label className="text-sm">
                  Product Type
                  <select
                    name="productType"
                    value={tempServiceData.productType}
                    onChange={handleInputChange}
                    className="w-full bg-white border rounded-md outline-none h-10 px-2 mt-1"
                  >
                    {productTypes.map((productType) => (
                      <option key={productType} value={productType}>
                        {productType.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <InputField
                label="Product Model"
                name="productModel"
                value={tempServiceData.productModel}
                onChange={handleInputChange}
                required={false}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                defaultValue={serviceData.customerName}
                label="নাম"
                name="customerName"
                required={false}
              />
              <InputField
                defaultValue={serviceData.customerPhone}
                label="মোবাইল নাম্বার"
                name="customerPhone"
                type="tel"
                required={false}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                defaultValue={serviceData.customerAddress}
                label="বর্তমান ঠিকানা"
                name="customerAddress"
                required={false}
              />
              <div className="flex-1 text-start">
                <label className="text-sm">
                  জেলা <span className="text-red-500 text-lg">*</span>
                  <select
                    name="district"
                    className="__input p-0 px-2 mt-1"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">নির্বাচন করুন</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 text-start">
                <label className="text-sm">
                  থানা <span className="text-red-500 text-lg">*</span>
                  <select
                    name="policeStation"
                    className="__input p-0 px-2 mt-1"
                    defaultValue={
                      serviceData.customerAddressPoliceStation || ""
                    }
                  >
                    <option value="">নির্বাচন করুন</option>
                    {thanas.map((thana) => (
                      <option key={thana} value={thana}>
                        {thana}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <InputField
                defaultValue={serviceData.customerAddressPostOffice}
                label="পোস্ট অফিস"
                name="customerAddressPostOffice"
                required={false}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                defaultValue={serviceData.memoNumber}
                label="মেমো নং"
                name="memoNumber"
                required={false}
              />
              <div className="flex-1 text-start">
                <label className="text-sm">
                  পণ্যের ধরণ
                  <select
                    name="productType"
                    className="__input p-0 px-2 mt-1"
                    value={selectedProductType}
                    onChange={(e) =>
                      setSelectedProductType(e.target.value as ProductTypes)
                    }
                  >
                    {productTypes.map((type, i) => (
                      <option key={type} value={type}>
                        {type.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            {(selectedProductType === "ips" ||
              selectedProductType === "battery") && (
              <div className="grid grid-cols-1">
                <div className="flex-1 text-start">
                  <label className="text-sm">
                    আইপিএস ব্র্যান্ড
                    <select
                      defaultValue={serviceData.ipsBrand!}
                      required
                      name="ipsBrand"
                      className="__input p-0 px-2 mt-1"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {ipsBrands.map((model, i) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}
            {selectedProductType && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 text-start">
                  {selectedProductType === "others" ? (
                    <InputField
                      defaultValue={serviceData.productModel}
                      label="পণ্যের মডেল"
                      name="productModel"
                      required={false}
                    />
                  ) : (
                    <label className="text-sm">
                      পণ্যের মডেল
                      <select
                        defaultValue={serviceData.productModel!}
                        required
                        name="productModel"
                        className="__input p-0 px-2 mt-1"
                      >
                        <option value="">নির্বাচন করুন</option>
                        {(selectedProductType === "stabilizer"
                          ? stabilizerBrands
                          : batteryTypes
                        ).map((model, i) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <div className="flex-1 text-start">
                  {selectedProductType === "others" ? (
                    <InputField
                      defaultValue={serviceData.powerRating}
                      label="পণ্যের ওয়াট/ভিএ"
                      name="powerRating"
                      required={false}
                    />
                  ) : (
                    <label className="text-sm">
                      পণ্যের ওয়াট/ভিএ
                      <select
                        defaultValue={serviceData.powerRating!}
                        name="powerRating"
                        className="__input p-0 px-2 mt-1"
                      >
                        <option value="">নির্বাচন করুন</option>
                        {(selectedProductType === "stabilizer"
                          ? stabilizerPowerRatings
                          : productPowerRatings
                        ).map((ratings, i) => (
                          <option key={ratings} value={ratings}>
                            {ratings}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1">
              <div className="flex-1 text-start">
                <label className="text-sm">
                  পণ্যের সমস্যা
                  <textarea
                    defaultValue={serviceData.reportedIssue}
                    name="reportedIssue"
                    placeholder="পণ্যের সমস্যা বিস্তারিত বর্ণনা করুন"
                    className="__input h-32 mt-1"
                  ></textarea>
                </label>
              </div>
            </div>
            <details
              onToggle={mediaToggleHandler}
              className="select-none cursor-pointer mb-6"
            >
              <summary>Attached Photos</summary>
              {attachedMediaUrls.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  <InputField
                    src={attachedMediaUrls[0]}
                    label="ওয়ারেন্টি কার্ডের ছবি"
                    name="warrantyCardPhoto"
                    type="file"
                    required={false}
                  />
                  <InputField
                    src={attachedMediaUrls[1]}
                    label="প্রোডাক্টের ছবি (সামনের দিকের)"
                    placeholder="সামনের দিকের ছবি"
                    name="productFrontPhoto"
                    type="file"
                    required={false}
                  />
                  <InputField
                    src={attachedMediaUrls[2]}
                    label="প্রোডাক্টের ছবি (পেছনের দিকের)"
                    placeholder="পেছনের দিকের ছবি"
                    name="productBackPhoto"
                    type="file"
                    required={false}
                  />
                </div>
              ) : (
                <div className="__center text-gray-400 h-32">
                  <Spinner />
                </div>
              )}
            </details>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="flex-1 text-start">
            <label className="text-sm">
              Status
              <select
                name="serviceStatus"
                className="w-full bg-white border rounded-md outline-none h-10 px-2 mt-1"
                value={currentServiceStatus}
                onChange={(e) => {
                  setServiceStatus(e.target.value as ServiceStatus);
                  handleInputChange(e);
                }}
              >
                {serviceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
                {statusHistory.statusType === "custom" && (
                  <option value="custom">Custom Note</option>
                )}
                <option value="new_note">Add New Note</option>
              </select>
            </label>
          </div>
          {currentServiceStatus === "canceled" && (
            <div className="flex-1">
              <label className="text-sm">
                Reason
                <textarea
                  className="__input h-32 mt-1"
                  name="cancelReason"
                  defaultValue={statusHistory.cancelReason || ""}
                  placeholder="Reson for cancellation..."
                ></textarea>
                <span
                  id="monica-writing-entry-btn-root"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    pointerEvents: "none",
                  }}
                ></span>
              </label>
            </div>
          )}
        </div>
        {currentServiceStatus === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* <input type="hidden" name="statusId" value={statusHistory.id} /> */}
            <InputField
              label="CustomLabel"
              name="customLabel"
              defaultValue={statusHistory.customLabel || ""}
            />
            <label className="text-sm">
              Custom Note <span className="text-red-500 text-lg">*</span>
              <textarea
                className="__input h-32 mt-2"
                name="customNote"
                defaultValue={statusHistory.customNote || ""}
                placeholder="Note..."
                required
              ></textarea>
              <span
                id="monica-writing-entry-btn-root"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  pointerEvents: "none",
                }}
              ></span>
            </label>
          </div>
        )}
        {currentServiceStatus === "new_note" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <InputField
              label="CustomLabel"
              name="customLabel"
              defaultValue={
                serviceData.type === "install"
                  ? "ইলেক্ট্রিশিয়ান হোম ওয়ারিং টিম নোট"
                  : "টেকনিশিয়ান সার্ভিস টিম নোট"
              }
            />
            <label className="text-sm">
              Custom Note <span className="text-red-500 text-lg">*</span>
              <textarea
                className="__input h-32 mt-2"
                name="customNote"
                defaultValue={""}
                placeholder="Note..."
                required
              ></textarea>
              <span
                id="monica-writing-entry-btn-root"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  pointerEvents: "none",
                }}
              ></span>
            </label>
          </div>
        )}
        {currentServiceStatus === "completed" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shouldSendSMS}
                  onChange={(e) => setShouldSendSMS(e.target.checked)}
                  name="sendCompletionSMS"
                  className="size-5"
                  id="sendCompletionSMS"
                />
                <label htmlFor="sendCompletionSMS">Send Feedback SMS</label>
              </div>
            </div>
            <div>
              <label className="mb-1 block">Message preview:</label>
              <div className="max-w-96 text-gray-600 text-sm">
                <p className="whitespace-pre-wrap text-sm">
                  {serviceData.type === "install"
                    ? installCompleteMessagePreview
                    : repairCompleteMessagePreview}
                </p>
              </div>
            </div>
          </div>
        )}
        <button
          disabled={isUpdating}
          className="__btn w-full disabled:bg-opacity-50"
        >
          {isUpdating ? "Updating..." : "Update"}
        </button>
      </form>
    </Modal>
  );
};
