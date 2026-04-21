import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import HistoryScreen from '../screens/HistoryScreen';
import GroupScreen from '../screens/GroupScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { focused: 'wallet', outline: 'wallet-outline' },
  Add: { focused: 'add-circle', outline: 'add-circle-outline' },
  History: { focused: 'receipt', outline: 'receipt-outline' },
  Group: { focused: 'people', outline: 'people-outline' },
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          return <Ionicons name={focused ? icons.focused : icons.outline} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
        headerStyle: { backgroundColor: '#1a73e8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'CommuteSplit' }} />
      <Tab.Screen name="Add" component={AddExpenseScreen} options={{ title: 'Add Expense' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="Group" component={GroupScreen} options={{ title: 'Group' }} />
    </Tab.Navigator>
  );
}
