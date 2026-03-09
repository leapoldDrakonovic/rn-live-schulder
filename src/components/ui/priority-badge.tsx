import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TaskPriority } from '../../types';
import { getPriorityColor } from '../../utils';

interface PriorityBadgeProps {
  priority: TaskPriority;
  onPress?: () => void;
}

const priorityLabels: Record<TaskPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, onPress }) => {
  const color = getPriorityColor(priority);
  
  const Badge = onPress ? TouchableOpacity : View;
  
  return (
    <Badge 
      style={[styles.badge, { backgroundColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{priorityLabels[priority]}</Text>
    </Badge>
  );
};

interface PrioritySelectorProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange }) => {
  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical'];
  
  return (
    <View style={styles.selector}>
      {priorities.map(priority => (
        <TouchableOpacity
          key={priority}
          style={[
            styles.option,
            value === priority && { backgroundColor: getPriorityColor(priority) },
          ]}
          onPress={() => onChange(priority)}
        >
          <Text style={[
            styles.optionText,
            value === priority && styles.optionTextSelected,
          ]}>
            {priorityLabels[priority]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  selector: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  optionText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
});
