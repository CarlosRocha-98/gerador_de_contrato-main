import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import {
  DarkTheme,
  NavigationContainer,
  type Theme,
} from "@react-navigation/native";
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme/colors";
import { SplashScreen } from "@/screens/auth/SplashScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { Dashboard } from "@/screens/home/Dashboard";
import { ModelsScreen } from "@/screens/home/ModelsScreen";
import { ClientsScreen } from "@/screens/clients/ClientsScreen";
import { PropertiesScreen } from "@/screens/properties/PropertiesScreen";
import { ContractsNavigator } from "@/screens/contracts/ContractsNavigator";
import { Profile } from "@/screens/profile/Profile";

const AuthStack = createNativeStackNavigator();
const MainTabs = createBottomTabNavigator();

const appTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    notification: colors.accent,
  },
};

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ITEMS: {
  name: string;
  label: string;
  icons: [IconName, IconName];
}[] = [
  { name: "Início", label: "Início", icons: ["home", "home-outline"] },
  {
    name: "Contratos",
    label: "Contratos",
    icons: ["document-text", "document-text-outline"],
  },
  { name: "Novo", label: "", icons: ["add", "add"] },
  {
    name: "Modelos",
    label: "Modelos",
    icons: ["documents", "documents-outline"],
  },
  { name: "Perfil", label: "Perfil", icons: ["person", "person-outline"] },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const currentName = state.routes[state.index]?.name;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
      }}
    >
      {TAB_ITEMS.map((item) => {
        if (item.name === "Novo") {
          return (
            <View key={item.name} style={{ flex: 1, alignItems: "center" }}>
              <Pressable
                onPress={() =>
                  navigation.navigate("Contratos", { screen: "ContratosHome" })
                }
                style={{
                  marginTop: -30,
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 4,
                  borderColor: colors.background,
                }}
              >
                <Ionicons name="add" size={30} color="#fff" />
              </Pressable>
            </View>
          );
        }

        const route = state.routes.find((r) => r.name === item.name);
        if (!route) return null;

        const focused = currentName === item.name;
        const color = focused ? colors.primary : colors.muted;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={item.name}
            onPress={onPress}
            style={{ flex: 1, alignItems: "center", gap: 2 }}
          >
            <Ionicons
              name={focused ? item.icons[0] : item.icons[1]}
              size={24}
              color={color}
            />
            <Text
              numberOfLines={1}
              style={{ color, fontSize: 11, fontWeight: "600" }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MainNavigator() {
  return (
    <MainTabs.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <MainTabs.Screen name="Início" component={Dashboard} />
      <MainTabs.Screen name="Contratos" component={ContractsNavigator} />
      <MainTabs.Screen name="Modelos" component={ModelsScreen} />
      <MainTabs.Screen name="Perfil" component={Profile} />
      <MainTabs.Screen name="Clientes" component={ClientsScreen} />
      <MainTabs.Screen name="Imóveis" component={PropertiesScreen} />
    </MainTabs.Navigator>
  );
}

export function AppNavigator() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={appTheme}>
      {auth.accessToken && auth.refreshToken ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
