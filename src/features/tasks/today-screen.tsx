import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateTimePickerField, DurationPicker, Input, PrioritySelector, TaskCard } from '../../components/ui';
import { useStore } from '../../store';
import { Task, TaskPriority } from '../../types';
import { formatDate, getGreeting, parseQuickAdd } from '../../utils';

export const TodayScreen: React.FC = () => {
  const tasks = useStore((state) => state.tasks);
  const addTask = useStore((state) => state.addTask);
  const setTaskStatus = useStore((state) => state.setTaskStatus);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string | null>(dayjs().toISOString());
  const [newTaskStartTime, setNewTaskStartTime] = useState<string | null>(null);
  const [newTaskDuration, setNewTaskDuration] = useState<number | null>(null);
  
  const today = dayjs().format('YYYY-MM-DD');
  const todayTasks = tasks.filter(t => 
    t.dueDate && dayjs(t.dueDate).format('YYYY-MM-DD') === today && t.status !== 'archived'
  );
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return dayjs(t.dueDate).format('YYYY-MM-DD') < today && t.status !== 'done' && t.status !== 'archived';
  });
  
  const handleQuickAdd = () => {
    if (!quickAddText.trim()) return;
    
    const parsed = parseQuickAdd(quickAddText);
    addTask({
      title: parsed.title,
      description: '',
      dueDate: parsed.dueDate || dayjs().toISOString(),
      startTime: null,
      duration: null,
      priority: parsed.priority as TaskPriority,
      status: 'inbox',
      tags: [],
      projectId: null,
      repeatRule: null,
      reminder: null,
      estimatedTime: null,
      actualTime: null,
      energyLevelRequired: null,
      subtasks: [],
    });
    setQuickAddText('');
  };
  
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    addTask({
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: newTaskDueDate,
      startTime: newTaskStartTime,
      duration: newTaskDuration,
      priority: newTaskPriority,
      status: 'inbox',
      tags: [],
      projectId: null,
      repeatRule: null,
      reminder: null,
      estimatedTime: null,
      actualTime: null,
      energyLevelRequired: null,
      subtasks: [],
    });
    
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskDueDate(dayjs().toISOString());
    setNewTaskStartTime(null);
    setNewTaskDuration(null);
    setShowAddModal(false);
  };
  
  const handleToggleTask = (taskId: string, currentStatus: Task['status']) => {
    const newStatus = currentStatus === 'done' ? 'inbox' : 'done';
    setTaskStatus(taskId, newStatus);
  };
  
  const completedCount = todayTasks.filter(t => t.status === 'done').length;
  const totalCount = todayTasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  return (
      <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{formatDate(dayjs().toISOString(), 'dddd, MMMM D')}</Text>
        </View>
        
        <View style={styles.quickAddContainer}>
          <TextInput
            style={styles.quickAddInput}
            placeholder="Quick add task..."
            placeholderTextColor="#8E8E93"
            value={quickAddText}
            onChangeText={setQuickAddText}
            onSubmitEditing={handleQuickAdd}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={styles.quickAddButton}
            onPress={handleQuickAdd}
          >
            <Text style={styles.quickAddButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        {todayTasks.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today{"'"}s Progress</Text>
              <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}
        
        {overdueTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Overdue ({overdueTasks.length})</Text>
            {overdueTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => handleToggleTask(task.id, task.status)}
              />
            ))}
          </View>
        )}
        
        <View style={styles.sectionToday}>
          <Text style={styles.sectionTitle}>📋 Today</Text>
          {todayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tasks for today</Text>
              <Text style={styles.emptySubtext}>Add a task to get started</Text>
            </View>
          ) : (
            todayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => handleToggleTask(task.id, task.status)}
              />
            ))
          )}
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Task</Text>
              <TouchableOpacity onPress={handleAddTask}>
                <Text style={styles.saveText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <Input
                label="Title"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="What needs to be done?"
                autoFocus
              />
              
              <Input
                label="Description"
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                placeholder="Add details..."
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.formField}>
                <Text style={styles.label}>Priority</Text>
                <PrioritySelector
                  value={newTaskPriority}
                  onChange={setNewTaskPriority}
                />
              </View>
              
              <DateTimePickerField
                label="Due Date"
                value={newTaskDueDate}
                onChange={setNewTaskDueDate}
                mode="date"
                placeholder="Select date"
              />
              
              <DateTimePickerField
                label="Start Time (optional)"
                value={newTaskStartTime}
                onChange={setNewTaskStartTime}
                mode="time"
                placeholder="Select start time"
              />
              
              {newTaskStartTime && (
                <DurationPicker
                  label="Duration (optional)"
                  value={newTaskDuration}
                  onChange={setNewTaskDuration}
                  placeholder="Select duration"
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  date: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  quickAddContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAddInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  quickAddButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  progressSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  progressCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionToday: {
    marginBottom: 16,
    paddingBottom: 100
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cancelText: {
    fontSize: 17,
    color: '#8E8E93',
  },
  saveText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalForm: {
    padding: 16,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
});
