
import { useEffect, useState, type FormEvent } from 'react'
import { getTasks, saveTask, deleteTask, type Task, type Priority } from './db'
import './App.css'

type Filter = 'Wszystkie' | 'Do wykonania' | 'Wykonane'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('Normalny')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState<Filter>('Wszystkie')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTasks() {
      try {
        const savedTasks = await getTasks()
        setTasks(savedTasks)
      } catch (err) {
        console.error('Nie udało się pobrać zadań:', err)
        setError('Nie udało się wczytać zapisanych zadań.')
      } finally {
        setLoading(false)
      }
    }

    void loadTasks()
  }, [])

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    try {
      await saveTask(newTask)
      setTasks(current => [newTask, ...current])
      setTitle('')
      setDescription('')
      setPriority('Normalny')
      setDueDate('')
      setError('')
    } catch (err) {
      console.error('Nie udało się zapisać zadania:', err)
      setError('Nie udało się zapisać zadania. Spróbuj ponownie.')
    }
  }

  async function toggleTask(id: string) {
    const task = tasks.find(item => item.id === id)
    if (!task) return

    const updatedTask = { ...task, completed: !task.completed }

    try {
      await saveTask(updatedTask)
      setTasks(current =>
        current.map(item => item.id === id ? updatedTask : item)
      )
      setError('')
    } catch (err) {
      console.error('Nie udało się zmienić zadania:', err)
      setError('Nie udało się zaktualizować zadania.')
    }
  }

  async function removeTask(id: string) {
    try {
      await deleteTask(id)
      setTasks(current => current.filter(task => task.id !== id))
      setError('')
    } catch (err) {
      console.error('Nie udało się usunąć zadania:', err)
      setError('Nie udało się usunąć zadania.')
    }
  }

  const visibleTasks = tasks.filter(task => {
    if (filter === 'Do wykonania') return !task.completed
    if (filter === 'Wykonane') return task.completed
    return true
  })

  const completedCount = tasks.filter(task => task.completed).length
  const pendingCount = tasks.length - completedCount

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">V</div>
          <div>
            <h1>ViCoo</h1>
            <p>Organizacja projektu</p>
          </div>
        </div>
        <span className="project-label">Mój projekt</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">PANEL PROJEKTU</p>
        <h2>Witaj w ViCoo!</h2>
        <p>Zaplanuj zadania i miej wszystko pod kontrolą.</p>
      </section>

      <section className="stats">
        <div className="stat-card">
          <span>Wszystkie zadania</span>
          <strong>{tasks.length}</strong>
        </div>
        <div className="stat-card">
          <span>Do wykonania</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="stat-card">
          <span>Wykonane</span>
          <strong>{completedCount}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Dodaj nowe zadanie</h2>
            <p>Uzupełnij informacje o zadaniu.</p>
          </div>
        </div>

        <form className="task-form" onSubmit={handleAddTask}>
          <label>
            Nazwa zadania *
            <input
              type="text"
              placeholder="Np. Przygotować projekt aplikacji"
              value={title}
              onChange={event => setTitle(event.target.value)}
              required
            />
          </label>

          <label>
            Opis
            <textarea
              placeholder="Dodatkowe informacje..."
              value={description}
              onChange={event => setDescription(event.target.value)}
              rows={3}
            />
          </label>

          <div className="form-row">
            <label>
              Priorytet
              <select
                value={priority}
                onChange={event => setPriority(event.target.value as Priority)}
              >
                <option value="Niski">Niski</option>
                <option value="Normalny">Normalny</option>
                <option value="Wysoki">Wysoki</option>
              </select>
            </label>

            <label>
              Termin
              <input
                type="date"
                value={dueDate}
                onChange={event => setDueDate(event.target.value)}
              />
            </label>
          </div>

          <button className="primary-button" type="submit">
            + Dodaj zadanie
          </button>
        </form>
      </section>

      <section className="panel task-panel">
        <div className="section-heading">
          <div>
            <h2>Lista zadań</h2>
            <p>Twoje zadania w projekcie ViCoo.</p>
          </div>
          <span className="task-count">{tasks.length} zadań</span>
        </div>

        <div className="filters">
          {(['Wszystkie', 'Do wykonania', 'Wykonane'] as Filter[]).map(item => (
            <button
              key={item}
              type="button"
              className={filter === item ? 'filter-button active' : 'filter-button'}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="task-list">
          {loading ? (
            <p>Wczytywanie zadań...</p>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>Brak zadań</h3>
              <p>
                {filter === 'Wszystkie'
                  ? 'Dodaj pierwsze zadanie do swojego projektu.'
                  : 'W tej kategorii nie ma jeszcze zadań.'}
              </p>
            </div>
          ) : (
            visibleTasks.map(task => (
              <article
                className={task.completed ? 'task-card completed' : 'task-card'}
                key={task.id}
              >
                <button
                  type="button"
                  className={task.completed ? 'check-button checked' : 'check-button'}
                  onClick={() => void toggleTask(task.id)}
                  aria-label={task.completed ? 'Oznacz jako niewykonane' : 'Oznacz jako wykonane'}
                >
                  {task.completed ? '✓' : ''}
                </button>

                <div className="task-content">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-meta">
                    <span className={`priority priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && <span>Termin: {task.dueDate}</span>}
                    {task.completed && <span>Wykonane</span>}
                  </div>
                </div>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => void removeTask(task.id)}
                  aria-label="Usuń zadanie"
                  title="Usuń zadanie"
                >
                  ×
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      {error && <p role="alert">{error}</p>}

      <footer className="footer">
        ViCoo · Organizacja projektu
      </footer>
    </main>
  )
}

export default App
