import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/use-color-scheme';
import { useStore } from '../src/store';
import { FinanceScreen } from '../src/features/finance/screens/FinanceScreen';

const TOP_TABS = ['Planner', 'Finance', 'Settings'];

export default function RootLayout() {
  const colorScheme = useColorScheme() || 'light';
  const { initialize, isLoading, initError, settings } = useStore();
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    initialize();
  }, []);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.tabContainer}>
            {TOP_TABS.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === index && styles.activeTab]}
                onPress={() => setActiveTab(index)}
              >
                <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.content}>
          {activeTab === 0 && (
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen 
                name="notes" 
                options={{ presentation: 'modal', headerShown: false }} 
              />
              <Stack.Screen 
                name="analytics" 
                options={{ presentation: 'modal', headerShown: false }} 
              />
              <Stack.Screen 
                name="settings" 
                options={{ presentation: 'modal', headerShown: false }} 
              />
            </Stack>
          )}
          
          {activeTab === 1 && <FinanceScreen />}
          
          {activeTab === 2 && (
            <SettingsContent colorScheme={colorScheme} />
          )}
        </View>
      </View>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

function SettingsContent({ colorScheme }: { colorScheme: string }) {
  const isDark = colorScheme === 'dark';
  
  return (
    <ScrollView style={[styles.settingsContainer, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={[styles.settingsSection, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        <Text style={[styles.settingsTitle, { color: isDark ? '#FFF' : '#000' }]}>Appearance</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: isDark ? '#FFF' : '#000' }]}>Theme</Text>
          <Text style={styles.settingValue}>{colorScheme === 'dark' ? 'Dark' : 'Light'}</Text>
        </View>
      </View>
      
      <View style={[styles.settingsSection, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        <Text style={[styles.settingsTitle, { color: isDark ? '#FFF' : '#000' }]}>Data</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: isDark ? '#FFF' : '#000' }]}>Export Data</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>Clear All Data</Text>
        </View>
      </View>
      
      <View style={[styles.settingsSection, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        <Text style={[styles.settingsTitle, { color: isDark ? '#FFF' : '#000' }]}>About</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: isDark ? '#FFF' : '#000' }]}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#F2F2F7',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  settingsContainer: {
    flex: 1,
    padding: 16,
  },
  settingsSection: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
