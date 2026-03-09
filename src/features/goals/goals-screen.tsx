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
import { Input, ProgressBar } from '../../components/ui';
import { useStore } from '../../store';
import { Goal, GoalType } from '../../types';
import { formatDate } from '../../utils';

export const GoalsScreen: React.FC = () => {
  const { goals, addGoal, updateGoal, removeGoal } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalType, setNewGoalType] = useState<GoalType>('yearly');
  const [newGoalDeadline, setNewGoalDeadline] = useState(dayjs().add(30, 'day').format('YYYY-MM-DD'));
  
  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return;
    
    addGoal({
      title: newGoalTitle,
      description: newGoalDescription,
      category: '',
      type: newGoalType,
      deadline: dayjs(newGoalDeadline).toISOString(),
      milestones: [],
      linkedTasks: [],
    });
    
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalType('yearly');
    setNewGoalDeadline(dayjs().add(30, 'day').format('YYYY-MM-DD'));
    setShowModal(false);
  };
  
  const getGoalTypeLabel = (type: GoalType) => {
    switch (type) {
      case 'yearly': return 'Yearly';
      case 'quarterly': return 'Quarterly';
      case 'monthly': return 'Monthly';
      case 'long-term': return 'Long-term';
    }
  };
  
  const getGoalTypeColor = (type: GoalType) => {
    switch (type) {
      case 'yearly': return '#007AFF';
      case 'quarterly': return '#5856D6';
      case 'monthly': return '#FF9500';
      case 'long-term': return '#34C759';
    }
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#34C759';
    if (progress >= 50) return '#FF9500';
    return '#FF3B30';
  };
  
  const renderGoalItem = ({ item }: { item: Goal }) => {
    const daysLeft = dayjs(item.deadline).diff(dayjs(), 'day');
    const isOverdue = daysLeft < 0;
    
    return (
      <TouchableOpacity 
        style={styles.goalCard}
        onPress={() => setSelectedGoal(item)}
      >
        <View style={styles.goalHeader}>
          <View style={[
            styles.goalTypeBadge, 
            { backgroundColor: getGoalTypeColor(item.type) }
          ]}>
            <Text style={styles.goalTypeText}>{getGoalTypeLabel(item.type)}</Text>
          </View>
          <TouchableOpacity onPress={() => removeGoal(item.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.goalTitle}>{item.title}</Text>
        
        {item.description && (
          <Text style={styles.goalDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressValue, { color: getProgressColor(item.progress) }]}>
              {item.progress}%
            </Text>
          </View>
          <ProgressBar 
            progress={item.progress} 
            color={getProgressColor(item.progress)}
          />
        </View>
        
        <View style={styles.goalFooter}>
          <Text style={[
            styles.deadlineText,
            isOverdue && styles.overdueText
          ]}>
            {isOverdue 
              ? `Overdue by ${Math.abs(daysLeft)} days`
              : `${daysLeft} days left`
            }
          </Text>
          <Text style={styles.deadlineDate}>
            Due {formatDate(item.deadline)}
          </Text>
        </View>
        
        {item.milestones.length > 0 && (
          <View style={styles.milestonesSection}>
            <Text style={styles.milestonesTitle}>
              Milestones ({item.milestones.filter(m => m.progress === 100).length}/{item.milestones.length})
            </Text>
            <View style={styles.milestonesList}>
              {item.milestones.slice(0, 3).map(milestone => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <View style={[
                    styles.milestoneDot,
                    milestone.progress === 100 && styles.milestoneDotCompleted
                  ]} />
                  <Text style={styles.milestoneText}>{milestone.title}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <Text style={styles.subtitle}>
          {goals.filter(g => g.progress === 100).length}/{goals.length} completed
        </Text>
      </View>
      
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        renderItem={renderGoalItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>Set your first goal to start achieving</Text>
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
            <Text style={styles.modalTitle}>New Goal</Text>
            <TouchableOpacity onPress={handleAddGoal}>
              <Text style={styles.saveText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalForm}>
            <Input
              label="Goal Title"
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
              placeholder="What do you want to achieve?"
              autoFocus
            />
            
            <Input
              label="Description"
              value={newGoalDescription}
              onChangeText={setNewGoalDescription}
              placeholder="Describe your goal..."
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.formField}>
              <Text style={styles.label}>Goal Type</Text>
              <View style={styles.typeSelector}>
                {(['yearly', 'quarterly', 'monthly', 'long-term'] as GoalType[]).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newGoalType === type && styles.typeButtonActive,
                      { borderColor: getGoalTypeColor(type) }
                    ]}
                    onPress={() => setNewGoalType(type)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      { color: getGoalTypeColor(type) }
                    ]}>
                      {getGoalTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <Input
              label="Deadline"
              value={newGoalDeadline}
              onChangeText={setNewGoalDeadline}
              placeholder="YYYY-MM-DD"
            />
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
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  goalTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  overdueText: {
    color: '#FF3B30',
  },
  deadlineDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  milestonesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  milestonesList: {
    gap: 6,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
    marginRight: 8,
  },
  milestoneDotCompleted: {
    backgroundColor: '#34C759',
  },
  milestoneText: {
    fontSize: 14,
    color: '#8E8E93',
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  typeButtonActive: {
    backgroundColor: '#F2F2F7',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
