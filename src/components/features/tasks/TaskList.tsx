"use client";

import { db } from "@/db/drizzle";
import { tasks, staffs } from "@/db/schema";
import { TaskType, StaffsType } from "@/types";
import { formatDate } from "@/utils";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  MoreVertical, 
  ListTodo, 
  Info, 
  AlertTriangle, 
  Zap, 
  Calendar, 
  Clock, 
  User, 
  Filter
} from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";
import { Spinner } from "@/components/ui";
import TaskForm from "./TaskForm";
import { getAllTeamMembers } from "@/actions/staffActions";
// We'll need to add an action to get all tasks for admin
// For now, assume we'll add it to taskActions

export default function TaskList() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [staffs, setStaffs] = useState<StaffsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchData = async () => {
    setIsLoading(true);
    // Dynamic import to avoid circular dependencies if any
    const { getAllTasks } = await import("@/actions/taskActions");
    const [tasksRes, staffsRes] = await Promise.all([
      getAllTasks(),
      getAllTeamMembers()
    ]);
    if (tasksRes.success) setTasks(tasksRes.data as any);
    if (staffsRes.success) setStaffs(staffsRes.data as any);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.staff?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <div className="h-64 __center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-3xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or staff..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-2xl transition-all outline-none text-sm font-bold"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["all", "pending", "in_progress", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2",
                  filterStatus === status 
                    ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" 
                    : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"
                )}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-full lg:w-auto px-6 py-4 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-800 transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Assign New Task
        </button>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full h-64 __center flex-col gap-4 text-gray-400 bg-white rounded-[2.5rem] border border-dashed">
            <ListTodo size={48} strokeWidth={1} />
            <p className="font-bold uppercase tracking-widest text-sm text-center">No tasks found matching your criteria</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand/20 transition-all overflow-hidden flex flex-col h-full">
              {/* Header */}
              <div className="p-6 pb-4 flex justify-between items-start">
                <div className={clsx(
                  "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest",
                  {
                    "bg-blue-50 text-blue-600": task.priority === "low",
                    "bg-emerald-50 text-emerald-600": task.priority === "normal",
                    "bg-orange-50 text-orange-600": task.priority === "high",
                    "bg-rose-50 text-rose-600": task.priority === "urgent",
                  }
                )}>
                  {task.priority} Priority
                </div>
                <div className={clsx(
                  "size-8 rounded-full flex items-center justify-center transition-colors",
                  {
                    "bg-gray-100 text-gray-400": task.status === "pending",
                    "bg-blue-100 text-blue-600": task.status === "in_progress",
                    "bg-emerald-100 text-emerald-600": task.status === "completed",
                    "bg-rose-100 text-rose-600": task.status === "cancelled",
                  }
                )}>
                   {task.status === "completed" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                </div>
              </div>

              {/* Body */}
              <div className="px-6 flex-1 space-y-3">
                <h3 className="text-lg font-black text-gray-900 group-hover:text-brand transition-colors line-clamp-2 uppercase tracking-tight">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 font-medium">
                  {task.description}
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="size-8 rounded-xl bg-white flex items-center justify-center text-brand shadow-sm">
                      <User size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned To</p>
                      <p className="text-xs font-black text-gray-900 truncate uppercase">{task.staff?.name || "Unknown"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 mt-auto border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Calendar size={12} className="text-brand" />
                  Due: {task.dueDate ? formatDate(task.dueDate) : "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "text-[10px] font-black uppercase tracking-widest",
                    {
                      "text-gray-400": task.status === "pending",
                      "text-blue-600": task.status === "in_progress",
                      "text-emerald-600": task.status === "completed",
                      "text-rose-600": task.status === "cancelled",
                    }
                  )}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <TaskForm 
          staffs={staffs} 
          onClose={() => setShowForm(false)} 
          onSuccess={fetchData} 
        />
      )}
    </div>
  );
}

import { CheckCircle2 } from "lucide-react";
