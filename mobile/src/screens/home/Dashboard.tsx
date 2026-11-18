import React, { useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, type ParamListBase } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";

import { useAuth } from "@/context/AuthContext";
import { colors, radius, spacing } from "@/theme/colors";

type IconName = keyof typeof Ionicons.glyphMap;

type Shortcut = {
  label: string;
  icon: IconName;
  onPress: () => void;
};

export function Dashboard() {
  const auth = useAuth();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [refreshing, setRefreshing] = useState(false);

  const userName = auth.profile?.nome || auth.profile?.username || "usuário";
  const firstName = userName.split(" ")[0];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await auth.reloadProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const openTools = () =>
    Alert.alert("Ferramentas", "Escolha uma opção", [
      { text: "Clientes", onPress: () => navigation.navigate("Clientes") },
      { text: "Imóveis", onPress: () => navigation.navigate("Imóveis") },
      { text: "Cancelar", style: "cancel" },
    ]);

  const shortcuts: Shortcut[] = [
    {
      label: "Cadastrar Clientes",
      icon: "person-add-outline",
      onPress: () => navigation.navigate("Clientes"),
    },
    {
      label: "Cadastrar Imóveis",
      icon: "business-outline",
      onPress: () => navigation.navigate("Imóveis"),
    },
    {
      label: "Ferramentas",
      icon: "construct-outline",
      onPress: openTools,
    },
    {
      label: "Meus Contratos",
      icon: "document-text-outline",
      onPress: () =>
        navigation.navigate("Contratos", { screen: "MeusContratos" }),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <Text style={styles.brand}>Contrato S.A.</Text>
          <Pressable
            style={styles.avatar}
            onPress={() => navigation.navigate("Perfil")}
          >
            <Ionicons name="person" size={22} color={colors.background} />
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.title}>Olá, {firstName}!</Text>
          <Text style={styles.subtitle}>
            Gerencie seus contratos de forma simples e rápida.
          </Text>
        </View>

        <Pressable
          style={styles.hero}
          onPress={() =>
            navigation.navigate("Contratos", { screen: "ContratosHome" })
          }
        >
          <View style={styles.heroIcon}>
            <Ionicons name="document-text" size={30} color="#fff" />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Gerar novo contrato</Text>
            <Text style={styles.heroSubtitle}>
              Crie um contrato de locação em poucos cliques.
            </Text>
          </View>
          <View style={styles.heroArrow}>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>
        </Pressable>

        <View style={styles.grid}>
          {shortcuts.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={36} color={colors.text} />
              <Text style={styles.tileLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarSpacer: {
    width: 36,
    height: 36,
  },
  brand: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  heroArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  tile: {
    width: "47.5%",
    minHeight: 150,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  tileLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
