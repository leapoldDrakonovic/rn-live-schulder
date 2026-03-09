import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui';
import { useStore } from '../../store';
import { Habit, HabitDifficulty, HabitFrequency } from '../../types';

export const HabitsScreen: React.FC = () => {
  const { habits, addHabit, updateHabit, removeHabit, completeHabit, uncompleteHabit } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState<HabitFrequency>('daily');
  const [newHabitDifficulty, setNewHabitDifficulty] = useState<HabitDifficulty>('medium');
  
  const today = dayjs().format('YYYY-MM-DD');
  
  const handleAddHabit = () => {
    if (!newHabitTitle.trim()) return;
    
    addHabit({
      title: newHabitTitle,
      frequency: newHabitFrequency,
      frequencyDays: [],
      reminders: [],
      difficulty: newHabitDifficulty,
    });
    
    setNewHabitTitle('');
    setNewHabitFrequency('daily');
    setNewHabitDifficulty('medium');
    setShowModal(false);
  };
  
  const handleToggleHabit = (habit: Habit) => {
    if (habit.completionHistory.includes(today)) {
      uncompleteHabit(habit.id, today);
    } else {
      completeHabit(habit.id, today);
    }
  };
  
  const getDifficultyColor = (difficulty: HabitDifficulty) => {
    switch (difficulty) {
      case 'easy': return '#34C759';
      case 'medium': return '#FF9500';
      case 'hard': return '#FF3B30';
    }
  };
  
  const renderHabitItem = ({ item }: { item: Habit }) => {
    const isCompletedToday = item.completionHistory.includes(today);
    
    return (
      <TouchableOpacity 
        style={styles.habitCard}
        onPress={() => handleToggleHabit(item)}
      >
        <View style={styles.habitMain}>
          <View style={[
            styles.checkCircle,
            isCompletedToday && styles.checkCircleCompleted
          ]}>
            {isCompletedToday && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.habitInfo}>
            <Text style={[styles.habitTitle, isCompletedToday && styles.habitTitleCompleted]}>
              {item.title}
            </Text>
            <View style={styles.habitMeta}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>
              <Text style={styles.streakText}>🔥 {item.streak} day streak</Text>
            </View>
          </View>
        </View>
        <View style={styles.weekStrip}>
          {Array.from({ length: 7 }, (_, i) => {
            const date = dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD');
            const isCompleted = item.completionHistory.includes(date);
            const isToday = i === 6;
            
            return (
              <View 
                key={date} 
                style={[
                  styles.weekDay,
                  isCompleted && styles.weekDayCompleted,
                  isToday && styles.weekDayToday,
                ]}
              >
                <Text style={[
                  styles.weekDayText,
                  isCompleted && styles.weekDayTextCompleted,
                ]}>
                  {dayjs(date).format('d')}
                </Text>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Habits</Text>
        <Text style={styles.subtitle}>
          {habits.filter(h => h.completionHistory.includes(today)).length}/{habits.length} completed today
        </Text>
      </View>
      
      <FlatList
        data={habits}
        keyExtractor={item => item.id}
        renderItem={renderHabitItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>Create your first habit to get started</Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Habit</Text>
            <TouchableOpacity onPress={handleAddHabit}>
              <Text style={styles.saveText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalForm}>
            <Input
              label="Habit Name"
              value={newHabitTitle}
              onChangeText={setNewHabitTitle}
              placeholder="e.g., Exercise, Read, Meditate"
              autoFocus
            />
            
            <View style={styles.formField}>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.optionGroup}>
                {(['daily', 'weekly', 'custom'] as HabitFrequency[]).map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.optionButton,
                      newHabitFrequency === freq && styles.optionButtonActive
                    ]}
                    onPress={() => setNewHabitFrequency(freq)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      newHabitFrequency === freq && styles.optionButtonTextActive
                    ]}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.optionGroup}>
                {(['easy', 'medium', 'hard'] as HabitDifficulty[]).map(diff => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.optionButton,
                      newHabitDifficulty === diff && styles.optionButtonActive
                    ]}
                    onPress={() => setNewHabitDifficulty(diff)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      newHabitDifficulty === diff && styles.optionButtonTextActive
                    ]}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
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
  list: {
    padding: 16,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkCircleCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  habitTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  streakText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 4,
  },
  weekDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDayCompleted: {
    backgroundColor: '#34C759',
  },
  weekDayToday: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  weekDayText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  weekDayTextCompleted: {
    color: '#FFFFFF',
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
});
