import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TagChipProps {
  name: string;
  color: string;
  onPress?: () => void;
  onRemove?: () => void;
  selected?: boolean;
}

export const TagChip: React.FC<TagChipProps> = ({ name, color, onPress, onRemove, selected }) => {
  const Chip = onPress ? TouchableOpacity : View;
  
  return (
    <Chip 
      style={[
        styles.chip, 
        { backgroundColor: selected ? color : `${color}20` },
        { borderColor: color }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: selected ? '#FFFFFF' : color }]}>{name}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={[styles.removeText, { color: selected ? '#FFFFFF' : color }]}>×</Text>
        </TouchableOpacity>
      )}
    </Chip>
  );
};

interface TagSelectorProps {
  tags: { id: string; name: string; color: string }[];
  selectedTags: string[];
  onToggle: (tagId: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ tags, selectedTags, onToggle }) => {
  return (
    <View style={styles.selector}>
      {tags.map(tag => (
        <TagChip
          key={tag.id}
          name={tag.name}
          color={tag.color}
          selected={selectedTags.includes(tag.id)}
          onPress={() => onToggle(tag.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 4,
  },
  removeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
