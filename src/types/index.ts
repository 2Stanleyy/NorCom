export interface Task {
  id: string;
  name: string;
  description: string;
  color: string;
  category: string;
  estimatedHours: number;
}

export interface ScheduledTask extends Task {
  dayOfWeek: number; // 0-6, Sunday is 0
  startHour: number; // 0-23
  endHour: number;   // 0-23
  date?: string;     // ISO date string (YYYY-MM-DD) derived from dayOfWeek for easier processing
}

export interface TaskProgress {
  taskId: string;
  completedDate: string;
  actualHours: number;
  completed: boolean;
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