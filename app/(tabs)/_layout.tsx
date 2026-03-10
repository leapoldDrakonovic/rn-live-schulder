import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, Text } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { StyleSheet } from "react-native";

const HapticTab = (props: any) => {
  return (
    <Pressable
      {...props}
      onPress={(e) => {
        if (Platform.OS === 'ios') {
          Haptics.selectionAsync();
        } else {
          Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Keyboard_Tap)
        }
        props.onPress?.(e);
      }}
    />
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    
    
    <Tabs
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarActiveTintColor: "#3333",
        headerShown: false,
       
        tabBarStyle: {
          position: 'absolute',

          backgroundColor: "#FFFFFF",
          borderTopColor: '#E5E5EA',

          height: 58,        // меньше высота
          paddingTop: 6,
          width: "78%",

          borderRadius: 30,  // сильнее скругление
          marginLeft: 5,
          left: 20,          // отступы по бокам
          right: 20,
          bottom: 20,        // подняли выше

          elevation: 0,      // убрать тень Android
        },

        tabBarLabelStyle: {
          fontSize: 10,      // немного меньше
          fontWeight: '500',
          backgroundColor: "#FFFFFF",
        },

        
        tabBarButton: HapticTab,
      }}>

        
       
      <Tabs.Screen
        name="today"
        options={{
          title: Platform.OS === "ios" ? "" : 'Today',
          tabBarIcon: ({ color }) => <TabIcon name="today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: Platform.OS === "ios" ? "" : 'Tasks',
          tabBarIcon: ({ color }) => <TabIcon name="tasks" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: Platform.OS === "ios" ? "" : 'Calendar',
          tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: Platform.OS === "ios" ? "" : 'Habits',
          tabBarIcon: ({ color }) => <TabIcon name="habits" color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: Platform.OS === "ios" ? "" : 'Goals',
          tabBarIcon: ({ color }) => <TabIcon name="goals" color={color} />,
        }}
      />
    </Tabs>
  );
}

const TabIcon: React.FC<{ name: string; color: string }> = ({ name }) => {
  const icons: Record<string, string> = {
    today: '📋',
    tasks: '✅',
    calendar: '📅',
    habits: '🔥',
    goals: '🎯',
  };
  
  return <Text style={{ fontSize: 22 }}>{icons[name] || '●'}</Text>;
};


const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,

    height: 70,

    borderRadius: 35,

    borderTopWidth: 0,

    backgroundColor: "rgba(255,255,255,0.7)",

    elevation: 0,
  },
});