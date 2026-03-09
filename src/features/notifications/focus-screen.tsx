import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  Vibration,
} from 'react-native';
import { useStore } from '../../store';
import { CircularProgress } from '../../components/ui';
import dayjs from 'dayjs';

type FocusMode = 'focus' | 'shortBreak' | 'longBreak';

export const FocusScreen: React.FC = () => {
  const { settings, startFocusSession, endFocusSession, focusSessions } = useStore();
  const [mode, setMode] = useState<FocusMode>('focus');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroDuration * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const today = dayjs().format('YYYY-MM-DD');
  const todaySessions = focusSessions.filter(s => 
    s.startTime.startsWith(today) && s.endTime
  );
  const totalFocusTime = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);
  
  const getDuration = (focusMode: FocusMode): number => {
    switch (focusMode) {
      case 'focus': return settings.pomodoroDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
    }
  };
  
  const handleStart = async () => {
    setIsActive(true);
    await startFocusSession();
  };
  
  const handlePause = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(getDuration(mode));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const handleSessionComplete = async () => {
    setIsActive(false);
    await endFocusSession();
    Vibration.vibrate([0, 500, 200, 500]);
    
    const completed = mode === 'focus' ? 'Focus' : 'Break';
    alert(`${completed} session complete!`);
  };
  
  const handleModeChange = (newMode: FocusMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(getDuration(newMode));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgress = (): number => {
    const total = getDuration(mode);
    return ((total - timeLeft) / total) * 100;
  };
  
  const getModeLabel = (focusMode: FocusMode): string => {
    switch (focusMode) {
      case 'focus': return 'Focus';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Focus Mode</Text>
        <Text style={styles.todayStats}>
          Today: {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m focused
        </Text>
      </View>
      
      <View style={styles.modeSelector}>
        {(['focus', 'shortBreak', 'longBreak'] as FocusMode[]).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.modeButton, mode === m && styles.modeButtonActive]}
            onPress={() => handleModeChange(m)}
          >
            <Text style={[styles.modeButtonText, mode === m && styles.modeButtonTextActive]}>
              {getModeLabel(m)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.timerContainer}>
        <CircularProgress
          progress={getProgress()}
          size={280}
          strokeWidth={12}
          color={mode === 'focus' ? '#007AFF' : '#34C759'}
        >
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.modeLabel}>{getModeLabel(mode)}</Text>
        </CircularProgress>
      </View>
      
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
            <Text style={styles.pauseButtonText}>Pause</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.sessionsInfo}>
        <Text style={styles.sessionsTitle}>Today's Sessions</Text>
        <Text style={styles.sessionsCount}>{todaySessions.length} sessions completed</Text>
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
  todayStats: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  modeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: '#1C1C1E',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '200',
    color: '#1C1C1E',
  },
  modeLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  resetButtonText: {
    color: '#1C1C1E',
    fontSize: 18,
    fontWeight: '600',
  },
  sessionsInfo: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  sessionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  sessionsCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
});
