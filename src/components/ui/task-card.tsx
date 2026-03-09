import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { getPriorityColor, getStatusColor, getRelativeDate, formatTime } from '../../utils';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onToggle?: () => void;
}

const priorityLabels: Record<TaskPriority, string> = {
  critical: '!!!',
  high: '!!',
  medium: '!',
  low: '',
};

const statusLabels: Record<TaskStatus, string> = {
  inbox: 'Inbox',
  planned: 'Planned',
  in_progress: 'In Progress',
  done: 'Done',
  archived: 'Archived',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onToggle }) => {
  const isCompleted = task.status === 'done';
  
  return (
    <TouchableOpacity 
      style={[styles.container, isCompleted && styles.completed]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        style={[
          styles.checkbox, 
          isCompleted && styles.checkboxCompleted,
          { borderColor: getPriorityColor(task.priority) }
        ]} 
        onPress={onToggle}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={1}>
            {task.title}
          </Text>
          {task.priority !== 'low' && (
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
              <Text style={styles.priorityText}>{priorityLabels[task.priority]}</Text>
            </View>
          )}
        </View>
        
        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        
        <View style={styles.footer}>
          {task.dueDate && (
            <View style={styles.metaItem}>
              <Text style={[
                styles.metaText, 
                getRelativeDate(task.dueDate) === 'Overdue' && styles.overdueText
              ]}>
                {getRelativeDate(task.dueDate)}
                {task.dueDate.includes('T') ? ` ${formatTime(task.dueDate)}` : ''}
              </Text>
            </View>
          )}
          
          {task.subtasks.length > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
              </Text>
            </View>
          )}
          
          {task.estimatedTime && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>⏱ {task.estimatedTime}m</Text>
            </View>
          )}
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
            <Text style={styles.statusText}>{statusLabels[task.status]}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completed: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  overdueText: {
    color: '#FF3B30',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
});
