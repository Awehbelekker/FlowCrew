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
import MeniscusTabBar from './components/FlowCrew/MeniscusTabBar';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main tab navigator
// Icons are rendered by MeniscusTabBar itself (self-contained icon set),
// so per-screen tabBarIcon options are no longer needed here.
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <MeniscusTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
