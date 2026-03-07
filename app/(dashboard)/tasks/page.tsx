import { TaskList } from "@/components/tasks/TaskList"

export default function TasksPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Görevler</h1>
        <p className="text-muted-foreground text-sm mt-1">Bugün ne tamamlamak istiyorsun?</p>
      </div>
      <TaskList />
    </div>
  )
}
