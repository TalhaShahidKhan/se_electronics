"use client";

import {
  getCustomerById,
  getFeedbackHistoryById,
  getServiceHistoryById,
} from "@/actions";
import { getProducts } from "@/actions/productActions";
import { Modal, ProfileLinkButton, Spinner, StatusBadge } from "@/components";
import { CustomerData, Product } from "@/types";
import { formatDate, isWarrantyValid } from "@/utils";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

function CustomerViewModal({
  customerId,
  customer,
  products,
  onClose,
}: {
  customerId?: string;
  customer?: CustomerData;
  products?: Product[];
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(customerId ? true : false);
  const [customerData, setCustomerData] = useState<any>({ ...customer });
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productItems, setProductItems] = useState(products || []);
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [feedbacksData, setFeedbacksData] = useState<any[]>([]);
  const [isLoadingServiceHistory, setIsLoadingServiceHistory] = useState(false);
  const [isLoadingFeedbacksHistory, setIsLoadingFeedbacksHistory] =
    useState(false);

  useEffect(() => {
    if (products) {
      setProductItems(products);
    }
  }, [products]);

  const serviceHistoryToggleHandler = async (
    e: React.ToggleEvent<HTMLDetailsElement>,
  ) => {
    const element = e.currentTarget;
    if (element.open && serviceData.length === 0) {
      setIsLoadingServiceHistory(true);
      const res = await getServiceHistoryById(customerData.customerId);
      if (res.success) {
        setServiceData(res.data ? [...res.data] : []);
      } else {
        toast.error(res.message);
      }
      setIsLoadingServiceHistory(false);
    }
  };

  const feedbackHistoryToggleHandler = async (
    e: React.ToggleEvent<HTMLDetailsElement>,
  ) => {
    const element = e.currentTarget;
    if (element.open && feedbacksData.length === 0) {
      setIsLoadingFeedbacksHistory(true);
      const res = await getFeedbackHistoryById(customerData.customerId);
      if (res.success) {
        setFeedbacksData(res.data ? [...res.data] : []);
      } else {
        toast.error(res.message);
      }
      setIsLoadingFeedbacksHistory(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      (async () => {
        setIsLoading(true);
        const res = await getCustomerById(customerId);

        if (res.success) {
          setCustomerData({ ...res.data });
          setIsLoading(false);

          const productResponse = await getProducts(res.data?.invoice?.id ?? '');
          console.log({ productResponse });

          if (productResponse.success) {
            setProductItems(productResponse.data!);
          } else {
            toast.error(res.message);
          }
        } else {
          toast.error(res.message);
          onClose();
        }
      })();
    }
  }, []);
  return (
    <Modal title="Customer Profile" isVisible onClose={onClose}>
      {isLoading ? (
        <div className="__center h-32">
          <Spinner />
        </div>
      ) : (
        <div>
          <div className="font-semibold mb-2 p-1 bg-blue-100">
            Customer Info
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-md border-b pb-4">
            <div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Customer ID</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">{customerData.customerId}</span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Invoice number</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {customerData.invoiceNumber}
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Name</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">{customerData.name}</span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Phone</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">{customerData.phone}</span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Address</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">{customerData.address}</span>
              </div>
            </div>
            <div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Date</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {formatDate(customerData.invoice.date)}
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Payment Type</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {customerData.invoice.paymentType}
                </span>
              </div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Total</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {customerData.invoice?.total.toLocaleString()} TK
                </span>
              </div>
              {customerData.invoice?.dueAmount ? (
                <>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Advance</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {(
                        customerData.invoice?.total -
                        customerData.invoice?.dueAmount
                      ).toLocaleString()}{" "}
                      TK
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Due</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold text-red-500">
                      {customerData.invoice?.dueAmount.toLocaleString()} TK
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">Paid</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    {customerData.invoice?.total.toLocaleString()} TK
                  </span>
                </div>
              )}
            </div>
          </div>
          <h2 className="text-lg font-semibold mt-4 mb-2">Products</h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Model</th>
                  <th className="px-4 py-2">Warranty</th>
                  <th className="px-4 py-2">Warranty start date</th>
                  <th className="px-4 py-2">Warranty status</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {productItems.length > 0 ? (
                  productItems.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">
                        {product.type.toUpperCase()}
                      </td>
                      <td className="px-4 py-2">{product.model}</td>
                      <td className="py-3 px-3 text-center">
                        {product.warrantyDurationMonths === 0
                          ? "None"
                          : product.warrantyDurationMonths + " Months"}
                      </td>
                      <td className="px-4 py-2">
                        {formatDate(product.warrantyStartDate)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <StatusBadge
                          status={
                            isWarrantyValid(
                              product.warrantyStartDate,
                              product.warrantyDurationMonths,
                            )
                              ? "valid"
                              : "expired"
                          }
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        {product.quantity}
                      </td>
                      <td className="px-4 py-2">
                        {product.unitPrice.toLocaleString()} TK
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-600">
                      <Spinner />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <details onToggle={serviceHistoryToggleHandler}>
              <summary className="font-semibold select-none cursor-pointer">
                Servicing History
              </summary>
              {isLoadingServiceHistory ? (
                <div className="__center text-gray-400 h-32">
                  <Spinner />
                </div>
              ) : serviceData.length === 0 ? (
                <div className="__center text-gray-400 h-32">No history</div>
              ) : (
                <ul className="mt-4 overflow-auto max-h-80">
                  {serviceData.map((service: any, i: number) => (
                    <li key={service.id} className="relative flex gap-3.5">
                      <span className="text-sm">
                        {formatDate(service.createdAt)}
                      </span>
                      <div className="flex gap-3.5">
                        <div className="w-3.5 flex flex-col h-full pt-1">
                          <div
                            className={clsx(
                              "size-3.5 rounded-full  __center text-white relative bg-blue-500",
                            )}
                          ></div>
                          {i != serviceData!.length - 1 && (
                            <div
                              className={"bg-gray-300 w-0.5 m-auto flex-1"}
                            ></div>
                          )}
                        </div>
                        <div className="flex flex-col text-start gap-2 pb-8">
                          <div className={clsx("font-bold space-x-2")}>
                            <span>
                              {service.productType.toUpperCase()}-
                              {service.productModel}
                            </span>
                            <StatusBadge
                              status={
                                service.statusHistory[0].status ?? "custom"
                              }
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              Service Id:{" "}
                              <span className="font-semibold text-sm">
                                {service.serviceId}
                              </span>
                            </span>
                            <span className="text-sm">
                              Servceman:{" "}
                              {service.staffName ? (
                                service.staffId ? (
                                  <ProfileLinkButton
                                    text={service.staffName}
                                    staffId={service.staffId}
                                  />
                                ) : (
                                  <span className="font-semibold text-sm hover:unserline">
                                    {service.staffName}
                                  </span>
                                )
                              ) : (
                                <span className="text-gray-400 text-sm ">
                                  Not assigned
                                </span>
                              )}
                            </span>
                            <span className="text-sm">
                              Address:{" "}
                              <span className="font-semibold text-sm">
                                {service.customerAddress}
                              </span>
                            </span>
                            <span className="text-sm">
                              Service Type:{" "}
                              <span className="font-semibold text-sm">
                                {service.type === "install"
                                  ? "Installation"
                                  : "Repair"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </details>
            <details onToggle={feedbackHistoryToggleHandler}>
              <summary className="font-semibold select-none cursor-pointer">
                Feedback History
              </summary>
              {isLoadingFeedbacksHistory ? (
                <div className="__center text-gray-400 h-32">
                  <Spinner />
                </div>
              ) : feedbacksData.length === 0 ? (
                <div className="__center text-gray-400 h-32">No history</div>
              ) : (
                <ul className="mt-4 overflow-auto max-h-80">
                  {feedbacksData.map((feedback: any, i: number) => (
                    <li key={feedback.id} className="relative flex gap-3.5">
                      <span className="text-sm leading-none">
                        {formatDate(feedback.createdAt)}
                      </span>
                      <div className="flex gap-3.5">
                        <div className="w-3.5 flex flex-col h-full">
                          <div
                            className={clsx(
                              "size-3.5 rounded-full  __center text-white relative bg-blue-500",
                            )}
                          ></div>
                          {i != feedbacksData.length - 1 && (
                            <div
                              className={"bg-gray-300 w-0.5 m-auto flex-1"}
                            ></div>
                          )}
                        </div>
                        <div className="flex flex-col text-start gap-2 pb-8">
                          <div className={clsx("font-bold leading-none")}>
                            {feedback.service.productType.toUpperCase()}-
                            {feedback.service.productModel}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              Service Id:{" "}
                              <span className="font-semibold text-sm">
                                {feedback.service.serviceId}
                              </span>
                            </span>
                            <span className="text-sm">
                              Serviceman:{" "}
                              {feedback.service.staffName ? (
                                feedback.service.staffId ? (
                                  <ProfileLinkButton
                                    text={feedback.service.staffName}
                                    staffId={feedback.service.staffId}
                                  />
                                ) : (
                                  <span className="font-semibold text-sm hover:unserline">
                                    {feedback.service.staffName}
                                  </span>
                                )
                              ) : (
                                <span className="text-gray-400 text-sm ">
                                  Not assigned
                                </span>
                              )}
                            </span>
                            <details className="max-h-[50vh] overflow-auto text-sm">
                              <summary className="text-sm font-semibold mb-2 cursor-pointer">
                                Feedbacks
                              </summary>
                              {feedback.feedbacks?.map((f: any) => (
                                <div key={f.question}>
                                  <div className="mb-1">
                                    <span className="font-medium">
                                      প্রশ্ন:{" "}
                                    </span>
                                    <span className="font-semibold text-gray-500">
                                      {f.question}
                                    </span>
                                  </div>
                                  <div className="mb-1">
                                    <span className="font-medium">উত্তর: </span>
                                    <span className="font-semibold text-gray-500">
                                      {f.answer}
                                    </span>
                                  </div>
                                  {f.amount && (
                                    <div className="mb-1">
                                      <span className="font-medium">
                                        টাকার পরিমান:{" "}
                                      </span>
                                      <span className="font-semibold text-gray-500">
                                        {f.amount}
                                      </span>
                                    </div>
                                  )}
                                  {f.comment && (
                                    <div className="mb-1">
                                      <span className="font-medium">
                                        মন্তব্য:{" "}
                                      </span>
                                      <span className="font-semibold text-gray-500">
                                        {f.comment}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </details>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default CustomerViewModal;
