import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { format, parseISO, isToday } from 'date-fns';
import { getDateFromDayOfWeek, convertToAppDayOfWeek } from '../../utils/helpers';
import WeekView from './WeekView';
import './Calendar.css';

// Define interfaces for our data - expanded to match what might be in the actual data
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

// For typechecking tasks
interface Task {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  duration?: number;
  estimatedHours?: number;
  color?: string;
}

// Digital Clock Component
const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Clear interval on component unmount
    return () => clearInterval(timer);
  }, []);
  
  // Get hours in 12-hour format
  const hours = time.getHours() % 12 || 12;
  
  // Get minutes with leading zero if needed
  const minutes = time.getMinutes().toString().padStart(2, '0');
  
  // Get seconds with leading zero if needed
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  // AM or PM
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM';
  
  return (
    <div className="digital-clock">
      <div className="clock-display">
        <span className="clock-time">{hours}:{minutes}:{seconds}</span>
        <span className="clock-ampm">{ampm}</span>
      </div>
    </div>
  );
};

const Calendar: React.FC = () => {
  const { generateWeeklySchedule, tasks, currentSchedule } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mappedSchedule, setMappedSchedule] = useState<ScheduleItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Process the schedule data whenever currentSchedule changes
  useEffect(() => {
    if (currentSchedule) {
      console.log("Processing schedule data:", currentSchedule);
    }
    setMappedSchedule(getScheduledTasks());
  }, [currentSchedule]);
  
  // Add keyboard shortcut for schedule generation (Ctrl+G)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl+G is pressed
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault(); // Prevent default browser behavior
        generateWeeklySchedule();
      }
    };
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [generateWeeklySchedule]);
  
  const handleGenerateSchedule = () => {
    // Call generate schedule without arguments since it's not expecting any
    generateWeeklySchedule();
  };
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get the scheduled tasks safely - improved to handle different formats
  const getScheduledTasks = (): ScheduleItem[] => {
    console.log("Current schedule:", currentSchedule); // Debug log
    
    if (!currentSchedule) return [];
    
    // If currentSchedule is an array, return it directly
    if (Array.isArray(currentSchedule)) {
      return currentSchedule as ScheduleItem[];
    }
    
    // Safely type check and handle scheduledTasks
    const schedule = currentSchedule as any; // Use any to bypass type checking temporarily
    
    // If it has a scheduledTasks property that's an array, return that
    if (schedule.scheduledTasks && Array.isArray(schedule.scheduledTasks)) {
      // Map the scheduled tasks to our expected format with consistent date handling
      return schedule.scheduledTasks.map((task: any): ScheduleItem => {
        // Convert from possible dayOfWeek format to actual date
        if (task.dayOfWeek !== undefined && task.date === undefined) {
          const date = getDateFromDayOfWeek(task.dayOfWeek);
          
          return {
            ...task,
            date,
            time: task.startHour !== undefined ? 
              `${task.startHour}:00 - ${task.endHour}:00` : undefined
          };
        }
        
        return task;
      });
    }
    
    // If it has a startDate and endDate properties, it's the old format
    if (schedule.startDate && schedule.endDate && 
        Array.isArray(schedule.scheduledTasks)) {
      return schedule.scheduledTasks.map((task: any): ScheduleItem => ({
        taskId: task.id,
        date: getDateFromDayOfWeek(task.dayOfWeek),
        time: task.startHour !== undefined ? 
          `${task.startHour}:00 - ${task.endHour}:00` : undefined
      }));
    }
    
    // Otherwise return an empty array
    return [];
  };
  
  // Find scheduled tasks for the selected date
  const tasksForSelectedDate = mappedSchedule
    .filter(item => item.date === selectedDate)
    .sort((a, b) => {
      // Sort by startHour if available
      if (a.startHour !== undefined && b.startHour !== undefined) {
        return a.startHour - b.startHour;
      }
      
      // If startHour is not available, try to extract time from the time string
      if (a.time && b.time) {
        const aStartMatch = a.time.match(/^(\d+):00/);
        const bStartMatch = b.time.match(/^(\d+):00/);
        
        if (aStartMatch && bStartMatch) {
          return parseInt(aStartMatch[1]) - parseInt(bStartMatch[1]);
        }
      }
      
      // If we can't determine order, keep original order
      return 0;
    });
  
  // Get day name for display
  const getDayName = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'EEEE');
    } catch (error) {
      return '';
    }
  };
  
  // Check if a task is currently active
  const isCurrentTask = (scheduleItem: ScheduleItem): boolean => {
    // Only consider tasks for today
    const isTaskToday = scheduleItem.date === format(new Date(), 'yyyy-MM-dd');
    
    if (!isTaskToday || scheduleItem.startHour === undefined || scheduleItem.endHour === undefined) {
      return false;
    }
    
    const currentHour = currentTime.getHours();
    return currentHour >= scheduleItem.startHour && currentHour < scheduleItem.endHour;
  };
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-date-display">
          {getDayName(selectedDate)} <span className="date-highlight">{format(parseISO(selectedDate), 'MM/dd/yyyy')}</span>
        </div>
        
        {/* Simplified clock container with only the clock */}
        <div className="calendar-clock-container">
          <DigitalClock />
        </div>
      </div>
      
      <div className="calendar-content">
        <WeekView
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          schedule={mappedSchedule}
        />
        
        <div className="daily-schedule">
          <h3 className="daily-schedule-header">TASKS FOR {getDayName(selectedDate).toUpperCase()}</h3>
          
          {tasksForSelectedDate.length > 0 ? (
            <div className="daily-tasks">
              <div className="time-blocks">
                {tasksForSelectedDate.map((scheduleItem, index) => {
                  // Check if this is the current active task
                  const isActive = isCurrentTask(scheduleItem);
                  
                  // Set a default start time display value
                  const startTimeDisplay = scheduleItem.startHour !== undefined 
                    ? `${scheduleItem.startHour}:00` 
                    : (scheduleItem.time ? scheduleItem.time.split('-')[0].trim() : 'Anytime');
                  
                  // Set a default end time display value
                  const endTimeDisplay = scheduleItem.endHour !== undefined 
                    ? `${scheduleItem.endHour}:00` 
                    : (scheduleItem.time ? scheduleItem.time.split('-')[1]?.trim() : '');
                  
                  // Calculate duration in minutes for display
                  const durationMinutes = scheduleItem.endHour !== undefined && scheduleItem.startHour !== undefined
                    ? (scheduleItem.endHour - scheduleItem.startHour) * 60
                    : 30;
                  
                  // Use the item directly if it has all the needed properties
                  if (scheduleItem.name && scheduleItem.category) {
                    return (
                      <div 
                        key={index} 
                        className={`daily-task-item ${isActive ? 'current-time' : ''}`}
                        // Add a data attribute to help with potential future styling based on time
                        data-start-hour={scheduleItem.startHour}
                        data-end-hour={scheduleItem.endHour}
                      >
                        <div className="task-time-block">
                          <div className="task-start-time">{startTimeDisplay}</div>
                          {endTimeDisplay && <div className="task-end-time">- {endTimeDisplay}</div>}
                        </div>
                        <div className="task-details">
                          <div className="task-title">
                            {scheduleItem.name || 'Untitled Task'}
                          </div>
                          <div className="task-category">
                            <span className={`category-badge category-${scheduleItem.category.toLowerCase()}`}>
                              {scheduleItem.category}
                            </span>
            </div>
          </div>
                        <div className="task-duration">{durationMinutes} min</div>
                      </div>
                    );
                  }
                  
                  // Otherwise find the matching task
                  const matchingTask = tasks.find(t => t.id === scheduleItem.taskId) as Task | undefined;
                  
                  if (!matchingTask) return null;
                  
                  return (
                    <div 
                      key={index} 
                      className={`daily-task-item ${isActive ? 'current-time' : ''}`}
                      data-start-hour={scheduleItem.startHour}
                      data-end-hour={scheduleItem.endHour}
                    >
                      <div className="task-time-block">
                        <div className="task-start-time">{startTimeDisplay}</div>
                        {endTimeDisplay && <div className="task-end-time">- {endTimeDisplay}</div>}
                      </div>
                      <div className="task-details">
                        <div className="task-title">
                          {matchingTask.name || matchingTask.title || 'Untitled Task'}
                        </div>
                        <div className="task-category">
                          <span className={`category-badge category-${matchingTask.category?.toLowerCase() || 'default'}`}>
                            {matchingTask.category || 'Uncategorized'}
                          </span>
                        </div>
                      </div>
                      <div className="task-duration">{matchingTask.duration || durationMinutes} min</div>
          </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="no-tasks-message">
              No tasks scheduled for {getDayName(selectedDate)}. 
              {tasks.length > 0 ? (
                <p>Press Ctrl+G to generate a weekly schedule from your tasks.</p>
              ) : (
                <p>Add tasks in the Task Manager first, then press Ctrl+G to generate a schedule.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar; 