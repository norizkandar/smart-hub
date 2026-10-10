import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/lib/theme';
export default function TabsLayout() {
  return <Tabs screenOptions={{
    headerStyle: { backgroundColor: C.bg }, headerTintColor: C.text, headerTitleStyle: { fontWeight: '900' },
    tabBarStyle: { backgroundColor: C.panel, borderTopColor: C.border }, tabBarActiveTintColor: C.red,
    tabBarInactiveTintColor: C.muted
  }}>
    <Tabs.Screen name="index" options={{ title: 'Smart Car Hub', tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
    <Tabs.Screen name="search" options={{ title: 'Find your car', tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} /> }} />
    <Tabs.Screen name="favorites" options={{ title: 'Saved cars', tabBarIcon: ({ color, size }) => <Ionicons name="heart" color={color} size={size} /> }} />
    <Tabs.Screen name="messages" options={{ title: 'Enquiries', tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" color={color} size={size} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'My account', tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
  </Tabs>;
}