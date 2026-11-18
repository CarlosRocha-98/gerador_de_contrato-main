import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme/colors";

type PageProps = {
  title: string;
  subtitle?: string;
  description?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
};

export function Page({
  title,
  subtitle,
  description,
  rightAction,
  children,
}: PageProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}
          </View>
          {rightAction ? <View>{rightAction}</View> : null}
        </View>
        {children}
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    color: colors.muted,
    lineHeight: 20,
  },
  description: {
    marginTop: 4,
    color: colors.muted,
    lineHeight: 20,
  },
});
