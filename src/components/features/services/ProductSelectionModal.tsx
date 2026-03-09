"use client";

import { addToService } from "@/actions";
import { getProducts } from "@/actions/productActions";
import { Modal, Spinner, StatusBadge } from "@/components";
import { Product } from "@/types";
import { isWarrantyValid } from "@/utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function ProductSelectionModal({
  invoiceId,
  productItems,
  onClose,
}: {
  invoiceId: string;
  productItems: Product[];
  onClose: () => void;
}) {
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [serviceType, setServiceType] = useState<"install" | "repair">(
    "repair",
  );
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(productItems);
  const [isAdding, setIsAdding] = useState(false);

  const addToServiceHandler = async () => {
    if (selectedProduct) {
      setIsAdding(true);
      const res = await addToService({
        productId: selectedProduct,
        serviceType,
      });
      toast(res.message, { type: res.success ? "success" : "error" });
      setIsAdding(false);
      res.success && onClose();
    }
  };

  const fetchProducts = async () => {
    const res = await getProducts(invoiceId);
    setIsProductsLoading(false);
    if (res.success) {
      setProducts(res.data!);
    } else {
      alert(res.message);
    }
  };

  useEffect(() => {
    if (productItems.length === 0) fetchProducts();
  }, []);

  return (
    <Modal title="Select Product" isVisible onClose={onClose}>
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead>
            <tr className="text-left bg-gray-100">
              <th></th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Model</th>
              <th className="px-4 py-2">Warranty status</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedProduct(product.id)}
                >
                  <td className="py-2 text-center">
                    <input
                      type="radio"
                      name="service-product"
                      className="size-5"
                      value={product.id}
                      checked={selectedProduct === product.id}
                      onChange={() => setSelectedProduct(product.id)}
                    />
                  </td>
                  <td className="px-4 py-2">{product.type.toUpperCase()}</td>
                  <td className="px-4 py-2">{product.model}</td>
                  <td className="px-4 py-2">
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-600">
                  <Spinner />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="flex-1 text-start">
            <label className="text-sm">
              Service Type <span className="text-red-500 text-lg">*</span>
              <select
                className="w-full bg-white border rounded-md outline-none h-10 px-2 mt-1"
                name="paymentType"
                value={serviceType}
                onChange={(e) =>
                  setServiceType(e.target.value as typeof serviceType)
                }
              >
                <option key={"repair"} value="repair">
                  Repair
                </option>
                <option key={"install"} value="install">
                  Install
                </option>
              </select>
            </label>
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
            onClick={addToServiceHandler}
            disabled={!selectedProduct || isAdding}
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ProductSelectionModal;
