import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";

import { colors, radius, spacing } from "@/theme/colors";

type IconName = keyof typeof Ionicons.glyphMap;

type TypeOption = {
  title: string;
  description: string;
  icon: IconName;
  screen: "FormularioAluguel" | "FormularioServico";
};

const OPTIONS: TypeOption[] = [
  {
    title: "Aluguel",
    description: "Contrato de locação residencial ou comercial",
    icon: "home-outline",
    screen: "FormularioAluguel",
  },
  {
    title: "Serviço",
    description: "Contrato de prestação de serviços",
    icon: "construct-outline",
    screen: "FormularioServico",
  },
];

export function ContractsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.panel}>
            <Text style={styles.title}>Gerar Contrato</Text>
            <Text style={styles.subtitle}>
              Escolha o tipo de contrato que deseja gerar:
            </Text>

            <View style={styles.options}>
              {OPTIONS.map((option) => (
                <Pressable
                  key={option.screen}
                  onPress={() => navigation.navigate(option.screen)}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={48}
                    color={colors.primary}
                  />
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => navigation.navigate("Início")}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <Text style={styles.backText}>← Voltar</Text>
            </Pressable>
          </View>
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
    flexGrow: 1,              // faz o conteúdo ocupar a altura toda
    justifyContent: "center", // centraliza na vertical
    alignItems: "center",     // centraliza na horizontal
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    gap: spacing.xl,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
  },
  options: {
    width: "100%",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  option: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  optionDescription: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  back: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  backText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
