"use client";

import { deleteCustomer, sendInvoiceDownloadLink, updateCustomerVipStatus } from "@/actions";
import { getProducts } from "@/actions/productActions";
import { ProductSelectionModal } from "@/components";
import { CustomerData, Product } from "@/types";
import { useRef, useState } from "react";
import { Id, toast } from "react-toastify";
import clsx from "clsx";
import CustomerForm from "./CustomerForm";
import CustomerViewModal from "./CustomerViewModal";

export default function CustomerActionButtons({
  customerData,
}: {
  customerData: CustomerData;
}) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const toastId = useRef<Id | null>(null);

  const sendDownloadLink = async () => {
    if (!customerData.invoice) {
      return;
    }
    toastId.current = toast("Sending...", { autoClose: false });
    const res = await sendInvoiceDownloadLink(
      {
        name: customerData.name,
        phoneNumber: customerData.phone,
      },
      {
        invoiceNumber: customerData.invoiceNumber,
        date: customerData.invoice.date,
        totalPrice: customerData.invoice.total,
        invoiceType: "customer-invoice",
      },
    );
    toast.update(toastId.current, {
      type: res.success ? "success" : "error",
      render: res.message,
      autoClose: 1500,
    });
  };

  const fetchProducts = async () => {
    const res = await getProducts(customerData.invoice.id);
    setIsProductsLoading(false);
    if (res.success) {
      setProducts(res.data!);
    } else {
      alert(res.message);
    }
  };

  const viewHandler = () => {
    setShowInfoModal(true);
    fetchProducts();
  };

  const deleteCustomerHandler = async () => {
    const confirmed = window.confirm(
      "Delete customer " + customerData.name + "?",
    );
    if (confirmed) {
      toastId.current = toast("Deleting...", { autoClose: false });
      const res = await deleteCustomer(customerData.id);
      toast.update(toastId.current, {
        type: res.success ? "success" : "error",
        render: res.message,
        autoClose: 1500,
      });
    }
  };
  return (
    <div className="flex gap-4">
      {showInfoModal && (
        <CustomerViewModal
          customer={customerData}
          products={products}
          onClose={() => setShowInfoModal(false)}
        />
      )}
      {showEditModal && (
        <CustomerForm
          customerData={customerData}
          onClose={() => setShowEditModal(false)}
          mode="update"
        />
      )}
      {showProducts && (
        <ProductSelectionModal
          productItems={products}
          invoiceId={customerData.invoice.id}
          onClose={() => setShowProducts(false)}
        />
      )}
      <button
        title="View customers info"
        className="disabled:opacity-40"
        onClick={viewHandler}
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
        disabled={!customerData.invoiceNumber}
        className="disabled:opacity-40"
        title="Send invoice download link"
        onClick={sendDownloadLink}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 -rotate-45"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
      </button>
      <button
        title={"Add to service list"}
        onClick={() => setShowProducts(true)}
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
            d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
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
        title={customerData.vipStatus === "approved" ? "VIP Member" : "Promote to VIP"}
        onClick={async () => {
           if (customerData.vipStatus === "approved") {
              toast.info("Customer is already a VIP");
              return;
           }
           if (confirm(`Promote ${customerData.name} to VIP?`)) {
              const res = await updateCustomerVipStatus(customerData.customerId, "approved");
              if (res.success) toast.success(res.message);
              else toast.error(res.message);
           }
        }}
        className={clsx(customerData.vipStatus === "approved" ? "text-amber-500" : "text-gray-400 hover:text-amber-400")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a2 2 0 01-1.414-.586l-4.828-4.828A2 2 0 015.172 14.172L12 7.343l6.828 6.829a2 2 0 01.586 1.414l-4.828 4.828A2 2 0 0112 21z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.343l4.243-4.243a2 2 0 012.828 0l2.122 2.122a2 2 0 010 2.828l-4.243 4.243M12 7.343L7.757 3.1a2 2 0 00-2.828 0L2.807 5.222a2 2 0 000 2.828l4.243 4.243" />
        </svg>
      </button>

      <button
        title="Delete"
        onClick={deleteCustomerHandler}
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
  );
}
