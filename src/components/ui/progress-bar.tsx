import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
  progress: number;
  color?: string;
  showLabel?: boolean;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#007AFF',
  showLabel = false,
  height = 8,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>{Math.round(clampedProgress)}%</Text>
      )}
      <View style={[styles.track, { height }]}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${clampedProgress}%`, 
              backgroundColor: color,
              height,
            }
          ]} 
        />
      </View>
    </View>
  );
};

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 60,
  strokeWidth = 6,
  color = '#007AFF',
  showLabel = true,
  children,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
  
  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <View style={styles.circularTrack}>
        <View 
          style={[
            styles.circularFill,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: clampedProgress > 25 ? color : 'transparent',
              borderRightColor: clampedProgress > 50 ? color : 'transparent',
              borderBottomColor: clampedProgress > 75 ? color : 'transparent',
              borderLeftColor: clampedProgress > 0 ? color : 'transparent',
              transform: [{ rotate: '-90deg' }],
            }
          ]}
        />
      </View>
      {children || (showLabel && (
        <Text style={styles.circularLabel}>{Math.round(clampedProgress)}%</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    textAlign: 'right',
  },
  track: {
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularTrack: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularFill: {
    position: 'absolute',
  },
  circularLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});
