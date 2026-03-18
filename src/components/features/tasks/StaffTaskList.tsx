"use client";

import { getStaffTasks, updateTaskStatus } from "@/actions/taskActions";
import { Spinner, Modal } from "@/components/ui";
import { TaskType, TaskStatus } from "@/types";
import { formatDate } from "@/utils";
import { useState, useEffect } from "react";
import { 
  ListTodo, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  AlertTriangle, 
  Zap, 
  Calendar, 
  Clock, 
  Inbox, 
  PlayCircle,
  CheckCircle,
  XCircle,
  FileText,
  MessageSquare
} from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";

export default function StaffTaskList() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const res = await getStaffTasks();
    if (res.success) setTasks(res.data as any);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    setIsUpdatingStatus(true);
    const res = await updateTaskStatus(taskId, newStatus);
    if (res.success) {
      toast.success(res.message);
      setTasks(prev => 
        prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t)
      );
      if (selectedTask?.taskId === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } else {
      toast.error(res.message);
    }
    setIsUpdatingStatus(false);
  };

  if (isLoading) return <div className="h-64 __center"><Spinner /></div>;

  const pendingCount = tasks.filter(t => t.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-brand/5 flex items-center justify-center">
            <ListTodo size={24} className="text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Assigned Tasks</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              {pendingCount} Pending Tasks
            </p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        {tasks.length === 0 ? (
          <div className="h-64 __center flex-col gap-4 text-gray-400 bg-white rounded-[2rem] border border-dashed">
            <Inbox size={48} strokeWidth={1} />
            <p className="font-bold uppercase tracking-widest text-sm">No tasks assigned yet</p>
          </div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.taskId}
              onClick={() => setSelectedTask(task)}
              className={clsx(
                "group relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-white rounded-[2rem] border transition-all text-left",
                task.status === "completed" ? "border-gray-50 opacity-75" : "border-brand/10 shadow-md hover:shadow-lg hover:border-brand/30"
              )}
            >
              {/* Priority Indicator */}
              <div className={clsx(
                "shrink-0 size-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                {
                  "bg-blue-500 shadow-blue-100": task.priority === "low",
                  "bg-emerald-500 shadow-emerald-100": task.priority === "normal",
                  "bg-orange-500 shadow-orange-100": task.priority === "high",
                  "bg-rose-500 shadow-rose-100": task.priority === "urgent",
                }
              )}>
                {task.priority === "urgent" ? <Zap size={24} /> : 
                 task.priority === "high" ? <AlertTriangle size={24} /> : 
                 <Info size={24} />}
              </div>

              {/* Task Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-gray-900 group-hover:text-brand transition-colors truncate uppercase tracking-tight">
                    {task.title}
                  </h3>
                  <span className={clsx(
                    "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                    {
                      "bg-gray-100 text-gray-500": task.status === "pending",
                      "bg-blue-100 text-blue-600": task.status === "in_progress",
                      "bg-emerald-100 text-emerald-600": task.status === "completed",
                      "bg-rose-100 text-rose-600": task.status === "cancelled",
                    }
                  )}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1 font-medium">
                  {task.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <Calendar size={12} className="text-brand" />
                    Due: {task.dueDate ? formatDate(task.dueDate) : "No Deadline"}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <Clock size={12} className="text-brand" />
                    Assigned: {formatDate(task.createdAt)}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-4">
                <div className="size-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Task Details Modal */}
      <Modal
        isVisible={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Details"
        width="700"
      >
        {selectedTask && (
          <div className="space-y-8 p-1">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    "px-3 py-1 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-sm",
                    {
                      "bg-blue-500 text-white": selectedTask.priority === "low",
                      "bg-emerald-500 text-white": selectedTask.priority === "normal",
                      "bg-orange-500 text-white": selectedTask.priority === "high",
                      "bg-rose-500 text-white": selectedTask.priority === "urgent",
                    }
                  )}>
                    {selectedTask.priority} Priority
                  </span>
                  <span className={clsx(
                    "px-3 py-1 rounded-xl text-xs font-black uppercase tracking-[0.2em] bg-gray-100 text-gray-600",
                  )}>
                    {selectedTask.status.replace("_", " ")}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight uppercase">
                  {selectedTask.title}
                </h2>
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Date</p>
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Calendar size={16} className="text-brand" />
                  {formatDate(selectedTask.createdAt)}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Due Date</p>
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Clock size={16} className="text-brand" />
                  {selectedTask.dueDate ? formatDate(selectedTask.dueDate) : "No Deadline"}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText size={14} className="text-brand" />
                Task Description
              </h4>
              <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm min-h-32 text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                {selectedTask.description}
              </div>
            </div>

            {/* Attachments (Placeholder for now) */}
            {selectedTask.files && selectedTask.files.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileText size={14} className="text-brand" />
                  Associated Files
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTask.files.map((file, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-brand/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                          <FileText size={16} />
                        </div>
                        <span className="text-xs font-bold text-gray-600 truncate max-w-[150px]">File_{idx+1}</span>
                      </div>
                      <button className="text-[10px] font-black uppercase text-brand tracking-widest opacity-0 group-hover:opacity-100 transition-all">View</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
              {selectedTask.status === "pending" && (
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusUpdate(selectedTask.taskId, "in_progress")}
                  className="flex-1 min-w-[140px] py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {isUpdatingStatus ? <Spinner /> : <PlayCircle size={18} />}
                  Start Task
                </button>
              )}
              {selectedTask.status === "in_progress" && (
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusUpdate(selectedTask.taskId, "completed")}
                  className="flex-1 min-w-[140px] py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  {isUpdatingStatus ? <Spinner /> : <CheckCircle size={18} />}
                  Complete Task
                </button>
              )}
              {selectedTask.status !== "completed" && selectedTask.status !== "cancelled" && (
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusUpdate(selectedTask.taskId, "cancelled")}
                  className="py-4 px-6 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-2"
                >
                  {isUpdatingStatus ? <Spinner /> : <XCircle size={18} />}
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
