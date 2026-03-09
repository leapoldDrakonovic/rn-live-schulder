import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store';
import { UserSettings } from '../../types';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useStore();
  
  const SettingRow: React.FC<{
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }> = ({ label, value, onPress, rightElement }) => (
    <TouchableOpacity 
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      {rightElement || (value && <Text style={styles.settingValue}>{value}</Text>)}
    </TouchableOpacity>
  );
  
  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ 
    title, 
    children 
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <SettingSection title="Appearance">
          <SettingRow 
            label="Theme"
            value={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
            onPress={() => {
              const themes: UserSettings['theme'][] = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(settings.theme);
              const nextIndex = (currentIndex + 1) % themes.length;
              updateSettings({ theme: themes[nextIndex] });
            }}
          />
        </SettingSection>
        
        <SettingSection title="Notifications">
          <SettingRow 
            label="Push Notifications"
            rightElement={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              />
            }
          />
          <SettingRow 
            label="Default Reminder"
            value={`${settings.defaultReminder} min`}
            onPress={() => {
              const options = [5, 10, 15, 30, 60];
              const currentIndex = options.indexOf(settings.defaultReminder);
              const nextIndex = (currentIndex + 1) % options.length;
              updateSettings({ defaultReminder: options[nextIndex] });
            }}
          />
        </SettingSection>
        
        <SettingSection title="Work Hours">
          <SettingRow 
            label="Start Time"
            value={settings.workHoursStart}
            onPress={() => {
              const times = ['06:00', '07:00', '08:00', '09:00', '10:00'];
              const currentIndex = times.indexOf(settings.workHoursStart);
              const nextIndex = (currentIndex + 1) % times.length;
              updateSettings({ workHoursStart: times[nextIndex] });
            }}
          />
          <SettingRow 
            label="End Time"
            value={settings.workHoursEnd}
            onPress={() => {
              const times = ['16:00', '17:00', '18:00', '19:00', '20:00'];
              const currentIndex = times.indexOf(settings.workHoursEnd);
              const nextIndex = (currentIndex + 1) % times.length;
              updateSettings({ workHoursEnd: times[nextIndex] });
            }}
          />
          <SettingRow 
            label="Time Format"
            value={settings.timeFormat === '24h' ? '24 hour' : '12 hour'}
            onPress={() => {
              updateSettings({ 
                timeFormat: settings.timeFormat === '24h' ? '12h' : '24h' 
              });
            }}
          />
        </SettingSection>
        
        <SettingSection title="Focus Mode">
          <SettingRow 
            label="Pomodoro Duration"
            value={`${settings.pomodoroDuration} min`}
            onPress={() => {
              const durations = [15, 25, 30, 45, 60];
              const currentIndex = durations.indexOf(settings.pomodoroDuration);
              const nextIndex = (currentIndex + 1) % durations.length;
              updateSettings({ pomodoroDuration: durations[nextIndex] });
            }}
          />
          <SettingRow 
            label="Short Break"
            value={`${settings.shortBreakDuration} min`}
            onPress={() => {
              const durations = [3, 5, 10, 15];
              const currentIndex = durations.indexOf(settings.shortBreakDuration);
              const nextIndex = (currentIndex + 1) % durations.length;
              updateSettings({ shortBreakDuration: durations[nextIndex] });
            }}
          />
          <SettingRow 
            label="Long Break"
            value={`${settings.longBreakDuration} min`}
            onPress={() => {
              const durations = [10, 15, 20, 30];
              const currentIndex = durations.indexOf(settings.longBreakDuration);
              const nextIndex = (currentIndex + 1) % durations.length;
              updateSettings({ longBreakDuration: durations[nextIndex] });
            }}
          />
        </SettingSection>
        
        <SettingSection title="Data">
          <SettingRow 
            label="Export Data"
            onPress={() => {
              console.log('Export data');
            }}
          />
          <SettingRow 
            label="Backup"
            onPress={() => {
              console.log('Backup');
            }}
          />
        </SettingSection>
        
        <SettingSection title="About">
          <SettingRow 
            label="Version"
            value="1.0.0"
          />
        </SettingSection>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
