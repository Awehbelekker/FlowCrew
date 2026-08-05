import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Import FlowCrew screens
import DiscoverScreen from './screens/FlowCrew/DiscoverScreen';
import ProfileScreen from './screens/FlowCrew/ProfileScreen';
import BookingsScreen from './screens/FlowCrew/BookingsScreen';
import MapScreen from './screens/FlowCrew/MapScreen';
import MessagesScreen from './screens/FlowCrew/MessagesScreen';

// Import components and styles
import { Text } from './components/FlowCrew';
import { Colors } from './styles/FlowCrewDesignSystem';
import { HomeIcon, MapIcon, BookingIcon, MessageIcon, ProfileIcon } from './components/FlowCrew/Icons';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brand.green,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Colors.background.paper,
          borderTopColor: Colors.border.subtle,
        },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MapIcon color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <BookingIcon color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MessageIcon color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <ProfileIcon color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main app component with navigation container
const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          {/* Add more screens here as they are developed */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
