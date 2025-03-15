import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  getCategoryColor, 
  generateId, 
  formatTime, 
  getDateFromDayOfWeek,
  convertToAppDayOfWeek
} from '../../utils/helpers';
import { Mission, ScheduledTask } from '../../types';
import { format, parseISO, isSameDay } from 'date-fns';
import './CurrentMission.css';

// Define interface for schedule items if not already imported
interface ScheduleItem extends ScheduledTask {
  date?: string;
  time?: string;
  calculatedDayOfWeek?: number;
}

const CurrentMission: React.FC = () => {
  const { tasks, currentSchedule, completeTask, gainXP } = useAppContext();
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Mission[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [currentScheduledMission, setCurrentScheduledMission] = useState<{
    type: 'current' | 'upcoming' | 'none';
    task?: ScheduleItem;
    timeUntil?: string;
  }>({ type: 'none' });
  
  // Add a ref to store completed mission IDs to prevent XP exploits
  const completedMissionsRef = useRef<Set<string>>(new Set());

  // Get the correct schedule data - matching Calendar component's approach exactly
  const getScheduledTasks = (): ScheduleItem[] => {
    console.log("Current schedule in CurrentMission:", currentSchedule); // Debug log
    
    if (!currentSchedule) return [];
    
    // If currentSchedule is an array, return it directly
    if (Array.isArray(currentSchedule)) {
      return currentSchedule as ScheduleItem[];
    }
    
    // If it has a scheduledTasks property that's an array, return that
    if (currentSchedule.scheduledTasks && Array.isArray(currentSchedule.scheduledTasks)) {
      // Map the scheduled tasks to our expected format with consistent date handling
      const mappedTasks = (currentSchedule.scheduledTasks as ScheduledTask[]).map((task: ScheduledTask): ScheduleItem => {
        // Convert from possible dayOfWeek format to actual date
        if (task.dayOfWeek !== undefined && (task as ScheduleItem).date === undefined) {
          const date = getDateFromDayOfWeek(task.dayOfWeek);
          
          return {
            ...task,
            date,
            time: task.startHour !== undefined ? 
              `${task.startHour}:00 - ${task.endHour}:00` : undefined
          };
        }
        
        return task as ScheduleItem;
      });
      
      console.log("Mapped scheduled tasks:", mappedTasks);
      return mappedTasks;
    }
    
    // If it has a startDate and endDate properties, it's the old format
    if (currentSchedule.startDate && currentSchedule.endDate && 
        Array.isArray(currentSchedule.scheduledTasks)) {
      const mappedTasks = (currentSchedule.scheduledTasks as ScheduledTask[]).map((task: ScheduledTask): ScheduleItem => ({
        ...task,
        date: getDateFromDayOfWeek(task.dayOfWeek),
        time: task.startHour !== undefined ? 
          `${task.startHour}:00 - ${task.endHour}:00` : undefined
      }));
      
      console.log("Mapped tasks from old format:", mappedTasks);
      return mappedTasks;
    }
    
    // Otherwise return an empty array
    return [];
  };

  // Improved check for current scheduled task from calendar
  useEffect(() => {
    const checkCurrentScheduledMission = () => {
      if (!currentSchedule) {
        setCurrentScheduledMission({ type: 'none' });
        return;
      }
      
      // Get current time
      const now = new Date();
      const currentJsDayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      const currentAppDayOfWeek = convertToAppDayOfWeek(currentJsDayOfWeek); // Convert to 0 = Monday
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      console.log("Current time:", now);
      console.log("Current hour:", currentHour);
      console.log("Current day of week (JS):", currentJsDayOfWeek);
      console.log("Current day of week (App):", currentAppDayOfWeek);
      
      // Get the processed schedule data using the same approach as Calendar
      const scheduledTasks = getScheduledTasks();
      
      // Calculate today's date string for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize time for date comparison
      const todayString = format(today, 'yyyy-MM-dd');
      
      console.log("Today's date:", todayString);
      
      // Enhanced debug logging for all tasks
      scheduledTasks.forEach((task, index) => {
        console.log(`Task ${index + 1}:`, {
          id: task.id,
          name: task.name,
          date: task.date,
          dayOfWeek: task.dayOfWeek,
          startHour: task.startHour,
          endHour: task.endHour,
          isMatchingToday: task.date === todayString || task.dayOfWeek === currentAppDayOfWeek,
          isCurrentTask: 
            (task.date === todayString || task.dayOfWeek === currentAppDayOfWeek) && 
            task.startHour <= currentHour && 
            task.endHour > currentHour
        });
      });
      
      // Find current task - use both dayOfWeek check and direct date comparison for robustness
      const currentTask = scheduledTasks.find(task => {
        // Check if the task is for today
        const isTaskForToday = 
          (task.date && task.date === todayString) || // Using direct date match
          (!task.date && task.dayOfWeek === currentAppDayOfWeek); // Using dayOfWeek
        
        // Check if the current time is within the task's time range
        const isCurrentTimeInRange = 
          task.startHour <= currentHour && 
          task.endHour > currentHour;
        
        return isTaskForToday && isCurrentTimeInRange;
      });
      
      if (currentTask) {
        console.log("Found current task:", currentTask);
        // We have a current task
        setCurrentScheduledMission({
          type: 'current',
          task: currentTask
        });
        return;
      }
      
      // Find next upcoming task (today)
      const upcomingTodayTasks = scheduledTasks
        .filter(task => {
          // Check if the task is for today
          const isTaskForToday = 
            (task.date && task.date === todayString) || // Using direct date match
            (!task.date && task.dayOfWeek === currentAppDayOfWeek); // Using dayOfWeek
          
          // Check if the task starts later today
          const isStartingLater = task.startHour > currentHour;
          
          return isTaskForToday && isStartingLater;
        })
        .sort((a, b) => a.startHour - b.startHour);
      
      console.log("Upcoming today tasks:", upcomingTodayTasks);
      
      if (upcomingTodayTasks.length > 0) {
        const nextTask = upcomingTodayTasks[0];
        const hoursUntil = nextTask.startHour - currentHour;
        const minutesUntil = 60 - currentMinute;
        
        let timeUntil = '';
        if (hoursUntil === 0) {
          timeUntil = `${minutesUntil} minutes`;
        } else if (hoursUntil === 1 && minutesUntil === 60) {
          timeUntil = `${hoursUntil} hour`;
        } else {
          timeUntil = `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''} ${minutesUntil < 60 ? `and ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}` : ''}`;
        }
        
        console.log("Found upcoming task today:", nextTask, "Time until:", timeUntil);
        
        setCurrentScheduledMission({
          type: 'upcoming',
          task: nextTask,
          timeUntil
        });
        return;
      }
      
      // Find next upcoming task (future days)
      // We'll check both dayOfWeek and explicit dates
      const futureTasks = scheduledTasks
        .filter(task => {
          // Skip tasks for today (we already checked them)
          if ((task.date && task.date === todayString) || 
              (!task.date && task.dayOfWeek === currentAppDayOfWeek)) {
            return false;
          }
          
          // If task has a date, check if it's in the future
          if (task.date) {
            const taskDate = parseISO(task.date);
            return taskDate > today;
          }
          
          // Otherwise, use dayOfWeek
          return true; // Include all future days
        })
        .map(task => {
          // Calculate the number of days until this task
          let daysUntil: number;
          
          if (task.date) {
            // For tasks with explicit dates
            const taskDate = parseISO(task.date);
            const diffTime = taskDate.getTime() - today.getTime();
            daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          } else {
            // For tasks with dayOfWeek
            let dayDiff = task.dayOfWeek - currentAppDayOfWeek;
            if (dayDiff <= 0) dayDiff += 7; // Wrap around to next week
            daysUntil = dayDiff;
          }
          
          return { ...task, daysUntil };
        })
        .sort((a, b) => {
          // First sort by days until
          if (a.daysUntil !== b.daysUntil) {
            return a.daysUntil - b.daysUntil;
          }
          // If same day, sort by start hour
          return a.startHour - b.startHour;
        });
      
      console.log("Future tasks:", futureTasks);
      
      if (futureTasks.length > 0) {
        const nextTask = futureTasks[0];
        const daysUntil = nextTask.daysUntil;
        
        console.log("Found upcoming future task:", nextTask, "Days until:", daysUntil);
        
        // Calculate the actual future date for display
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + daysUntil);
        const futureDayOfWeek = futureDate.getDay(); // 0 = Sunday in JavaScript
        
        setCurrentScheduledMission({
          type: 'upcoming',
          task: {
            ...nextTask,
            calculatedDayOfWeek: futureDayOfWeek // Add this property for display purposes
          },
          timeUntil: `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`
        });
        return;
      }
      
      // No tasks found
      console.log("No current or upcoming tasks found");
      setCurrentScheduledMission({ type: 'none' });
    };
    
    // Check current scheduled mission immediately and then every minute
    checkCurrentScheduledMission();
    const interval = setInterval(checkCurrentScheduledMission, 60000);
    
    return () => clearInterval(interval);
  }, [currentSchedule]);
  
  // Generate daily/weekly missions
  useEffect(() => {
    const generateMissions = () => {
      const today = new Date();
      
      // Set expiration dates
      const dailyExpiration = new Date(today);
      dailyExpiration.setDate(dailyExpiration.getDate() + 1);
      const dailyExpirationStr = dailyExpiration.toISOString().split('T')[0];
      
      const weeklyExpiration = new Date(today);
      weeklyExpiration.setDate(weeklyExpiration.getDate() + 7);
      const weeklyExpirationStr = weeklyExpiration.toISOString().split('T')[0];
      
      // Daily missions
      const dailyMissionOptions = [
        {
          title: "Focus Time",
          description: "Complete 2 hours of focused work without interruptions",
          category: "Productivity"
        },
        {
          title: "Healthy Habits",
          description: "Drink 8 glasses of water and take a 15-minute walk",
          category: "Health"
        },
        {
          title: "Mind Training",
          description: "Meditate for at least 10 minutes",
          category: "Wellness"
        },
        {
          title: "Organization",
          description: "Clear your inbox and update your to-do list",
          category: "Productivity"
        },
        {
          title: "Skill Building",
          description: "Spend 30 minutes learning something new",
          category: "Education"
        }
      ];
      
      // Select 3 random daily missions
      const shuffledDailyMissions = [...dailyMissionOptions].sort(() => 0.5 - Math.random());
      const selectedDailyMissions = shuffledDailyMissions.slice(0, 3).map(mission => ({
        id: generateId(),
        title: mission.title,
        description: mission.description,
        category: mission.category,
        type: "daily" as const,
        relatedTaskIds: [],
        completed: false,
        expiration: dailyExpirationStr
      }));
      
      // Weekly missions
      const weeklyMissionOptions = [
        {
          title: "Weekly Challenge",
          description: "Complete a project you've been putting off",
          category: "Growth"
        },
        {
          title: "Learning Quest",
          description: "Read 3 articles about a topic you want to learn",
          category: "Education"
        },
        {
          title: "Connection Goal",
          description: "Reach out to 2 people in your network",
          category: "Social"
        },
        {
          title: "Fitness Goal",
          description: "Exercise for at least 3 hours this week",
          category: "Health"
        },
        {
          title: "Creative Project",
          description: "Work on a creative project for at least 2 hours",
          category: "Creativity"
        }
      ];
      
      // Select 2 random weekly missions
      const shuffledWeeklyMissions = [...weeklyMissionOptions].sort(() => 0.5 - Math.random());
      const selectedWeeklyMissions = shuffledWeeklyMissions.slice(0, 2).map(mission => ({
        id: generateId(),
        title: mission.title,
        description: mission.description,
        category: mission.category,
        type: "weekly" as const,
        relatedTaskIds: [],
        completed: false,
        expiration: weeklyExpirationStr
      }));
      
      setDailyMissions(selectedDailyMissions);
      setWeeklyMissions(selectedWeeklyMissions);
    };
    
    generateMissions();
    
    // Regenerate missions once per day
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - new Date().getTime();
    
    const timerId = setTimeout(() => {
      generateMissions();
    }, timeUntilMidnight);
    
    return () => clearTimeout(timerId);
  }, [tasks]);
  
  // Load persisted completed missions from localStorage on mount
  useEffect(() => {
    const savedCompletedMissions = localStorage.getItem('completedMissions');
    
    if (savedCompletedMissions) {
      completedMissionsRef.current = new Set(JSON.parse(savedCompletedMissions));
    }
    
    // Clean up completed missions older than 7 days when component mounts
    const cleanupCompletedMissions = () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      
      const savedMissionData = localStorage.getItem('missionCompletionDates');
      if (savedMissionData) {
        const completionDates: Record<string, string> = JSON.parse(savedMissionData);
        let shouldUpdate = false;
        
        Object.entries(completionDates).forEach(([missionId, dateStr]) => {
          const completionDate = new Date(dateStr);
          if (completionDate < sevenDaysAgo) {
            // Remove old entries
            completedMissionsRef.current.delete(missionId);
            delete completionDates[missionId];
            shouldUpdate = true;
          }
        });
        
        if (shouldUpdate) {
          localStorage.setItem('missionCompletionDates', JSON.stringify(completionDates));
          localStorage.setItem('completedMissions', JSON.stringify([...completedMissionsRef.current]));
        }
      }
    };
    
    cleanupCompletedMissions();
  }, []);
  
  const toggleMissionComplete = (id: string, type: 'daily' | 'weekly') => {
    if (type === 'daily') {
      setDailyMissions(prevMissions => {
        // Find the mission to update
        const mission = prevMissions.find(m => m.id === id);
        
        // If mission not found or already completed, don't do anything
        if (!mission) return prevMissions;
        
        // If it's already completed, prevent un-completing
        if (mission.completed) {
          return prevMissions;
        }
        
        // Check if we've already awarded XP for this mission
        if (!completedMissionsRef.current.has(id)) {
          // Determine base hours based on mission category
          let baseHours = 1; // Default is 1 hour
          
          // Assign hours based on mission category or description
          if (mission.category === "Health" || mission.description.includes("exercise")) {
            baseHours = 2;
          } else if (mission.category === "Productivity") {
            baseHours = 3;
          } else if (mission.category === "Education" || mission.category === "Growth") {
            baseHours = 2;
          }
          
          // Calculate XP directly (20 base + 5 per hour)
          const xpAmount = 20 + (baseHours * 5);
          
          // Award XP directly
          gainXP(xpAmount);
          
          // Record that we've completed this mission
          completedMissionsRef.current.add(id);
          
          // Store the completion date for cleanup
          const completionDates = JSON.parse(localStorage.getItem('missionCompletionDates') || '{}');
          completionDates[id] = new Date().toISOString();
          localStorage.setItem('missionCompletionDates', JSON.stringify(completionDates));
          
          // Save to localStorage
          localStorage.setItem('completedMissions', JSON.stringify([...completedMissionsRef.current]));
          
          console.log(`Awarded ${xpAmount} XP for completing ${mission.title} mission`);
        } else {
          console.log(`Mission ${mission.title} already awarded XP previously`);
        }
        
        // Update the mission state
        return prevMissions.map(mission => 
          mission.id === id 
            ? { ...mission, completed: true } 
            : mission
        );
      });
    } else {
      setWeeklyMissions(prevMissions => {
        // Find the mission to update
        const mission = prevMissions.find(m => m.id === id);
        
        // If mission not found or already completed, don't do anything
        if (!mission) return prevMissions;
        
        // If it's already completed, prevent un-completing
        if (mission.completed) {
          return prevMissions;
        }
        
        // Check if we've already awarded XP for this mission
        if (!completedMissionsRef.current.has(id)) {
          // Weekly missions are worth more
          let baseHours = 3; // Default is 3 hours for weekly missions
          
          // Assign hours based on mission category or description
          if (mission.category === "Health" || mission.description.includes("exercise")) {
            baseHours = 4;
          } else if (mission.category === "Productivity") {
            baseHours = 5;
          } else if (mission.category === "Education" || mission.category === "Growth") {
            baseHours = 4;
          }
          
          // Calculate XP directly (20 base + 5 per hour)
          const xpAmount = 20 + (baseHours * 5);
          
          // Award XP directly
          gainXP(xpAmount);
          
          // Record that we've completed this mission
          completedMissionsRef.current.add(id);
          
          // Store the completion date for cleanup
          const completionDates = JSON.parse(localStorage.getItem('missionCompletionDates') || '{}');
          completionDates[id] = new Date().toISOString();
          localStorage.setItem('missionCompletionDates', JSON.stringify(completionDates));
          
          // Save to localStorage
          localStorage.setItem('completedMissions', JSON.stringify([...completedMissionsRef.current]));
          
          console.log(`Awarded ${xpAmount} XP for completing ${mission.title} weekly mission`);
        } else {
          console.log(`Mission ${mission.title} already awarded XP previously`);
        }
        
        // Update the mission state
        return prevMissions.map(mission => 
          mission.id === id 
            ? { ...mission, completed: true } 
            : mission
        );
      });
    }
  };
  
  const getDailyProgress = () => {
    if (dailyMissions.length === 0) return 0;
    const completed = dailyMissions.filter(mission => mission.completed).length;
    return Math.round((completed / dailyMissions.length) * 100);
  };
  
  const getWeeklyProgress = () => {
    if (weeklyMissions.length === 0) return 0;
    const completed = weeklyMissions.filter(mission => mission.completed).length;
    return Math.round((completed / weeklyMissions.length) * 100);
  };
  
  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  // Add a helper function to get the proper day name for display
  const getDisplayDayName = (task: ScheduleItem | undefined): string => {
    if (!task) return '';
    
    // If we have a calculated day (for future tasks), use that
    if (task.calculatedDayOfWeek !== undefined) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[task.calculatedDayOfWeek];
    }
    
    // Otherwise use the regular day of week
    return getDayName(task.dayOfWeek || 0);
  };

  return (
    <div className="mission-dashboard">
      {/* Current scheduled task from calendar */}
      <div className="current-scheduled-mission">
        {currentScheduledMission.type === 'none' ? (
          <div className="scheduled-mission no-mission">
            <span className="mission-label">MISSION STATUS</span>
            <span className="mission-details">NO ACTIVE MISSIONS</span>
            <span className="mission-action">GENERATE A SCHEDULE TO BEGIN</span>
          </div>
        ) : (
          <div className={`scheduled-mission ${currentScheduledMission.type}`}>
            <span className="mission-label">
              {currentScheduledMission.type === 'current' ? 'CURRENT MISSION' : 'NEXT MISSION'}
            </span>
            <span className="mission-name">{currentScheduledMission.task?.name}</span>
            <span className="mission-details">
              {currentScheduledMission.type === 'current' 
                ? `UNTIL ${formatTime(currentScheduledMission.task?.endHour || 0)}`
                : currentScheduledMission.type === 'upcoming' 
                  ? `STARTING ${currentScheduledMission.timeUntil} (${getDisplayDayName(currentScheduledMission.task)} at ${formatTime(currentScheduledMission.task?.startHour || 0)})`
                  : ''}
            </span>
            <span className="mission-category">{currentScheduledMission.task?.category}</span>
          </div>
        )}
      </div>
      
      {/* Tabs for daily/weekly missions */}
      <div className="mission-tabs">
        <button 
          className={`mission-tab ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          DAILY
        </button>
        <button 
          className={`mission-tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          WEEKLY
        </button>
      </div>
      
      {/* Content for daily/weekly missions */}
      <div className="mission-content">
        {activeTab === 'daily' ? (
          <>
            <div className="mission-header">
              <div className="mission-title">DAILY MISSIONS</div>
              <div className="mission-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${getDailyProgress()}%` }}
                  ></div>
                </div>
                <div className="progress-text">{getDailyProgress()}%</div>
              </div>
            </div>
            
            <div className="mission-list">
              {dailyMissions.length > 0 ? (
                dailyMissions.map(mission => (
                  <div 
                    key={mission.id} 
                    className={`mission-item ${mission.completed ? 'completed' : ''}`}
                    onClick={() => toggleMissionComplete(mission.id, 'daily')}
                  >
                    <div className="mission-checkbox">
                      {mission.completed ? '✓' : ''}
                    </div>
                    <div 
                      className="mission-details"
                      style={{ borderLeft: `4px solid ${getCategoryColor(mission.category)}` }}
                    >
                      <div className="mission-name">{mission.title}</div>
                      <div className="mission-description">{mission.description}</div>
                      <div className="mission-category">{mission.category}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-missions">No daily missions available</div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mission-header">
              <div className="mission-title">WEEKLY MISSIONS</div>
              <div className="mission-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${getWeeklyProgress()}%` }}
                  ></div>
                </div>
                <div className="progress-text">{getWeeklyProgress()}%</div>
              </div>
            </div>
            
            <div className="mission-list">
              {weeklyMissions.length > 0 ? (
                weeklyMissions.map(mission => (
                  <div 
                    key={mission.id} 
                    className={`mission-item ${mission.completed ? 'completed' : ''}`}
                    onClick={() => toggleMissionComplete(mission.id, 'weekly')}
                  >
                    <div className="mission-checkbox">
                      {mission.completed ? '✓' : ''}
                    </div>
                    <div 
                      className="mission-details"
                      style={{ borderLeft: `4px solid ${getCategoryColor(mission.category)}` }}
                    >
                      <div className="mission-name">{mission.title}</div>
                      <div className="mission-description">{mission.description}</div>
                      <div className="mission-category">{mission.category}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-missions">No weekly missions available</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentMission; 