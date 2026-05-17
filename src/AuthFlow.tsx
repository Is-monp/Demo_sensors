import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useAuth } from "./features/auth/presentation/context/authContext";
import ForgotPasswordScreen from "./features/auth/presentation/screens/ForgotPasswordScreen";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import { ParkingProvider } from "./features/parking/presentation/context/parkingContext";
import HomeScreen from "./features/parking/presentation/screens/HomeScreen";
import HistoryScreen from "./features/parking/presentation/screens/HistoryScreen";
import { SavedParkingListProvider } from "./features/save-parking/presentation/context/savedParkingListContext";
import SaveParkingScreen from "./features/save-parking/presentation/screens/SaveParkingScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ContentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E0E0F0' },
        tabBarActiveTintColor: '#1A1D6E',
        tabBarInactiveTintColor: '#9898B0',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={22} color={color} iconStyle="solid" />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="history" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <ParkingProvider>
      <SavedParkingListProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="App" component={ContentTabs} />
          <Stack.Screen
            name="SaveParking"
            component={SaveParkingScreen}
            options={{ presentation: 'modal', headerShown: false }}
          />
        </Stack.Navigator>
      </SavedParkingListProvider>
    </ParkingProvider>
  );
}

export default function AuthFlow() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Authenticated" component={AuthenticatedStack} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
