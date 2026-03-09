import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useStore } from '../../store';
import { ProgressBar, CircularProgress } from '../../components/ui';
import { getDurationString, getProgressColor } from '../../utils';
import dayjs from 'dayjs';

export const AnalyticsScreen: React.FC = () => {
  const { tasks, habits, goals, focusSessions } = useStore();
  
  const today = dayjs().format('YYYY-MM-DD');
  const thisWeek = dayjs().startOf('week').format('YYYY-MM-DD');
  const thisMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  
  const tasksCompletedToday = tasks.filter(t => 
    t.status === 'done' && t.updatedAt.startsWith(today)
  ).length;
  
  const tasksCreatedToday = tasks.filter(t => 
    t.createdAt.startsWith(today)
  ).length;
  
  const tasksCompletedThisWeek = tasks.filter(t => 
    t.status === 'done' && t.updatedAt >= thisWeek
  ).length;
  
  const tasksCompletedThisMonth = tasks.filter(t => 
    t.status === 'done' && t.updatedAt >= thisMonth
  ).length;
  
  const totalTasks = tasks.filter(t => t.status !== 'archived').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const habitsCompletedToday = habits.filter(h => 
    h.completionHistory.includes(today)
  ).length;
  
  const avgHabitStreak = habits.length > 0 
    ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length)
    : 0;
  
  const goalsCompleted = goals.filter(g => g.progress === 100).length;
  const goalsInProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length;
  const avgGoalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0;
  
  const focusSessionsToday = focusSessions.filter(s => 
    s.startTime.startsWith(today) && s.endTime
  );
  
  const focusTimeToday = focusSessionsToday.reduce((acc, s) => acc + s.duration, 0);
  
  const focusSessionsThisWeek = focusSessions.filter(s => 
    s.startTime >= thisWeek && s.endTime
  );
  
  const focusTimeThisWeek = focusSessionsThisWeek.reduce((acc, s) => acc + s.duration, 0);
  
  const getWeekDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      const completed = tasks.filter(t => 
        t.status === 'done' && t.updatedAt.startsWith(dateStr)
      ).length;
      days.push({ day: date.format('ddd'), count: completed });
    }
    return days;
  };
  
  const weekData = getWeekDays();
  const maxCount = Math.max(...weekData.map(d => d.count), 1);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your productivity overview</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{tasksCompletedToday}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{tasksCompletedThisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{tasksCompletedThisMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Completion</Text>
          <View style={styles.card}>
            <View style={styles.progressRow}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Completion Rate</Text>
                <Text style={styles.progressValue}>{taskCompletionRate}%</Text>
              </View>
              <CircularProgress 
                progress={taskCompletionRate} 
                size={60}
                color={getProgressColor(taskCompletionRate)}
              />
            </View>
            <ProgressBar 
              progress={taskCompletionRate} 
              color={getProgressColor(taskCompletionRate)}
              height={8}
            />
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>{completedTasks} completed</Text>
              <Text style={styles.statsText}>{totalTasks - completedTasks} remaining</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.card}>
            <View style={styles.chartContainer}>
              {weekData.map((day, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.bar, 
                        { height: `${(day.count / maxCount) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barLabel}>{day.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Time</Text>
          <View style={styles.focusCards}>
            <View style={styles.focusCard}>
              <Text style={styles.focusValue}>{getDurationString(focusTimeToday)}</Text>
              <Text style={styles.focusLabel}>Today</Text>
            </View>
            <View style={styles.focusCard}>
              <Text style={styles.focusValue}>{getDurationString(focusTimeThisWeek)}</Text>
              <Text style={styles.focusLabel}>This Week</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habits</Text>
          <View style={styles.card}>
            <View style={styles.habitStats}>
              <View style={styles.habitStat}>
                <Text style={styles.habitStatValue}>{habitsCompletedToday}</Text>
                <Text style={styles.habitStatLabel}>Completed Today</Text>
              </View>
              <View style={styles.habitStat}>
                <Text style={styles.habitStatValue}>{avgHabitStreak}</Text>
                <Text style={styles.habitStatLabel}>Avg. Streak</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <View style={styles.card}>
            <View style={styles.goalStats}>
              <View style={styles.goalStat}>
                <Text style={styles.goalStatValue}>{goalsCompleted}</Text>
                <Text style={styles.goalStatLabel}>Completed</Text>
              </View>
              <View style={styles.goalStat}>
                <Text style={styles.goalStatValue}>{goalsInProgress}</Text>
                <Text style={styles.goalStatLabel}>In Progress</Text>
              </View>
              <View style={styles.goalStat}>
                <Text style={styles.goalStatValue}>{avgGoalProgress}%</Text>
                <Text style={styles.goalStatLabel}>Avg. Progress</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statsText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: 20,
    justifyContent: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
  },
  focusCards: {
    flexDirection: 'row',
    gap: 12,
  },
  focusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  focusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  focusLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  habitStat: {
    alignItems: 'center',
  },
  habitStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  habitStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  goalStat: {
    alignItems: 'center',
  },
  goalStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5856D6',
  },
  goalStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
});
