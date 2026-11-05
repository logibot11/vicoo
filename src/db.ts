
import { openDB } from 'idb'

export type Priority = 'Niski' | 'Normalny' | 'Wysoki'

export type Task = {
  id: string
  title: string
  description: string
  priority: Priority
  dueDate: string
  completed: boolean
  createdAt: string
}

const database = openDB('vicoo-database', 1, {
  upgrade(db) {
    db.createObjectStore('tasks', { keyPath: 'id' })
  },
})

export async function getTasks(): Promise<Task[]> {
  const db = await database
  return db.getAll('tasks')
}

export async function saveTask(task: Task): Promise<void> {
  const db = await database
  await db.put('tasks', task)
}

export async function deleteTask(id: string): Promise<void> {
  const db = await database
  await db.delete('tasks', id)
}
