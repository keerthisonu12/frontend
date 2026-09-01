import { useState } from 'react'
import './App.css'

const BACKEND_URL = 'https://backend-w8lr.onrender.com'

function App() {
  const [page, setPage] = useState('home')
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [message, setMessage] = useState('')

  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [comments, setComments] = useState([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [commentText, setCommentText] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    city: '',
    state: '',
    country: '',
  })

  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_user_id: '',
    due_date: '',
    priority: 'Medium',
    status: 'To Do',
    progress: 0,
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleTaskChange = (e) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value,
    })
  }

  const loadUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/users`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.log('Could not load users')
    }
  }

  const loadTasks = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/tasks`)

      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      setMessage('Could not load tasks')
    }
  }

  const loadComments = async (taskId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/comments/${taskId}`)

      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      setComments([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (isForgotPassword) {
      if (!form.email) {
        setMessage('Email is required')
        return
      }

      if (!form.email.includes('@')) {
        setMessage('Please enter a valid email')
        return
      }

      try {
        const response = await fetch(
          `${BACKEND_URL}/forgot-password`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: form.email,
            }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setMessage(data.detail || 'Something went wrong')
          return
        }

        setMessage(data.message)
        setResetToken(data.token)
        setIsForgotPassword(false)
        setIsResetPassword(true)
      } catch (error) {
        setMessage('Backend connection failed')
      }

      return
    }

    if (isResetPassword) {
      if (!newPassword) {
        setMessage('New password is required')
        return
      }

      try {
        const response = await fetch(
          `${BACKEND_URL}/reset-password`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: resetToken,
              new_password: newPassword,
            }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setMessage(data.detail || 'Something went wrong')
          return
        }

        setMessage(data.message)
        setIsResetPassword(false)
        setIsLogin(true)
        setNewPassword('')
        setResetToken('')
      } catch (error) {
        setMessage('Backend connection failed')
      }

      return
    }

    if (isLogin) {
      if (!form.email || !form.password) {
        setMessage('Email and password are required')
        return
      }
    } else {
      const fields = [
        'name',
        'email',
        'password',
        'phone_number',
        'city',
        'state',
        'country',
      ]

      for (const field of fields) {
        if (!form[field]) {
          setMessage(`${field.replace('_', ' ')} is required`)
          return
        }
      }
    }

    if (!form.email.includes('@')) {
      setMessage('Please enter a valid email')
      return
    }

    try {
      const endpoint = isLogin
        ? `${BACKEND_URL}/login`
        : `${BACKEND_URL}/signup`

      const body = isLogin
        ? {
            email: form.email,
            password: form.password,
          }
        : form

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || 'Something went wrong')
        return
      }

      if (isLogin) {
        setCurrentUser(data)
        setIsLoggedIn(true)
        setPage('dashboard')
        setMessage('')

        loadTasks()
        loadUsers()
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('Backend connection failed')
    }
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (
      !taskForm.title ||
      !taskForm.description ||
      !taskForm.assigned_user_id ||
      !taskForm.due_date
    ) {
      setMessage('Please fill all task fields')
      return
    }

    try {
      const url = editingTask
        ? `${BACKEND_URL}/tasks/${editingTask.id}`
        : `${BACKEND_URL}/tasks`

      const method = editingTask ? 'PUT' : 'POST'

      const body = editingTask
        ? taskForm
        : {
            title: taskForm.title,
            description: taskForm.description,
            assigned_user_id: Number(taskForm.assigned_user_id),
            due_date: taskForm.due_date,
            priority: taskForm.priority,
          }

      if (editingTask) {
        body.assigned_user_id = Number(body.assigned_user_id)
        body.progress = Number(body.progress)
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || 'Could not save task')
        return
      }

      setMessage(
        editingTask
          ? 'Task updated successfully'
          : 'Task created successfully'
      )

      setShowTaskForm(false)
      setEditingTask(null)

      setTaskForm({
        title: '',
        description: '',
        assigned_user_id: '',
        due_date: '',
        priority: 'Medium',
        status: 'To Do',
        progress: 0,
      })

      loadTasks()
    } catch (error) {
      setMessage('Backend connection failed')
    }
  }

  const editTask = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description,
      assigned_user_id: task.assigned_user_id,
      due_date: task.due_date
        ? task.due_date.slice(0, 16)
        : '',
      priority: task.priority,
      status: task.status,
      progress: task.progress || 0,
    })
    setShowTaskForm(true)
    setMessage('')
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) {
      return
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/tasks/${taskId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        loadTasks()
        setMessage('Task deleted successfully')
      }
    } catch (error) {
      setMessage('Could not delete task')
    }
  }

  const openComments = (task) => {
    setSelectedTask(task)
    setCommentText('')
    loadComments(task.id)
  }

  const addComment = async () => {
    if (!commentText.trim() || !selectedTask || !currentUser) {
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: selectedTask.id,
          user_id: currentUser.user_id,
          comment: commentText,
        }),
      })

      if (response.ok) {
        setCommentText('')
        loadComments(selectedTask.id)
      }
    } catch (error) {
      setMessage('Could not add comment')
    }
  }

  const openLogin = () => {
    setIsLogin(true)
    setIsForgotPassword(false)
    setIsResetPassword(false)
    setMessage('')
    setPage('auth')
  }

  const openSignup = () => {
    setIsLogin(false)
    setIsForgotPassword(false)
    setIsResetPassword(false)
    setMessage('')
    setPage('auth')
  }

  const logout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setPage('home')
    setIsLogin(true)
    setTasks([])
    setUsers([])
    setMessage('')
  }

  if (page === 'home' && !isLoggedIn) {
    return (
      <div className="home-page">
        <nav className="navbar">
          <div className="logo">✓ TaskFlow</div>

          <div className="nav-buttons">
            <button className="nav-login" onClick={openLogin}>
              Login
            </button>

            <button className="nav-signup" onClick={openSignup}>
              Sign Up
            </button>
          </div>
        </nav>

        <main className="hero">
          <p className="hero-label">SHARED TASK MANAGEMENT</p>

          <h1>
            Organize Tasks.
            <br />
            <span>Collaborate Better.</span>
          </h1>

          <p className="hero-description">
            A simple shared workspace to create, assign, manage and track
            tasks with your team.
          </p>

          <div className="hero-buttons">
            <button className="primary-button" onClick={openSignup}>
              Get Started →
            </button>

            <button className="secondary-button" onClick={openLogin}>
              Login
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (isForgotPassword) {
    return (
      <div className="auth-container">
        <h1>Forgot Password</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
          />

          <button type="submit">Send Reset Link</button>
        </form>

        <button
          className="switch-button"
          onClick={() => {
            setIsForgotPassword(false)
            setIsLogin(true)
            setMessage('')
          }}
        >
          Back to Login
        </button>

        {message && <p className="message">{message}</p>}
      </div>
    )
  }

  if (isResetPassword) {
    return (
      <div className="auth-container">
        <h1>Reset Password</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button type="submit">Reset Password</button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    )
  }

  if (page === 'dashboard' && isLoggedIn) {
    const todoTasks = tasks.filter(
      (task) => task.status === 'To Do'
    )

    const progressTasks = tasks.filter(
      (task) => task.status === 'In Progress'
    )

    const completedTasks = tasks.filter(
      (task) => task.status === 'Completed'
    )

    const renderTask = (task) => (
      <div className="task-card" key={task.id}>
        <div className="task-card-top">
          <h3>{task.title}</h3>

          <span className={`priority ${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>

        <p>{task.description}</p>

        <div className="task-info">
          <span>
            📅 {task.due_date
              ? new Date(task.due_date).toLocaleDateString()
              : 'No date'}
          </span>

          <span>📊 {task.progress || 0}%</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${task.progress || 0}%`,
            }}
          />
        </div>

        <div className="task-actions">
          <button onClick={() => editTask(task)}>
            Edit
          </button>

          <button onClick={() => openComments(task)}>
            💬 Comments
          </button>

          <button
            className="delete-button"
            onClick={() => deleteTask(task.id)}
          >
            Delete
          </button>
        </div>
      </div>
    )

    return (
      <div className="dashboard-page">
        <nav className="navbar">
          <div className="logo">✓ TaskFlow</div>

          <div className="dashboard-user">
            <span>
              Hi, {currentUser?.name || 'User'}
            </span>

            <button className="nav-signup" onClick={logout}>
              Logout
            </button>
          </div>
        </nav>

        <main className="dashboard">
          <div className="dashboard-header">
            <div>
              <p className="hero-label">YOUR WORKSPACE</p>
              <h1>Task Dashboard</h1>
              <p>Manage and track your team's tasks.</p>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                setEditingTask(null)
                setTaskForm({
                  title: '',
                  description: '',
                  assigned_user_id: '',
                  due_date: '',
                  priority: 'Medium',
                  status: 'To Do',
                  progress: 0,
                })
                setShowTaskForm(true)
                setMessage('')
              }}
            >
              + Create Task
            </button>
          </div>

          {message && <p className="message">{message}</p>}

          {showTaskForm && (
            <div className="task-form-card">
              <div className="form-header">
                <h2>
                  {editingTask ? 'Edit Task' : 'Create Task'}
                </h2>

                <button
                  className="close-button"
                  onClick={() => {
                    setShowTaskForm(false)
                    setEditingTask(null)
                  }}
                >
                  ×
                </button>
              </div>

              <form
                className="task-form"
                onSubmit={handleTaskSubmit}
              >
                <input
                  name="title"
                  placeholder="Task Title"
                  value={taskForm.title}
                  onChange={handleTaskChange}
                />

                <textarea
                  name="description"
                  placeholder="Description"
                  value={taskForm.description}
                  onChange={handleTaskChange}
                />

                <select
                  name="assigned_user_id"
                  value={taskForm.assigned_user_id}
                  onChange={handleTaskChange}
                >
                  <option value="">Assign to user</option>

                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>

                <input
                  name="due_date"
                  type="datetime-local"
                  value={taskForm.due_date}
                  onChange={handleTaskChange}
                />

                <select
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleTaskChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                {editingTask && (
                  <>
                    <select
                      name="status"
                      value={taskForm.status}
                      onChange={handleTaskChange}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">
                        In Progress
                      </option>
                      <option value="Completed">
                        Completed
                      </option>
                    </select>

                    <label>
                      Progress: {taskForm.progress}%
                    </label>

                    <input
                      name="progress"
                      type="range"
                      min="0"
                      max="100"
                      value={taskForm.progress}
                      onChange={handleTaskChange}
                    />
                  </>
                )}

                <button className="primary-button" type="submit">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </form>
            </div>
          )}

          <div className="task-columns">
            <section className="task-column">
              <div className="column-header">
                <h2>To Do</h2>
                <span>{todoTasks.length}</span>
              </div>

              {todoTasks.length === 0 ? (
                <p className="empty-text">No tasks</p>
              ) : (
                todoTasks.map(renderTask)
              )}
            </section>

            <section className="task-column">
              <div className="column-header">
                <h2>In Progress</h2>
                <span>{progressTasks.length}</span>
              </div>

              {progressTasks.length === 0 ? (
                <p className="empty-text">No tasks</p>
              ) : (
                progressTasks.map(renderTask)
              )}
            </section>

            <section className="task-column">
              <div className="column-header">
                <h2>Completed</h2>
                <span>{completedTasks.length}</span>
              </div>

              {completedTasks.length === 0 ? (
                <p className="empty-text">No tasks</p>
              ) : (
                completedTasks.map(renderTask)
              )}
            </section>
          </div>
        </main>

        {selectedTask && (
          <div className="modal-overlay">
            <div className="comment-modal">
              <div className="form-header">
                <h2>Comments</h2>

                <button
                  className="close-button"
                  onClick={() => setSelectedTask(null)}
                >
                  ×
                </button>
              </div>

              <h3>{selectedTask.title}</h3>

              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="empty-text">
                    No comments yet.
                  </p>
                ) : (
                  comments.map((item) => (
                    <div className="comment-item" key={item.id}>
                      <p>{item.comment}</p>
                      <small>
                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleString()
                          : ''}
                      </small>
                    </div>
                  ))
                )}
              </div>

              <div className="comment-input">
                <textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(e.target.value)
                  }
                />

                <button
                  className="primary-button"
                  onClick={addComment}
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="auth-container">
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="phone_number"
              placeholder="Phone Number"
              value={form.phone_number}
              onChange={handleChange}
            />

            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
            />

            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
            />

            <input
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
            />
          </>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      {isLogin && (
        <button
          className="switch-button"
          onClick={() => {
            setIsForgotPassword(true)
            setMessage('')
          }}
        >
          Forgot Password?
        </button>
      )}

      <button
        className="switch-button"
        onClick={() => {
          setIsLogin(!isLogin)
          setMessage('')
        }}
      >
        {isLogin
          ? 'Create a new account'
          : 'Already have an account? Login'}
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  )
}

export default App