import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { addDays, startOfWeek, format, isEqual, parseISO, differenceInDays } from 'date-fns';
import { 
  Task, 
  ScheduledTask, 
  TaskProgress, 
  WeeklySchedule,
  UserStats,
  UserProfile,
  MeditationSession,
  MeditationStats
} from '../types';
import { getCategoryColor, generateId, getDateFromDayOfWeek, convertToAppDayOfWeek } from '../utils/helpers';

interface AppContextType {
  tasks: Task[];
  currentSchedule: WeeklySchedule | null;
  taskProgress: TaskProgress[];
  stats: UserStats;
  profile: UserProfile;
  meditationSessions: MeditationSession[];
  meditationStats: MeditationStats;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  generateWeeklySchedule: () => void;
  completeTask: (taskId: string, hours: number) => void;
  resetProgress: () => void;
  addMeditationSession: (minutes: number, notes?: string) => void;
  deleteMeditationSession: (sessionId: string) => void;
  gainXP: (amount: number) => void;
}

const defaultStats: UserStats = {
  taskCompletionRate: 0,
  totalHoursLogged: 0,
  streakDays: 0,
  taskCategorySummary: {}
};

const defaultMeditationStats: MeditationStats = {
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastMeditationDate: null,
};

const defaultProfile: UserProfile = {
  agentId: "A-" + Math.floor(Math.random() * 9000 + 1000),
  codename: "OPERATIVE",
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  clearanceLevel: "GAMMA",
  tasksCompleted: 0,
  missionHistory: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Load data from localStorage or use defaults
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [currentSchedule, setCurrentSchedule] = useState<WeeklySchedule | null>(() => {
    const savedSchedule = localStorage.getItem('currentSchedule');
    return savedSchedule ? JSON.parse(savedSchedule) : null;
  });

  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>(() => {
    const savedProgress = localStorage.getItem('taskProgress');
    return savedProgress ? JSON.parse(savedProgress) : [];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const savedStats = localStorage.getItem('stats');
    return savedStats ? JSON.parse(savedStats) : defaultStats;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('profile');
    return savedProfile ? JSON.parse(savedProfile) : defaultProfile;
  });

  const [meditationSessions, setMeditationSessions] = useState<MeditationSession[]>(() => {
    const savedSessions = localStorage.getItem('meditationSessions');
    return savedSessions ? JSON.parse(savedSessions) : [];
  });

  const [meditationStats, setMeditationStats] = useState<MeditationStats>(() => {
    const savedStats = localStorage.getItem('meditationStats');
    return savedStats ? JSON.parse(savedStats) : defaultMeditationStats;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('currentSchedule', JSON.stringify(currentSchedule));
  }, [currentSchedule]);

  useEffect(() => {
    localStorage.setItem('taskProgress', JSON.stringify(taskProgress));
  }, [taskProgress]);

  useEffect(() => {
    localStorage.setItem('stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('meditationSessions', JSON.stringify(meditationSessions));
  }, [meditationSessions]);

  useEffect(() => {
    localStorage.setItem('meditationStats', JSON.stringify(meditationStats));
  }, [meditationStats]);

  // Helper function to generate a random time slot
  const getRandomTimeSlot = (existingSlots: ScheduledTask[], dayOfWeek: number) => {
    // Try to find a free slot (simple algorithm - can be improved)
    const blockedHours = existingSlots
      .filter(slot => slot.dayOfWeek === dayOfWeek)
      .flatMap(slot => Array.from({ length: slot.endHour - slot.startHour }, (_, i) => slot.startHour + i));
    
    // Consider only hours between 8 AM and 10 PM for more availability
    const availableHours = Array.from({ length: 14 }, (_, i) => i + 8)
      .filter(hour => !blockedHours.includes(hour));
    
    if (availableHours.length < 1) {
      return null; // No available slot
    }
    
    // Find consecutive available hours
    const consecutiveRanges: { start: number, length: number }[] = [];
    let currentRange = { start: availableHours[0], length: 1 };
    
    for (let i = 1; i < availableHours.length; i++) {
      if (availableHours[i] === availableHours[i-1] + 1) {
        // Continue current range
        currentRange.length++;
      } else {
        // End of range, store it and start a new one
        consecutiveRanges.push(currentRange);
        currentRange = { start: availableHours[i], length: 1 };
      }
    }
    // Add the last range
    consecutiveRanges.push(currentRange);
    
    // Sort ranges by length (descending) to prefer longer slots
    consecutiveRanges.sort((a, b) => b.length - a.length);
    
    // If we have ranges, pick one (prefer longer ones)
    if (consecutiveRanges.length > 0) {
      // 80% chance to pick one of the longer slots if available
      const preferLonger = Math.random() < 0.8;
      const rangeIndex = preferLonger ? 0 : Math.floor(Math.random() * consecutiveRanges.length);
      const selectedRange = consecutiveRanges[rangeIndex];
      
      // Determine duration (try to use more of the available time)
      // Max of 3 hours or the range length, with preference for longer durations
      const maxDuration = Math.min(selectedRange.length, 3);
      const duration = Math.max(1, Math.min(maxDuration, Math.ceil(Math.random() * maxDuration)));
      
      const startHour = selectedRange.start;
      const endHour = startHour + duration;
      
      return { startHour, endHour };
    }
    
    return null;
  };

  // Function to generate a new weekly schedule
  const generateWeeklySchedule = () => {
    if (tasks.length === 0) {
      console.log("No tasks to schedule");
      return; // No tasks to schedule
    }

    console.log("Generating weekly schedule with tasks:", tasks);
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = addDays(weekStart, 6);
    
    const scheduledTasks: ScheduledTask[] = [];
    
    // Calculate total hours that need to be allocated
    const totalEstimatedHours = tasks.reduce((sum, task) => {
      // Ensure we have a valid number for estimatedHours
      const hours = task.estimatedHours || 0;
      return sum + hours;
    }, 0);
    
    // Create a working copy of tasks with hours to allocate
    const tasksToSchedule = tasks.map(task => ({
      ...task,
      hoursToAllocate: task.estimatedHours || 0, // Ensure we have a valid number
    }));
    
    // Keep scheduling until all hours are allocated or we can't schedule any more
    let scheduledHours = 0;
    let stuckCounter = 0; // To prevent infinite loop
    
    // Keep track of days used for each task to distribute evenly
    const taskDays: Record<string, number[]> = {};
    tasks.forEach(task => {
      taskDays[task.id] = [];
    });

    console.log("Starting scheduling with total hours:", totalEstimatedHours);
    
    while (scheduledHours < totalEstimatedHours && stuckCounter < 100) {
      // Find a task that still needs hours allocated
      const taskIndex = tasksToSchedule.findIndex(t => t.hoursToAllocate > 0);
      if (taskIndex === -1) break; // No more tasks with hours to allocate
      
      const taskToSchedule = tasksToSchedule[taskIndex];
      
      // Determine how many hours to schedule for this task (1-3 hours per slot)
      // Don't allocate more than what's remaining for this task
      const maxHoursPerSlot = Math.min(3, taskToSchedule.hoursToAllocate);
      const hoursToSchedule = Math.max(1, Math.min(maxHoursPerSlot, Math.ceil(Math.random() * maxHoursPerSlot)));
      
      // Try to find a day that hasn't been used yet for this task
      const availableDays = Array.from({ length: 7 }, (_, idx) => idx)
        .filter(day => !taskDays[taskToSchedule.id].includes(day));
      
      let dayOfWeek: number;
      
      if (availableDays.length > 0) {
        // Pick a random available day
        dayOfWeek = availableDays[Math.floor(Math.random() * availableDays.length)];
      } else {
        // If all days used, pick a random day
        dayOfWeek = Math.floor(Math.random() * 7);
      }
      
      // Find a time slot for this number of hours
      const timeSlot = getSlotForHours(scheduledTasks, dayOfWeek, hoursToSchedule);
      
      if (timeSlot) {
        // Create the scheduled task
        // Ensure all necessary properties are present
        const scheduledTask: ScheduledTask = {
          ...taskToSchedule,
          id: taskToSchedule.id, // Ensure ID is copied
          name: taskToSchedule.name,
          category: taskToSchedule.category || 'Uncategorized',
          color: taskToSchedule.color || getCategoryColor(taskToSchedule.category || 'Uncategorized'),
          dayOfWeek,
          startHour: timeSlot.startHour,
          endHour: timeSlot.endHour,
          date: getDateFromDayOfWeek(dayOfWeek) // Add the date field for consistency
        };
        
        // Add to scheduled tasks
        scheduledTasks.push(scheduledTask);
        
        // Update hours and days
        const actualHours = timeSlot.endHour - timeSlot.startHour;
        tasksToSchedule[taskIndex].hoursToAllocate -= actualHours;
        scheduledHours += actualHours;
        taskDays[taskToSchedule.id].push(dayOfWeek);
        
        // Reset stuck counter because we made progress
        stuckCounter = 0;
      } else {
        // Couldn't schedule, increment stuck counter
        stuckCounter++;
      }
    }
    
    const newSchedule: WeeklySchedule = {
      id: `week-${format(weekStart, 'yyyy-MM-dd')}`,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      scheduledTasks
    };
    
    console.log("Generated new schedule:", newSchedule);
    setCurrentSchedule(newSchedule);
  };

  // Helper function to find a slot for a specific number of hours
  const getSlotForHours = (existingSlots: ScheduledTask[], dayOfWeek: number, desiredHours: number) => {
    // Try to find a free slot with exactly the desired hours
    const blockedHours = existingSlots
      .filter(slot => slot.dayOfWeek === dayOfWeek)
      .flatMap(slot => Array.from({ length: slot.endHour - slot.startHour }, (_, i) => slot.startHour + i));
    
    // Consider only hours between 8 AM and 10 PM
    const availableHours = Array.from({ length: 14 }, (_, i) => i + 8)
      .filter(hour => !blockedHours.includes(hour));
    
    if (availableHours.length < desiredHours) {
      return null; // Not enough consecutive hours available
    }
    
    // Find consecutive available hour ranges
    const consecutiveRanges: { start: number, length: number }[] = [];
    let currentRange = { start: -1, length: 0 };
    
    for (let i = 0; i < availableHours.length; i++) {
      const hour = availableHours[i];
      
      if (i === 0 || hour !== availableHours[i-1] + 1) {
        // Start of a new range
        if (currentRange.start !== -1) {
          consecutiveRanges.push(currentRange);
        }
        currentRange = { start: hour, length: 1 };
      } else {
        // Continue the current range
        currentRange.length++;
      }
    }
    
    // Add the last range
    if (currentRange.start !== -1) {
      consecutiveRanges.push(currentRange);
    }
    
    // Filter ranges that are long enough
    const suitableRanges = consecutiveRanges.filter(range => range.length >= desiredHours);
    
    if (suitableRanges.length === 0) {
      return null; // No suitable ranges found
    }
    
    // Pick a random suitable range
    const selectedRange = suitableRanges[Math.floor(Math.random() * suitableRanges.length)];
    
    // If the range is longer than needed, pick a random start point within it
    const maxStart = selectedRange.start + selectedRange.length - desiredHours;
    const startHour = selectedRange.start + Math.floor(Math.random() * (maxStart - selectedRange.start + 1));
    const endHour = startHour + desiredHours;
    
    return { startHour, endHour };
  };

  // Function to add a new task
  const addTask = (task: Task) => {
    setTasks(prevTasks => [...prevTasks, task]);
  };

  const gainXP = (amount: number) => {
    setProfile(prevProfile => {
      // Calculate new XP
      const newXP = prevProfile.xp + amount;
      
      // Check if leveled up
      if (newXP >= prevProfile.xpToNextLevel) {
        // Calculate XP overflow for new level
        const overflow = newXP - prevProfile.xpToNextLevel;
        const newLevel = prevProfile.level + 1;
        
        // Increase XP requirement for each level
        const newXPToNextLevel = Math.floor(prevProfile.xpToNextLevel * 1.5);
        
        // Determine clearance level based on agent level
        let clearanceLevel = prevProfile.clearanceLevel;
        if (newLevel >= 10) clearanceLevel = "ALPHA";
        else if (newLevel >= 7) clearanceLevel = "BETA";
        else if (newLevel >= 4) clearanceLevel = "DELTA";
        else if (newLevel >= 2) clearanceLevel = "GAMMA";
        
        return {
          ...prevProfile,
          level: newLevel,
          xp: overflow,
          xpToNextLevel: newXPToNextLevel,
          clearanceLevel,
          tasksCompleted: prevProfile.tasksCompleted + 1
        };
      }
      
      // No level up, just add XP
      return {
        ...prevProfile,
        xp: newXP,
        tasksCompleted: prevProfile.tasksCompleted + 1
      };
    });
  };

  // Function to delete a task
  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // Function to mark a task as completed
  const completeTask = (taskId: string, hours: number) => {
    // Find the corresponding task to get its category
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Add to task progress
    const today = format(new Date(), 'yyyy-MM-dd');
    const newProgress: TaskProgress = {
      id: generateId(),
      taskId,
      date: today,
      hours,
      category: task.category || 'uncategorized'
    };
    
    setTaskProgress(prev => [...prev, newProgress]);
    
    // Award XP for completing the task (base 20 XP + 5 XP per hour)
    const xpGained = 20 + (hours * 5);
    gainXP(xpGained);
    
    // Update stats
    updateStats(task, hours);
  };

  // Function to update user stats
  const updateStats = (task: Task | null, hours: number) => {
    // Update stats with the completed task
    setStats(prevStats => {
      // Calculate total hours logged
      const newTotalHoursLogged = taskProgress.reduce((total, progress) => {
        return total + progress.hours;
      }, hours);

      // Calculate task completion rate
      const totalTasks = tasks.length;
      const completedTasks = new Set(taskProgress.map(progress => progress.taskId)).size;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Calculate streak days
      let currentStreak = prevStats.streakDays;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const todayStr = format(today, 'yyyy-MM-dd');
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

      // Check if there's a completion today
      const hasCompletionToday = taskProgress.some(progress => progress.date === todayStr);

      // Check if there's a completion yesterday
      const hasCompletionYesterday = taskProgress.some(progress => progress.date === yesterdayStr);

      // Update streak
      if (hasCompletionToday) {
        if (hasCompletionYesterday || currentStreak === 0) {
          currentStreak += 1;
        }
      } else if (!hasCompletionYesterday) {
        currentStreak = 0;
      }

      // Update category summary
      const categorySummary = { ...prevStats.taskCategorySummary };
      const category = task?.category || 'uncategorized';
      categorySummary[category] = (categorySummary[category] || 0) + 1;

      return {
        taskCompletionRate: completionRate,
        totalHoursLogged: newTotalHoursLogged,
        streakDays: currentStreak,
        taskCategorySummary: categorySummary
      };
    });
  };

  // Function to add a new meditation session
  const addMeditationSession = (minutes: number, notes?: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const newSession: MeditationSession = {
      id: generateId(), // Reuse your existing ID generator
      date: today,
      minutes,
      notes
    };
    
    // Add the session
    setMeditationSessions(prev => [...prev, newSession]);
    
    // Update meditation stats
    updateMeditationStats([...meditationSessions, newSession]);
  };

  // Function to delete a meditation session
  const deleteMeditationSession = (sessionId: string) => {
    setMeditationSessions(prev => {
      const updatedSessions = prev.filter(session => session.id !== sessionId);
      updateMeditationStats(updatedSessions);
      return updatedSessions;
    });
  };

  // Function to update meditation stats
  const updateMeditationStats = (sessions: MeditationSession[]) => {
    if (sessions.length === 0) {
      setMeditationStats(defaultMeditationStats);
      return;
    }
    
    // Total sessions and minutes
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((total, session) => total + session.minutes, 0);
    
    // Sort sessions by date (oldest to newest)
    const sortedSessions = [...sessions].sort((a, b) => 
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
    
    // Get last meditation date
    const lastSession = sortedSessions[sortedSessions.length - 1];
    const lastMeditationDate = lastSession.date;
    
    // Calculate current streak
    let currentStreak = 0;
    let tempStreak = 0;
    let longestStreak = 0;
    
    // Group sessions by date to handle multiple sessions in same day
    const sessionsByDate: Record<string, MeditationSession[]> = {};
    sortedSessions.forEach(session => {
      if (!sessionsByDate[session.date]) {
        sessionsByDate[session.date] = [];
      }
      sessionsByDate[session.date].push(session);
    });
    
    // Get unique dates in order
    const dates = Object.keys(sessionsByDate).sort();
    
    if (dates.length > 0) {
      // Check if last meditation was today or yesterday
      const lastDate = parseISO(dates[dates.length - 1]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const isToday = isEqual(lastDate, today);
      const isYesterday = differenceInDays(today, lastDate) === 1;
      
      if (isToday || isYesterday) {
        // Start counting the current streak
        tempStreak = 1;
        
        // Go backward through dates to find streak
        for (let i = dates.length - 2; i >= 0; i--) {
          const currentDate = parseISO(dates[i]);
          const prevDate = parseISO(dates[i + 1]);
          
          // Check if dates are consecutive
          if (differenceInDays(prevDate, currentDate) === 1) {
            tempStreak++;
          } else {
            break; // Break streak
          }
        }
        
        currentStreak = tempStreak;
      }
      
      // Calculate longest streak
      tempStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const currentDate = parseISO(dates[i]);
        const prevDate = parseISO(dates[i - 1]);
        
        if (differenceInDays(currentDate, prevDate) === 1) {
          tempStreak++;
        } else {
          // Before resetting, check if this was the longest streak
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      
      // Check if the final tempStreak is the longest
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    setMeditationStats({
      totalSessions,
      totalMinutes,
      currentStreak,
      longestStreak,
      lastMeditationDate
    });
  };

  // Add resetProgress to also clear meditation data
  const resetProgress = () => {
    // Reset task progress and stats
    setTaskProgress([]);
    setStats(defaultStats);
    
    // Reset profile but keep the agent ID
    const agentId = profile.agentId;
    setProfile({
      ...defaultProfile,
      agentId
    });
    
    // Reset meditation data
    setMeditationSessions([]);
    setMeditationStats(defaultMeditationStats);
  };

  return (
    <AppContext.Provider value={{
      tasks,
      currentSchedule,
      taskProgress,
      stats,
      profile,
      meditationSessions,
      meditationStats,
      addTask,
      deleteTask,
      generateWeeklySchedule,
      completeTask,
      resetProgress,
      addMeditationSession,
      deleteMeditationSession,
      gainXP
    }}>
      {children}
    </AppContext.Provider>
  );
}; 