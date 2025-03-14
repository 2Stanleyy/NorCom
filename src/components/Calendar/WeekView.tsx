import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { format, addDays, isToday, parseISO } from 'date-fns';
import './Calendar.css';

// Define interfaces for our data to match Calendar component
interface ScheduleItem {
  taskId: string;
  date?: string;
  time?: string;
  id?: string;
  dayOfWeek?: number;
  startHour?: number;
  endHour?: number;
  name?: string;
  category?: string;
  color?: string;
}

interface WeekViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  schedule: ScheduleItem[];
}

const WeekView: React.FC<WeekViewProps> = ({ selectedDate, onSelectDate, schedule }) => {
  const { tasks } = useAppContext();
  
  // Generate dates for the current week, starting from Monday
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), then it's 6 days from Monday, otherwise subtract 1
  
  const mondayOfCurrentWeek = new Date(today);
  mondayOfCurrentWeek.setDate(today.getDate() - diff);
  
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    return addDays(mondayOfCurrentWeek, i);
  });
  
  // Modify the task display logic to show all tasks
  const renderTasks = (tasks: ScheduleItem[]) => {
    return tasks.map((task: ScheduleItem, index: number) => (
      <div key={index} className="task-dot" style={{ backgroundColor: task.color }}></div>
    ));
  };

  return (
    <div className="week-view">
      {weekDates.map((date, index) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const isSelectedDate = selectedDate === dateString;
        const isTodayDate = isToday(date);
        
        // Find tasks scheduled for this day
        const tasksForDay = schedule.filter(item => 
          item.date === dateString
        );
        
        // Count tasks by category
        const taskCategories = tasksForDay.reduce((acc: Record<string, number>, item) => {
          // Use item's category if available
          if (item.category) {
            const category = item.category.toLowerCase();
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }
          
          // Otherwise look up the task by ID
          const task = tasks.find(t => t.id === item.taskId);
          if (task && task.category) {
            const category = task.category.toLowerCase();
            acc[category] = (acc[category] || 0) + 1;
          }
          return acc;
        }, {});
        
        return (
          <div 
            key={index}
            className={`day-cell ${isSelectedDate ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
            onClick={() => onSelectDate(dateString)}
          >
            <div className="day-header">
              {format(date, 'EEE')}
            </div>
            
            <div className="day-date">
              {format(date, 'd')}
            </div>
            
            <div className="day-content">
              {tasksForDay.length > 0 && (
                <div className="tasks-indicator">
                  {tasksForDay.length} {tasksForDay.length === 1 ? 'task' : 'tasks'}
                </div>
              )}
              <div className="task-dots">
                {renderTasks(tasksForDay)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekView; 