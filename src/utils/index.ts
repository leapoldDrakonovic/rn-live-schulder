import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

export const formatDate = (date: string | null, format = 'DD MMM'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatTime = (time: string | null, format = 'HH:mm'): string => {
  if (!time) return '';
  return dayjs(time).format(format);
};

export const formatDateTime = (dateTime: string | null, format = 'DD MMM HH:mm'): string => {
  if (!dateTime) return '';
  return dayjs(dateTime).format(format);
};

export const isToday = (date: string | null): boolean => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isTomorrow = (date: string | null): boolean => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
};

export const isPast = (date: string | null): boolean => {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs(), 'day');
};

export const isThisWeek = (date: string | null): boolean => {
  if (!date) return false;
  return dayjs(date).isAfter(dayjs()) && dayjs(date).isBefore(dayjs().add(7, 'day'));
};

export const getRelativeDate = (date: string | null): string => {
  if (!date) return 'No date';
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isPast(date)) return 'Overdue';
  return formatDate(date, 'DD MMM');
};

export const getTimeOfDay = (): string => {
  const hour = dayjs().hour();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export const getGreeting = (): string => {
  const timeOfDay = getTimeOfDay();
  const greetings: Record<string, string> = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
  };
  return greetings[timeOfDay];
};

export const getDurationString = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return '#34C759';
  if (progress >= 50) return '#FF9500';
  if (progress >= 25) return '#FF3B30';
  return '#8E8E93';
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return '#FF3B30';
    case 'high': return '#FF9500';
    case 'medium': return '#007AFF';
    case 'low': return '#8E8E93';
    default: return '#8E8E93';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'done': return '#34C759';
    case 'in_progress': return '#007AFF';
    case 'planned': return '#5856D6';
    case 'inbox': return '#8E8E93';
    case 'archived': return '#C7C7CC';
    default: return '#8E8E93';
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'work': return '#007AFF';
    case 'personal': return '#34C759';
    case 'health': return '#FF3B30';
    case 'social': return '#FF9500';
    case 'other': return '#8E8E93';
    default: return '#8E8E93';
  }
};

export const parseQuickAdd = (text: string): { title: string; dueDate: string | null; priority: string } => {
  let title = text;
  let dueDate: string | null = null;
  let priority: string = 'medium';
  
  const tomorrowMatch = text.match(/завтра|tomorrow/i);
  if (tomorrowMatch) {
    dueDate = dayjs().add(1, 'day').toISOString();
    title = title.replace(tomorrowMatch[0], '').trim();
  }
  
  const todayMatch = text.match(/сегодня|today/i);
  if (todayMatch) {
    dueDate = dayjs().toISOString();
    title = title.replace(todayMatch[0], '').trim();
  }
  
  const weekMatch = text.match(/на неделе|this week/i);
  if (weekMatch) {
    dueDate = dayjs().add(7, 'day').toISOString();
    title = title.replace(weekMatch[0], '').trim();
  }
  
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:\s*[\/\-]\s*(\d{2,4}))?/);
  if (dateMatch) {
    try {
      const date = dayjs(`${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3] || dayjs().year()}`, 'D/M/YYYY');
      if (date.isValid()) {
        dueDate = date.toISOString();
        title = title.replace(dateMatch[0], '').trim();
      }
    } catch (e) {}
  }
  
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    title = title.replace(timeMatch[0], '').trim();
  }
  
  const urgentMatch = text.match(/срочно|urgent|!|важно/i);
  if (urgentMatch) {
    priority = 'high';
    title = title.replace(urgentMatch[0], '').trim();
  }
  
  return { title: title.trim() || 'New task', dueDate, priority };
};
