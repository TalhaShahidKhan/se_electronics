"use client";

import { use, useState, useEffect, useCallback } from "react";
import { getVipCustomers, updateCustomerVipStatus } from "@/actions/customerActions";
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreHorizontal,
  UserCheck,
  Phone,
  Hash,
  Filter,
  RefreshCw,
  Gift
} from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";

export default function VipManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string }>;
}) {
  const { query: queryParam, status: statusParam } = use(searchParams);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(queryParam || "");
  const [status, setStatus] = useState<any>(statusParam || "");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await getVipCustomers({ query, status });
    if (res.success) {
      setData(res.data || []);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }, [query, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (customerId: string, newStatus: any) => {
    setProcessingId(customerId);
    const res = await updateCustomerVipStatus(customerId, newStatus);
    if (res.success) {
      toast.success(res.message);
      fetchData();
    } else {
      toast.error(res.message);
    }
    setProcessingId(null);
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "processing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "rejected": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand/10 rounded-xl text-brand">
            <Gift size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              VIP Customer Management
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Manage VIP card applications and memberships
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, phone or card number..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand/20 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand/20 outline-none min-w-[150px]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="approved">Approved (VIPs)</option>
          <option value="rejected">Rejected</option>
        </select>
        <button 
          onClick={fetchData}
          className="p-2.5 bg-brand text-white rounded-xl hover:bg-brand-800 transition-all flex items-center justify-center"
          title="Refresh"
        >
          <RefreshCw size={18} className={clsx(loading && "animate-spin")} />
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl border border-gray-100 animate-pulse" />
          ))
        ) : data.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-gray-100 border-dashed text-center">
             <CreditCard size={48} className="mx-auto mb-4 text-gray-200" />
             <p className="text-gray-500 font-bold">No VIP customers found matching your criteria</p>
          </div>
        ) : (
          data.map((customer) => (
            <div 
              key={customer.customerId}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Card Header Style */}
              <div className={clsx(
                "h-2",
                customer.vipStatus === "approved" ? "bg-emerald-500" : 
                customer.vipStatus === "pending" ? "bg-amber-400" : "bg-gray-200"
              )} />
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                      <UserCheck size={24} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-gray-900 truncate">
                        {customer.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Phone size={12} className="shrink-0" />
                        <span className="text-xs font-bold">{customer.phone}</span>
                      </div>
                    </div>
                  </div>
                  <span className={clsx(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                    getStatusStyle(customer.vipStatus)
                  )}>
                    {customer.vipStatus}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                   <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                      <span className="text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Hash size={12} /> ID
                      </span>
                      <span className="text-gray-900 font-black">{customer.customerId}</span>
                   </div>
                   
                   {customer.vipCardNumber && (
                     <div className="bg-brand/5 p-3 rounded-xl border border-brand/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <CreditCard size={14} className="text-brand" />
                           <span className="text-xs font-bold text-gray-400">CARD NUMBER</span>
                        </div>
                        <span className="text-sm font-black text-brand tracking-[0.1em]">
                           {customer.vipCardNumber.match(/.{1,4}/g)?.join(" ") || customer.vipCardNumber}
                        </span>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {customer.vipStatus !== "approved" && (
                    <button
                      onClick={() => handleStatusUpdate(customer.customerId, "approved")}
                      disabled={processingId === customer.customerId}
                      className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase hover:bg-emerald-100 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </button>
                  )}
                  {customer.vipStatus !== "rejected" && customer.vipStatus !== "approved" && (
                    <button
                      onClick={() => handleStatusUpdate(customer.customerId, "rejected")}
                      disabled={processingId === customer.customerId}
                      className="flex items-center justify-center gap-2 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase hover:bg-rose-100 transition-all disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  )}
                  {customer.vipStatus === "pending" && (
                    <button
                      onClick={() => handleStatusUpdate(customer.customerId, "processing")}
                      disabled={processingId === customer.customerId}
                      className="col-span-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase hover:bg-blue-100 transition-all disabled:opacity-50"
                    >
                      <Clock size={14} />
                      Mark Processing
                    </button>
                  )}
                  {customer.vipStatus === "approved" && (
                    <button
                      onClick={() => handleStatusUpdate(customer.customerId, "pending")}
                      disabled={processingId === customer.customerId}
                      className="col-span-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-500 rounded-xl text-xs font-black uppercase hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={14} />
                      Revoke / Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
