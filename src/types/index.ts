export interface Task {
  id: string;
  name: string;
  description: string;
  color: string;
  category: string;
  estimatedHours: number;
  completed?: boolean; // Optional property to track task completion
}

export interface ScheduledTask extends Task {
  dayOfWeek: number; // 0-6, Sunday is 0
  startHour: number; // 0-23
  endHour: number;   // 0-23
  date?: string;     // ISO date string (YYYY-MM-DD) derived from dayOfWeek for easier processing
}

export interface TaskProgress {
  id: string;
  taskId: string;
  date: string;
  hours: number;
  category: string;
}

export interface WeeklySchedule {
  id: string;
  startDate: string;
  endDate: string;
  scheduledTasks: ScheduledTask[];
}

export interface UserStats {
  taskCompletionRate: number;
  totalHoursLogged: number;
  streakDays: number;
  taskCategorySummary: Record<string, number>;
}

export interface UserProfile {
  agentId: string;
  codename: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  clearanceLevel: string;
  tasksCompleted: number;
  missionHistory: number;
}

export interface MeditationSession {
  id: string;
  date: string;      // ISO date string (YYYY-MM-DD)
  minutes: number;   // Duration in minutes
  notes?: string;    // Optional notes about the session
}

export interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastMeditationDate: string | null;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "daily" | "weekly";
  relatedTaskIds: string[];
  completed: boolean;
  expiration: string; // ISO date string when the mission expires
} 