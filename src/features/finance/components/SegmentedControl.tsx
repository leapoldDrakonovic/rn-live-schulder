import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onChange }: SegmentedControlProps) {
  const [translateX] = useState(() => new Animated.Value(selectedIndex));

  const handlePress = (index: number) => {
    Animated.spring(translateX, {
      toValue: index,
      useNativeDriver: true,
      bounciness: 8,
    }).start();
    onChange(index);
  };

  const segmentWidth = 100 / segments.length;

  return (
    <View style={styles.container}>
      <View style={styles.segmentContainer}>
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              width: `${segmentWidth}%`,
              transform: [{ translateX }],
            },
          ]}
        />
        {segments.map((segment, index) => (
          <TouchableOpacity
            key={segment}
            style={styles.segment}
            onPress={() => handlePress(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                selectedIndex === index && styles.activeText,
              ]}
            >
              {segment}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 2,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeText: {
    color: '#000000',
    fontWeight: '600',
  },
});
