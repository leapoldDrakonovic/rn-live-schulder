import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskCard } from '../../components/ui';
import { useStore } from '../../store';
import { CalendarEvent, Task } from '../../types';
import { formatDate } from '../../utils';

type ViewMode = 'day' | 'week' | 'month' | 'agenda';

export const CalendarScreen: React.FC = () => {
  const { tasks, events, setTaskStatus } = useStore();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showEventModal, setShowEventModal] = useState(false);

  const handleToggleTask = (task: Task) => {
    const newStatus = task.status === 'done' ? 'inbox' : 'done';
    setTaskStatus(task.id, newStatus);
  };
  
  const markedDates = {
    ...tasks.reduce((acc, task) => {
      if (task.dueDate) {
        const dateKey = dayjs(task.dueDate).format('YYYY-MM-DD');
        acc[dateKey] = {
          marked: true,
          dotColor: task.status === 'done' ? '#34C759' : '#007AFF',
        };
      }
      return acc;
    }, {} as Record<string, any>),
    ...events.reduce((acc, event) => {
      const dateKey = dayjs(event.startTime).format('YYYY-MM-DD');
      if (!acc[dateKey]) {
        acc[dateKey] = { marked: true, dotColor: '#FF9500' };
      }
      return acc;
    }, {} as Record<string, any>),
    [selectedDate]: {
      selected: true,
      selectedColor: '#007AFF',
    },
  };
  
  const tasksForDate = tasks.filter(t => 
    t.dueDate && dayjs(t.dueDate).format('YYYY-MM-DD') === selectedDate
  );
  
  const scheduledTasksForDate = tasks.filter(t => 
    t.dueDate && 
    t.startTime && 
    dayjs(t.dueDate).format('YYYY-MM-DD') === selectedDate
  );
  
  const eventsForDate = events.filter(e => 
    dayjs(e.startTime).format('YYYY-MM-DD') === selectedDate
  );
  
  const renderWeekView = () => {
    const weekStart = dayjs(selectedDate).startOf('week');
    const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
    
    return (
      <View style={styles.weekView}>
        {weekDays.map(day => {
          const dateKey = day.format('YYYY-MM-DD');
          const isSelected = dateKey === selectedDate;
          const isToday = day.isSame(dayjs(), 'day');
          
          return (
            <TouchableOpacity
              key={dateKey}
              style={[styles.weekDay, isSelected && styles.weekDaySelected]}
              onPress={() => setSelectedDate(dateKey)}
            >
              <Text style={[styles.weekDayName, isSelected && styles.weekDayNameSelected]}>
                {day.format('ddd')}
              </Text>
              <Text style={[
                styles.weekDayNumber,
                isSelected && styles.weekDayNumberSelected,
                isToday && !isSelected && styles.weekDayToday,
              ]}>
                {day.format('D')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const getItemsForHour = (hour: number) => {
      const hourEvents = eventsForDate.filter(e => 
        dayjs(e.startTime).hour() === hour
      );
      
      const hourScheduledTasks = scheduledTasksForDate.filter(t => {
        if (!t.startTime) return false;
        const taskHour = dayjs(t.startTime).hour();
        return taskHour === hour;
      });
      
      return [...hourEvents, ...hourScheduledTasks];
    };
    
    const getItemStyles = (item: CalendarEvent | Task) => {
      if ('startTime' in item && 'endTime' in item) {
        const event = item as CalendarEvent;
        return {
          backgroundColor: '#FF9500',
        };
      }
      
      const task = item as Task;
      if (task.duration) {
        const height = Math.max((task.duration / 60) * 60, 24);
        return {
          backgroundColor: '#007AFF',
          height,
        };
      }
      return {
        backgroundColor: '#007AFF',
      };
    };
    
    const getItemTitle = (item: CalendarEvent | Task) => {
      if ('startTime' in item && 'endTime' in item) {
        return (item as CalendarEvent).title;
      }
      return (item as Task).title;
    };
    
    return (
      <ScrollView style={styles.dayView}>
        {hours.map(hour => {
          const hourItems = getItemsForHour(hour);
          
          return (
            <View key={hour} style={styles.hourSlot}>
              <Text style={styles.hourText}>{hour.toString().padStart(2, '0')}:00</Text>
              <View style={styles.hourContent}>
                {hourItems.map(item => {
                  const isEvent = 'startTime' in item && 'endTime' in item;
                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      style={[
                        styles.eventBlock,
                        getItemStyles(item),
                        isEvent ? {} : { height: 'auto', minHeight: 24 }
                      ]}
                      onPress={() => {}}
                    >
                      <Text style={styles.eventTitle} numberOfLines={1}>
                        {getItemTitle(item)}
                        {!isEvent && (item as Task).duration && (
                          <Text style={styles.eventDuration}> ({(item as Task).duration}m)</Text>
                        )}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };
  
  const renderAgendaView = () => {
    const sortedItems = [...tasksForDate, ...eventsForDate].sort((a, b) => {
      const aTime = 'dueDate' in a ? a.dueDate : (a as CalendarEvent).startTime;
      const bTime = 'dueDate' in b ? b.dueDate : (b as CalendarEvent).startTime;
      return (aTime || '').localeCompare(bTime || '');
    });
    
    return (
      <FlatList
        data={sortedItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          if ('dueDate' in item) {
            return <TaskCard task={item as Task} onToggle={() => handleToggleTask(item as Task)} />;
          }
          const event = item as CalendarEvent;
          return (
            <View style={styles.agendaEvent}>
              <View style={styles.agendaEventTime}>
                <Text style={styles.agendaTimeText}>
                  {dayjs(event.startTime).format('HH:mm')}
                </Text>
                <Text style={styles.agendaDurationText}>
                  {dayjs(event.endTime).diff(dayjs(event.startTime), 'minute')}m
                </Text>
              </View>
              <View style={styles.agendaEventContent}>
                <Text style={styles.agendaEventTitle}>{event.title}</Text>
                {event.location && (
                  <Text style={styles.agendaEventLocation}>{event.location}</Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events for this day</Text>
          </View>
        }
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>{formatDate(selectedDate, 'MMMM YYYY')}</Text>
      </View>
      
      <View style={styles.viewToggle}>
        {(['day', 'week', 'month', 'agenda'] as ViewMode[]).map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.viewButton, viewMode === mode && styles.viewButtonActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[styles.viewButtonText, viewMode === mode && styles.viewButtonTextActive]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {viewMode === 'month' && (
        <Calendar
          current={selectedDate}
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#007AFF',
            selectedDayBackgroundColor: '#007AFF',
            arrowColor: '#007AFF',
          }}
          style={styles.calendar}
        />
      )}
      
      {viewMode === 'week' && renderWeekView()}
      
      <View style={styles.content}>
        <Text style={styles.dateHeader}>{formatDate(selectedDate, 'EEEE, MMMM D')}</Text>
        
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'agenda' && renderAgendaView()}
        {(viewMode === 'month' || viewMode === 'week') && (
          <ScrollView>
            {tasksForDate.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tasks</Text>
                {tasksForDate.map(task => (
                  <TaskCard key={task.id} task={task} onToggle={() => handleToggleTask(task)} />
                ))}
              </View>
            )}
            {eventsForDate.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Events</Text>
                {eventsForDate.map(event => (
                  <View key={event.id} style={styles.eventItem}>
                    <Text style={styles.eventTime}>
                      {dayjs(event.startTime).format('HH:mm')}
                    </Text>
                    <Text style={styles.eventName}>{event.title}</Text>
                  </View>
                ))}
              </View>
            )}
            {tasksForDate.length === 0 && eventsForDate.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nothing scheduled</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',

  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  viewButtonTextActive: {
    color: '#1C1C1E',
  },
  calendar: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  weekView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  weekDay: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  weekDaySelected: {
    backgroundColor: '#007AFF',
  },
  weekDayName: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  weekDayNameSelected: {
    color: '#FFFFFF',
  },
  weekDayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  weekDayNumberSelected: {
    color: '#FFFFFF',
  },
  weekDayToday: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  dayView: {
    flex: 1,
  },
  hourSlot: {
    flexDirection: 'row',
    minHeight: 60,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  hourText: {
    width: 50,
    fontSize: 12,
    color: '#8E8E93',
    padding: 8,
  },
  hourContent: {
    flex: 1,
    padding: 4,
  },
  eventBlock: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    padding: 4,
    marginBottom: 2,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  eventDuration: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.8,
  },
  section: {
    marginBottom: 16,
    paddingBottom: 100
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
  },
  eventTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    width: 60,
  },
  eventName: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  agendaEvent: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
  },
  agendaEventTime: {
    width: 60,
  },
  agendaTimeText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  agendaDurationText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  agendaEventContent: {
    flex: 1,
  },
  agendaEventTitle: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  agendaEventLocation: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
