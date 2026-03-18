"use client";

import { getSMSLogs } from "@/actions/taskActions";
import { Spinner } from "@/components/ui";
import { SMSLogType } from "@/types";
import { formatDate } from "@/utils";
import { useState, useEffect } from "react";
import { Smartphone, CheckCircle2, XCircle, Search, User, Clock, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export default function SMSLogsPage() {
  const [logs, setLogs] = useState<SMSLogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    const res = await getSMSLogs();
    if (res.success) setLogs(res.data as any);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.phoneNumber.includes(searchQuery) || 
    l.staff?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="h-64 __center"><Spinner /></div>;

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">SMS Audit Logs</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Track and monitor message delivery status</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone or message..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent focus:border-brand rounded-2xl transition-all outline-none text-sm font-bold shadow-sm"
            />
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Message</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-4">
                      <Smartphone size={48} strokeWidth={1} />
                      <p className="font-bold uppercase tracking-widest text-sm">No logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand shrink-0">
                          <User size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate uppercase">{log.staff?.name || "Unknown"}</p>
                          <p className="text-xs font-bold text-gray-400 tracking-wider">{log.phoneNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-xs font-medium text-gray-600 line-clamp-2 leading-relaxed italic">
                        "{log.message}"
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={clsx(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                        log.status === "sent" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                      )}>
                        {log.status === "sent" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {log.status}
                      </div>
                      {log.error && (
                        <div className="mt-1 flex items-center justify-center gap-1 text-[9px] text-rose-400 font-bold uppercase tracking-tighter">
                          <AlertTriangle size={10} />
                          {log.error}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <p className="text-xs font-black text-gray-900">{formatDate(log.createdAt)}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
