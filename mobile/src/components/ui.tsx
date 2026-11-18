import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { colors, radius, spacing } from "@/theme/colors";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

type InputFieldProps = TextInputProps & {
  label: string;
  helperText?: string;
};

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  helperText?: string;
};

export function InputField({
  label,
  helperText,
  style,
  ...props
}: InputFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...props}
      />
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

export function SelectField({
  label,
  value,
  placeholder,
  options,
  onValueChange,
  helperText,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setIsOpen((current) => !current)}
        style={[styles.input, styles.selectTrigger]}
      >
        <Text
          style={[
            styles.selectValue,
            !selectedLabel && styles.selectPlaceholder,
          ]}
        >
          {selectedLabel || placeholder}
        </Text>
        <Text style={styles.selectChevron}>{isOpen ? "▲" : "▼"}</Text>
      </Pressable>
      {isOpen ? (
        <View style={styles.selectMenu}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              style={({ pressed }) => [
                styles.selectOption,
                value === option.value && styles.selectOptionActive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.selectOptionLabel,
                  value === option.value && styles.selectOptionLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        variant === "danger" && styles.dangerButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? colors.primary : "#fff"}
        />
      ) : (
        <Text
          style={[
            styles.buttonLabel,
            variant === "secondary" && styles.secondaryLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

type ChipProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

type EmptyStateProps = {
  title: string;
  subtitle?: string;
};

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionTitleWrap: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: colors.muted,
    marginTop: 4,
    lineHeight: 20,
  },
  fieldWrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectValue: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
    paddingRight: spacing.sm,
  },
  selectPlaceholder: {
    color: colors.muted,
  },
  selectChevron: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  selectMenu: {
    marginTop: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
  },
  selectOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectOptionActive: {
    backgroundColor: colors.surface,
  },
  selectOptionLabel: {
    color: colors.text,
    fontSize: 14,
  },
  selectOptionLabelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  helper: {
    color: colors.muted,
    marginTop: 6,
    fontSize: 12,
  },
  button: {
    backgroundColor: colors.primary,
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  buttonLabel: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryLabel: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipLabel: {
    fontWeight: "700",
    color: colors.muted,
  },
  chipLabelActive: {
    color: "#fff",
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
