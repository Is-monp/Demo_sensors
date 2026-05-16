import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useAuth } from "./features/auth/presentation/context/authContext";
import ForgotPasswordScreen from "./features/auth/presentation/screens/ForgotPasswordScreen";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import { ProductProvider } from "./features/products/presentation/context/productContext";
import AddProductScreen from "./features/products/presentation/screens/AddProductScreen";
import ProductListScreen from "./features/products/presentation/screens/ProductListScreen";
import UpdateProductScreen from "./features/products/presentation/screens/UpdateProductScreen";
import SettingScreen from "./features/settings/SettingScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function ContentTabs() {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    // screenOptions={{
    //   headerShown: true,
    //   headerTitle: "Auth demo with React Navigation",
    //   headerRight: () => (
    //     <IconButton icon="logout" onPress={() => logout()} />
    //   ),
    //   headerTitleAlign: "left",
    //   headerStyle: {
    //     elevation: 0,
    //     shadowOpacity: 0,
    //   },
    // }}
    >
      <Tab.Screen
        name="Home"
        component={ProductListScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={24} color={color} iconStyle="solid" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user" size={24} color={color} iconStyle="solid" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <ProductProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="App" component={ContentTabs} />
        <Stack.Screen
          name="AddProductScreen"
          component={AddProductScreen}
          options={{
            title: "Add Product",
            headerShown: true,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="UpdateProductScreen"
          component={UpdateProductScreen}
          options={{
            title: "Update Product",
            headerShown: true,
            presentation: "modal",
          }}
        />
      </Stack.Navigator>
    </ProductProvider>
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
