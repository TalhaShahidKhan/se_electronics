"use client";

import { createCustomer, updateCustomer } from "@/actions";
import { getProducts } from "@/actions/productActions";
import { InputField, Modal, Spinner } from "@/components/ui";
import { paymentTypes, productTypes, warrantyMonths } from "@/constants";
import { CustomerData, Product } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export default function CustomerForm({
  customerData,
  mode,
  onClose,
}: {
  customerData?: Pick<
    CustomerData,
    "customerId" | "name" | "phone" | "address"
  > & {
    invoice: Pick<
      CustomerData["invoice"],
      "id" | "date" | "paymentType" | "subtotal" | "total" | "dueAmount"
    >;
  };
  mode: "create" | "update";
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [sendInvoiceLink, setSendInvoiceLink] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(
    customerData || {
      name: "",
      phone: "",
      address: "",
      invoice: {
        date: new Date(),
        paymentType: "cash",
        subtotal: 0,
        total: 0,
        dueAmount: 0,
      },
    },
  );

  const [productItems, setProductItems] = useState<
    Omit<Product, "invoiceId">[]
  >(
    mode === "update"
      ? []
      : [
          {
            id: uuidv4(),
            type: "ips",
            model: "",
            warrantyDurationMonths: 0,
            warrantyStartDate: new Date(),
            quantity: 1,
            unitPrice: 0,
          },
        ],
  );

  const totalAmount = productItems.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity || 0),
    0,
  );
  const advanceAmount = totalAmount - customerInfo.invoice.dueAmount;

  const fetchProducts = async () => {
    if (!customerData) return;
    const res = await getProducts(customerData.invoice.id);
    setIsLoadingProducts(false);
    if (res.success) {
      setProductItems(res.data!);
    } else {
      alert(res.message);
    }
  };

  const addItem = () => {
    setProductItems([
      ...productItems,
      {
        id: uuidv4(),
        type: "ips",
        model: "",
        warrantyDurationMonths: 0,
        warrantyStartDate: new Date(),
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (productItems.length === 1) return;
    setProductItems(productItems.filter((item) => item.id !== id));
  };

  const handleSumbit = async () => {
    toast.dismiss();
    setIsSubmitting(true);

    const customerDataPayload = {
      ...customerInfo,
      invoice: {
        ...customerInfo.invoice,
        paymentType: (customerInfo.invoice.paymentType as "cash" | "bkash" | "nagad" | "rocket" | "bank") ?? "cash",
        subtotal: totalAmount,
        total: totalAmount,
        dueAmount: customerInfo.invoice.dueAmount ?? 0,
      },
      products: productItems,
    };

    console.log(customerDataPayload);

    const response =
      mode === "create"
        ? await createCustomer(customerDataPayload as Parameters<typeof createCustomer>[0], sendInvoiceLink)
        : await updateCustomer(
            customerData!.customerId,
            customerDataPayload as Parameters<typeof updateCustomer>[1],
            sendInvoiceLink,
          );

    if (response.success) onClose();
    setIsSubmitting(false);

    toast(response.message, {
      type: response.success ? "success" : "error",
    });
  };

  const handleCustomerInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const key = e.target.name;
    const value = e.target.value;

    if (key === "name" || key === "phone" || key === "address") {
      setCustomerInfo({
        ...customerInfo,
        [key]: value,
      });
    } else {
      setCustomerInfo({
        ...customerInfo,
        invoice: {
          ...customerInfo.invoice,
          [key]: value,
        },
      });
    }
  };

  const handleProductItemChange = (
    id: string,
    field: string,
    value: string | number,
  ) => {
    setProductItems(
      productItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  useEffect(() => {
    if (mode === "update") {
      fetchProducts();
    }
  }, []);
  return (
    <Modal width="900" isVisible title="Create Customer" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <InputField
            onChange={handleCustomerInputChange}
            value={customerInfo.name}
            label="Name"
            name="name"
          />
          <InputField
            onChange={handleCustomerInputChange}
            value={customerInfo.phone}
            label="Phone Number"
            name="phone"
            type="tel"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <InputField
            onChange={handleCustomerInputChange}
            value={customerInfo.address}
            label="Address"
            name="address"
          />
          <InputField
            onChange={handleCustomerInputChange}
            value={
              customerInfo.invoice.date instanceof Date
                ? customerInfo.invoice.date.toISOString().split("T")[0]
                : customerInfo.invoice.date
            }
            label="Date"
            name="date"
            type="date"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex-1 text-start">
            <label className="text-sm">
              Payment Type <span className="text-red-500 text-lg">*</span>
              <select
                className="w-full bg-white border rounded-md outline-none h-10 px-2 mt-1"
                name="paymentType"
                value={customerInfo.invoice.paymentType}
                onChange={handleCustomerInputChange}
              >
                {paymentTypes.map((type) => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <input
              onChange={(e) => setSendInvoiceLink(e.target.checked)}
              checked={sendInvoiceLink}
              className="size-5"
              id="sendInvoiceLink"
              type="checkbox"
              name="sendDownloadLink"
            />
            <label htmlFor="sendInvoiceLink">Send Invoice link</label>
          </div>
        </div>
        {/* Invoice Items Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Products</h3>
            <button
              type="button"
              onClick={addItem}
              className="px-2 py-1 text-sm __btn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Item
            </button>
          </div>
          <div className="">
            <div className="overflow-x-auto">
              <table className="w-full table-auto whitespace-nowrap">
                <thead>
                  <tr className="text-sm bg-gray-100">
                    <th className="text-left py-4 px-2">Type</th>
                    <th className="text-left py-4 px-2">Model</th>
                    <th className="text-left py-4 px-2">Warranty</th>
                    <th className="text-left py-4 px-2">Warranty Start Date</th>
                    <th className="text-left py-4 px-2">Qty</th>
                    <th className="text-left py-4 px-2">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {mode === "update" && isLoadingProducts ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-4 text-gray-600"
                      >
                        <Spinner />
                      </td>
                    </tr>
                  ) : (
                    productItems.map((item) => (
                      <tr key={item.id}>
                        <td className="pr-2">
                          <select
                            className="bg-white border rounded-md outline-none h-10 px-2 mt-1"
                            value={item.type}
                            onChange={(e) =>
                              handleProductItemChange(
                                item.id,
                                "type",
                                e.target.value.toLowerCase(),
                              )
                            }
                          >
                            {productTypes.map((productType) => (
                              <option key={productType} value={productType}>
                                {productType.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <InputField
                            name={`model-${item.id}`}
                            placeholder="Model"
                            required={true}
                            value={item.model}
                            onChange={(e) =>
                              handleProductItemChange(
                                item.id,
                                "model",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="p-2">
                          <select
                            className="bg-white border rounded-md outline-none h-10 px-2 mt-1"
                            value={item.warrantyDurationMonths}
                            onChange={(e) =>
                              handleProductItemChange(
                                item.id,
                                "warrantyDurationMonths",
                                e.target.value,
                              )
                            }
                          >
                            {warrantyMonths.map((m) =>
                              m === 0 ? (
                                <option key={m} value={m}>
                                  NONE
                                </option>
                              ) : (
                                <option key={m} value={m}>
                                  {m} Months
                                </option>
                              ),
                            )}
                          </select>
                        </td>
                        <td className="p-2">
                          <InputField
                            name={`warrantyStartDate-${item.id}`}
                            type="date"
                            required={false}
                            value={
                              item.warrantyStartDate instanceof Date
                                ? item.warrantyStartDate
                                    .toISOString()
                                    .split("T")[0]
                                : item.warrantyStartDate
                            }
                            onChange={(e) =>
                              handleProductItemChange(
                                item.id,
                                "warrantyStartDate",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="p-2 w-24">
                          <InputField
                            name={`totalPrice-${item.id}`}
                            min={1}
                            type="number"
                            placeholder="Quantity"
                            required={true}
                            value={item.quantity}
                            onChange={(e) =>
                              handleProductItemChange(
                                item.id,
                                "quantity",
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex gap-3">
                            <InputField
                              name={`totalPrice-${item.id}`}
                              min={0}
                              type="number"
                              placeholder="Unit Price"
                              required={true}
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleProductItemChange(
                                  item.id,
                                  "unitPrice",
                                  parseInt(e.target.value),
                                )
                              }
                            />
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                              disabled={productItems.length === 1}
                              title={
                                productItems.length === 1
                                  ? "Cannot remove last item"
                                  : "Remove item"
                              }
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <hr className="my-4" />
            <div className="flex flex-col gap-1 mt-6 w-[40%] ml-auto">
              <div className="flex justify-between">
                <p className=" font-medium">Sub Total:</p>
                <p className=" font-medium">
                  {totalAmount.toLocaleString()} TK
                </p>
              </div>
              <div className="flex justify-between">
                <p className=" font-medium">Total:</p>
                <p className=" font-medium">
                  {totalAmount.toLocaleString()} TK
                </p>
              </div>
              <div className="flex justify-between">
                <p className=" font-medium">Advance:</p>
                <p className=" font-medium">
                  {advanceAmount > 0 ? advanceAmount.toLocaleString() : 0} TK
                </p>
              </div>
              <div className="flex justify-between">
                <p className=" font-medium">Due Amount:</p>
                <input
                  className="__input w-48"
                  name="dueAmount"
                  min={0}
                  max={totalAmount}
                  type="number"
                  placeholder="Due Amount"
                  required={false}
                  value={customerInfo.invoice.dueAmount}
                  onChange={handleCustomerInputChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="__btn"
            onClick={handleSumbit}
            disabled={
              isSubmitting || customerInfo.invoice.dueAmount > totalAmount
            }
          >
            {mode === "update"
              ? isSubmitting
                ? "Updating..."
                : "Update"
              : isSubmitting
                ? "Adding..."
                : "Add Record"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
