import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getCategoryColor } from '../../utils/helpers';
import './TaskManager.css';

const TaskManager: React.FC = () => {
  const { tasks, addTask, deleteTask, generateWeeklySchedule } = useAppContext();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', category: '', hours: 1 });

  const handleAddTask = () => {
    if (newTask.name.trim()) {
      // Ensure all required fields are included for the scheduler
      addTask({
        id: Date.now().toString(),
        name: newTask.name,
        category: newTask.category || 'Uncategorized', // Default category if none provided
        estimatedHours: newTask.hours, // This is crucial for the schedule generator
        description: '', // Add empty description to match Task interface
        color: getCategoryColor(newTask.category || 'Uncategorized'), // Use consistent color by category
        completed: false
      });
      
      setNewTask({ name: '', category: '', hours: 1 });
      setShowAddTask(false);
    }
  };

  // Handle task deletion with confirmation
  const handleDeleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Remove the task
    deleteTask(id);
  };

  // Handle enter key press for form submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  // Handle generating a schedule from tasks
  const handleGenerateSchedule = () => {
    console.log("Generating schedule with tasks:", tasks);
    generateWeeklySchedule();
  };

  // Group tasks by category
  const tasksByCategory = tasks.reduce((acc, task) => {
    const category = task.category?.toUpperCase() || 'UNCATEGORIZED';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(task);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate total hours by category
  const hoursByCategory = Object.entries(tasksByCategory).reduce((acc, [category, categoryTasks]) => {
    acc[category] = categoryTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  // Calculate total tasks and hours
  const totalTasks = tasks.length;
  const totalHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

  return (
    <div className="task-mission-dashboard">
      {/* Add Task Button */}
      <button 
        className="add-mission-button"
        onClick={() => setShowAddTask(true)}
      >
        + ADD NEW TASK
      </button>
      
      {/* Task Form */}
      {showAddTask && (
        <div className="quick-add-form">
          <input
            type="text"
            placeholder="Task name"
            value={newTask.name}
            onChange={(e) => setNewTask({...newTask, name: e.target.value})}
            className="quick-add-input"
            autoFocus
            onKeyDown={handleKeyDown}
          />
          <input
            type="text"
            placeholder="Category"
            value={newTask.category}
            onChange={(e) => setNewTask({...newTask, category: e.target.value})}
            className="quick-add-input"
            onKeyDown={handleKeyDown}
          />
          <input
            type="number"
            placeholder="Hours"
            value={newTask.hours}
            onChange={(e) => setNewTask({...newTask, hours: Number(e.target.value) || 0})}
            className="quick-add-input"
            min="0"
            onKeyDown={handleKeyDown}
          />
          <div className="quick-add-actions">
            <button onClick={() => setShowAddTask(false)} className="cancel-btn">CANCEL</button>
            <button onClick={handleAddTask} className="add-btn">ADD</button>
          </div>
        </div>
      )}
      
      {/* Task Summary */}
      <div className="mission-header">
        <div className="mission-title">TASKS</div>
        <div className="mission-progress">
          <div className="progress-text">{totalTasks} ({totalHours}h)</div>
          <button 
            className="generate-schedule-btn"
            onClick={handleGenerateSchedule}
            title="Generate a weekly schedule from your tasks"
          >
            SCHEDULE
          </button>
        </div>
      </div>
      
      {/* Task List */}
      <div className="mission-content">
        <div className="mission-list">
          {Object.entries(tasksByCategory).length > 0 ? (
            Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
              <div key={category} className="task-category-block">
                <div className="task-category-header" style={{backgroundColor: getCategoryColor(category)}}>
                  {category}
                  <span className="category-hours">
                    {categoryTasks.length} TASK{categoryTasks.length !== 1 ? 'S' : ''} - {hoursByCategory[category]}h
                  </span>
                </div>
                
                {categoryTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="mission-item task-item"
                  >
                    <div 
                      className="mission-details task-details"
                      style={{ borderLeft: `4px solid ${getCategoryColor(task.category || category)}` }}
                    >
                      <div className="mission-name">{task.name}</div>
                      <div className="task-meta">
                        <span className="task-hours">{task.estimatedHours}h</span>
                        <button 
                          className="task-remove-btn"
                          onClick={(e) => handleDeleteTask(e, task.id)}
                          title="Delete task"
                          aria-label="Delete task"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="no-missions">
              NO ACTIVE TASKS FOUND
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManager; 