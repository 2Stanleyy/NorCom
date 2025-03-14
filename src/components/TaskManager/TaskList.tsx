import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { getCategoryColor } from '../../utils/helpers';
import './TaskManager.css';

const TaskList: React.FC = () => {
  const { tasks, deleteTask } = useAppContext();

  if (tasks.length === 0) {
    return (
      <div className="empty-task-list">
        <p>No tasks added yet. Add your first task to get started!</p>
      </div>
    );
  }

  // Group tasks by category
  const tasksByCategory: Record<string, typeof tasks> = {};
  tasks.forEach(task => {
    if (!tasksByCategory[task.category]) {
      tasksByCategory[task.category] = [];
    }
    tasksByCategory[task.category].push(task);
  });

  // Get categories sorted alphabetically
  const categories = Object.keys(tasksByCategory).sort();

  return (
    <div className="task-list">
      {categories.map(category => (
        <div key={category} className="category-section">
          <div 
            className="category-header"
            style={{ backgroundColor: getCategoryColor(category) }}
          >
            <h4>{category}</h4>
            <span className="category-task-count">
              {tasksByCategory[category].length} task(s) - 
              {tasksByCategory[category].reduce((sum, task) => sum + task.estimatedHours, 0)} hours
            </span>
          </div>
          
          <div className="task-grid">
            {tasksByCategory[category].map(task => (
              <div 
                key={task.id} 
                className="task-card"
                style={{ borderLeft: `5px solid ${getCategoryColor(category)}` }}
              >
                <div className="task-header">
                  <h4>{task.name}</h4>
                </div>
                
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-footer">
                  <span className="task-hours">{task.estimatedHours} hour{task.estimatedHours !== 1 ? 's' : ''}</span>
                  <button 
                    className="delete-task-button"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList; 