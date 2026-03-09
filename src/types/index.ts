export type TaskStatus = 'inbox' | 'planned' | 'in_progress' | 'done' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type RepeatFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RepeatRule {
  frequency: RepeatFrequency;
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
}

export interface Reminder {
  id: string;
  time: number;
  triggered: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  projectId: string | null;
  repeatRule: RepeatRule | null;
  reminder: Reminder | null;
  estimatedTime: number | null;
  actualTime: number | null;
  energyLevelRequired: number | null;
  subtasks: Subtask[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type EventCategory = 'work' | 'personal' | 'health' | 'social' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  participants: string[];
  reminders: number[];
  repeatRule: RepeatRule | null;
  createdAt: string;
}

export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  type: 'focus' | 'meeting' | 'rest' | 'personal';
  linkedTaskId: string | null;
  date: string;
}

export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type HabitDifficulty = 'easy' | 'medium' | 'hard';

export interface Habit {
  id: string;
  title: string;
  frequency: HabitFrequency;
  frequencyDays: number[];
  streak: number;
  completionHistory: string[];
  reminders: number[];
  difficulty: HabitDifficulty;
  createdAt: string;
}

export type GoalType = 'yearly' | 'quarterly' | 'monthly' | 'long-term';

export interface Milestone {
  id: string;
  title: string;
  deadline: string;
  progress: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  type: GoalType;
  deadline: string;
  milestones: Milestone[];
  progress: number;
  linkedTasks: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  linkedTaskId: string | null;
  linkedGoalId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  taskId: string | null;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  workHoursStart: string;
  workHoursEnd: string;
  timeFormat: '12h' | '24h';
  defaultReminder: number;
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

export type TaskFilter = 'today' | 'tomorrow' | 'week' | 'no-date' | 'overdue' | 'high-priority';

export interface DayStats {
  date: string;
  tasksCompleted: number;
  tasksCreated: number;
  focusTime: number;
  habitsCompleted: number;
}
