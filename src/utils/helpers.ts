import { format } from 'date-fns';
import { ScheduledTask } from '../types';

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Format time (24h to 12h)
export const formatTime = (hour: number): string => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}:00 ${ampm}`;
};

// Get day name from day of week
export const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
};

// Get short day name
export const getShortDayName = (dayOfWeek: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek];
};

// Standardized helper to convert dayOfWeek to an actual date (consistent across app)
// In our app, dayOfWeek 0 = Monday, 1 = Tuesday, etc. (unlike JavaScript's 0 = Sunday)
export const getDateFromDayOfWeek = (dayOfWeek: number): string => {
  // Get the current week's Monday
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday in JavaScript
  const diff = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Convert to 0 = Monday
  
  const mondayOfCurrentWeek = new Date(today);
  mondayOfCurrentWeek.setDate(today.getDate() - diff);
  mondayOfCurrentWeek.setHours(0, 0, 0, 0); // Reset time for consistency
  
  // Add dayOfWeek days to Monday to get the actual date
  const taskDate = new Date(mondayOfCurrentWeek);
  taskDate.setDate(mondayOfCurrentWeek.getDate() + dayOfWeek);
  
  return format(taskDate, 'yyyy-MM-dd');
};

// Convert JavaScript day of week (0 = Sunday) to our system (0 = Monday)
export const convertToAppDayOfWeek = (jsDayOfWeek: number): number => {
  return jsDayOfWeek === 0 ? 6 : jsDayOfWeek - 1;
};

// Convert our day of week (0 = Monday) to JavaScript system (0 = Sunday)
export const convertToJsDayOfWeek = (appDayOfWeek: number): number => {
  return (appDayOfWeek + 1) % 7;
};

// Get task duration in hours
export const getTaskDuration = (task: ScheduledTask): number => {
  return task.endHour - task.startHour;
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy');
};

// Predefined distinct colors for categories
const categoryColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFD166', // Yellow
  '#6B5CA5', // Purple
  '#72B01D', // Green
  '#F86624', // Orange
  '#40A9FF', // Blue
  '#FF85A1', // Pink
  '#8A2BE2', // BlueViolet
  '#20B2AA', // LightSeaGreen
  '#FFA500', // Orange
  '#32CD32', // LimeGreen
  '#DB7093', // PaleVioletRed
  '#4169E1', // RoyalBlue
  '#2E8B57', // SeaGreen
];

// Keep track of assigned colors
const categoryColorMap: Record<string, string> = {};
let nextColorIndex = 0;

// Get color for a category (consistent across the app)
export const getCategoryColor = (category: string): string => {
  // If this category already has a color, return it
  if (categoryColorMap[category]) {
    return categoryColorMap[category];
  }
  
  // Assign a new color to this category
  const color = categoryColors[nextColorIndex % categoryColors.length];
  categoryColorMap[category] = color;
  nextColorIndex++;
  
  return color;
};

// Get random color (deprecated - kept for compatibility)
export const getRandomColor = (): string => {
  return categoryColors[Math.floor(Math.random() * categoryColors.length)];
};

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}; 