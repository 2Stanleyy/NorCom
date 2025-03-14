import React, { useState } from 'react';
import { Task } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { generateId, getCategoryColor } from '../../utils/helpers';
import './TaskManager.css';

const TaskForm: React.FC = () => {
  const { addTask } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !category.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    const categoryName = category.trim();
    
    const newTask: Task = {
      id: generateId(),
      name: name.trim(),
      description: description.trim(),
      category: categoryName,
      color: getCategoryColor(categoryName),
      estimatedHours
    };
    
    addTask(newTask);
    
    // Reset form
    setName('');
    setDescription('');
    setCategory('');
    setEstimatedHours(1);
    setShowForm(false);
  };

  return (
    <div className="task-form-container">
      {!showForm ? (
        <button 
          className="add-task-button"
          onClick={() => setShowForm(true)}
        >
          + Add New Task
        </button>
      ) : (
        <form className="task-form" onSubmit={handleSubmit}>
          <h3>Add New Task</h3>
          
          <div className="form-group">
            <label htmlFor="name">Task Name*</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Running, Study, Work"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this task involve?"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category*</label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="E.g., Fitness, Work, Hobby"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="hours">Estimated Hours</label>
            <input
              type="number"
              id="hours"
              min="0.5"
              max="24"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add Task
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskForm; 