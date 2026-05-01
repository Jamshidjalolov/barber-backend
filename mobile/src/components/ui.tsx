import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

import { colors, shadows } from "../theme/colors";

export function Card({
  children,
  style,
  dark = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  dark?: boolean;
}) {
  return (
    <View style={[styles.card, dark && styles.darkCard, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export function Pill({
  label,
  selected,
  onPress,
  tone = "light",
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: "light" | "dark" | "green";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected && styles.pillSelected,
        tone === "dark" && styles.pillDark,
        tone === "green" && styles.pillGreen,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          selected && styles.pillTextSelected,
          tone === "dark" && styles.pillTextDark,
          tone === "green" && styles.pillTextGreen,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  tone = "dark",
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  tone?: "dark" | "gold" | "ghost";
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        tone === "gold" && styles.buttonGold,
        tone === "ghost" && styles.buttonGhost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone === "ghost" ? colors.ink : "#fff"} />
      ) : (
        <Text style={[styles.buttonText, tone === "ghost" && styles.buttonGhostText]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="#9b9387"
        style={styles.input}
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}

export function Stat({
  label,
  value,
  tone = "dark",
}: {
  label: string;
  value: string | number;
  tone?: "dark" | "gold" | "green";
}) {
  return (
    <View style={[styles.stat, tone === "gold" && styles.statGold, tone === "green" && styles.statGreen]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    ...shadows.soft,
  },
  darkCard: {
    backgroundColor: colors.darkPanel,
    borderColor: "#2b2b2b",
  },
  sectionHeader: {
    gap: 4,
    marginBottom: 12,
  },
  eyebrow: {
    color: colors.goldDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
  },
  pill: {
    alignItems: "center",
    backgroundColor: colors.haze,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  pillSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  pillDark: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  pillGreen: {
    backgroundColor: "#e9f7ef",
    borderColor: "#ccebd9",
  },
  pillText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  pillTextSelected: {
    color: "#fff",
  },
  pillTextDark: {
    color: "#fff",
  },
  pillTextGreen: {
    color: colors.green,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: 18,
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonGold: {
    backgroundColor: colors.gold,
  },
  buttonGhost: {
    backgroundColor: colors.haze,
    borderColor: colors.line,
    borderWidth: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  buttonGhostText: {
    color: colors.ink,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  stat: {
    backgroundColor: colors.ink,
    borderRadius: 20,
    flex: 1,
    minHeight: 92,
    justifyContent: "center",
    padding: 14,
  },
  statGold: {
    backgroundColor: colors.gold,
  },
  statGreen: {
    backgroundColor: colors.green,
  },
  statValue: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
});
