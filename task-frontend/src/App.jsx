import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskEdit from './components/TaskEdit';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <h1>任务管理系统</h1>
          <div className="nav-links">
            <Link to="/">任务列表</Link>
            <Link to="/create">创建任务</Link>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<TaskList />} />
            <Route path="/create" element={<TaskForm />} />
            <Route path="/edit/:id" element={<TaskEdit />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
