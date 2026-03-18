import TaskList from "@/components/features/tasks/TaskList";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Task Management</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Assign and track field work for staff</p>
      </div>
      <TaskList />
    </div>
  );
}
