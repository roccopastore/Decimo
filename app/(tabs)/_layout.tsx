import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    border: isDark ? '#2C2C2E' : '#E5E5EA',
    active: '#007AFF',
    inactive: '#8E8E93',
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 88 : 60, // Altezza standard
          position: 'absolute',
        },
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarShowLabel: true, // Mostra le label per gli altri
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Partite',
          tabBarIcon: ({ color }) => <Ionicons name="football" size={24} color={color} />,
        }}
      />

      {/* --- BOTTONE PUBLISH PERSONALIZZATO --- */}
      <Tabs.Screen
        name="publish"
        options={{
          title: '', // Nessun testo
          tabBarLabel: () => null, // Rimuove spazio label
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 56, 
              height: 56, 
              borderRadius: 28, 
              marginBottom: 30, // Lo fa "galleggiare" sopra la bar
              shadowColor: "#007AFF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <LinearGradient
                colors={['#007AFF', '#5AC8FA']}
                style={{
                  flex: 1,
                  borderRadius: 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="add" size={32} color="white" />
              </LinearGradient>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="teams"
        options={{
          title: 'Squadre',
          tabBarIcon: ({ color }) => <Ionicons name="shield" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}