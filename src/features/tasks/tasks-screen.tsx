import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskCard } from '../../components/ui';
import { useStore } from '../../store';
import { Task, TaskFilter } from '../../types';

const filterOptions: { key: TaskFilter | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'week', label: 'This Week' },
  { key: 'no-date', label: 'No Date' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'high-priority', label: 'High Priority' },
];

export const TasksScreen: React.FC = () => {
  const { 
    tasks, 
    currentFilter, 
    setFilter, 
    setTaskStatus,
  } = useStore();
  
  const filteredTasks = tasks.filter(t => t.status !== 'archived');
  
  const handleToggleTask = (taskId: string, currentStatus: Task['status']) => {
    const newStatus = currentStatus === 'done' ? 'inbox' : 'done';
    setTaskStatus(taskId, newStatus);
  };
  
  const getFilteredTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    
    switch (currentFilter) {
      case 'today':
        return filteredTasks.filter(t => t.dueDate && t.dueDate.startsWith(today));
      case 'tomorrow':
        return filteredTasks.filter(t => t.dueDate && t.dueDate.startsWith(tomorrow));
      case 'week':
        return filteredTasks.filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= weekFromNow);
      case 'no-date':
        return filteredTasks.filter(t => !t.dueDate);
      case 'overdue':
        return filteredTasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done');
      case 'high-priority':
        return filteredTasks.filter(t => t.priority === 'high' || t.priority === 'critical');
      default:
        return filteredTasks;
    }
  };
  
  const displayTasks = getFilteredTasks();
  const doneCount = displayTasks.filter(t => t.status === 'done').length;
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.subtitle}>{displayTasks.length} tasks • {doneCount} done</Text>
      </View>
      
      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                (item.key === 'all' ? currentFilter === 'today' : currentFilter === item.key) && styles.filterButtonActive
              ]}
              onPress={() => setFilter(item.key as TaskFilter)}
            >
              <Text style={[
                styles.filterText,
                (item.key === 'all' ? currentFilter === 'today' : currentFilter === item.key) && styles.filterTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersContent}
        />
      </View>
      
      <FlatList
        data={displayTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={() => handleToggleTask(item.id, item.status)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        }
      />
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
  filters: {
    marginBottom: 10,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingBottom: 20,
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
