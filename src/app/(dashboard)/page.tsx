'use client'

import { createService } from "@/actions";
import { contactDetails, productTypes } from "@/constants";
import { useSideNavContext } from "@/hooks";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Home() {
  const [response, createServiceAction, isPending] = useActionState(createService, undefined)
  const [hasEmptyField, setHasEmptyField] = useState(true)
  const { openSideNav } = useSideNavContext()

  const checkEmptyField = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget)
    const tempServiceInfo = Object.fromEntries(formData)
    setHasEmptyField(Object.values(tempServiceInfo).some(value => value.toString().trim() === ''))
  }

  useEffect(() => {
    if (!isPending && response) {
      toast(response.message, {
        type: response.success ? 'success' : 'error'
      })
    }
  }, [isPending])

  return (
    <div className="flex flex-col gap-4">
      <header>
        <div className="flex items-center gap-4">
          <button title="Show Sidebar" onClick={openSideNav} className="xl:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="font-bold text-2xl">
            <span>Add Service</span>
          </div>
        </div>
      </header>
      <form action={createServiceAction} onChange={checkEmptyField} className="max-w-[700px]">
        <div className="mb-6">
          <label htmlFor="customerName" className="mb-2 block">Customer Name</label>
          <input required className="__input" placeholder="Name" type="text" name="customerName" id="customerName" />
        </div>
        <div className="mb-6">
          <label htmlFor="customerPhone" className="mb-2 block">Phone Number</label>
          <input required className="__input" placeholder="Number" type="text" name="customerPhone" id="customerPhone" />
        </div>
        <div className="mb-6">
          <label htmlFor="customerAddress" className="mb-2 block">Address</label>
          <input required className="__input" placeholder="Address" type="text" name="customerAddress" id="customerAddress" />
        </div>
        <div className="mb-6">
          <label htmlFor="productType" className="mb-2 block">Product Type</label>
          <select name="productType" id="productType" className="w-full bg-white border rounded-md outline-none h-10 px-2">
            {productTypes.map(productType => <option key={productType} value={productType}>{productType.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="productModel" className="mb-2 block">Product Model</label>
          <input required className="__input" placeholder="Model" type="text" name="productModel" id="productModel" />
        </div>
        <div className="mb-6">
          <label className="mb-2 block">Message preview:</label>
          <div className="max-w-96 text-gray-600">
            <p>
              প্রিয় গ্রাহক [Customer Name] SE ELECTRONICS আপনার সার্ভিসিং এর অনুরোধটি গ্রহণ করা হয়েছে সার্ভিস আই ডি নং [Service Id] ধন্যবাদ আমাদের সাথে থাকার জন্য যে কোন তথ্যের জন্য {contactDetails.customerCare}
            </p>
          </div>
        </div>
        <button
          disabled={isPending}
          className="__btn w-full disabled:bg-opacity-50"
        >
          {isPending ? 'Adding...' : 'Add Service'}
        </button>
      </form>
    </div>
  );
}