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
        <ActivityIndicator color={tone === "ghost" ? colors.cyan : "#fff"} />
      ) : (
        <Text style={[styles.buttonText, tone === "ghost" && styles.buttonGhostText]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function LoadingCard({ label = "Yuklanmoqda..." }: { label?: string }) {
  return (
    <Card style={styles.loadingCard}>
      <ActivityIndicator color={colors.cyan} />
      <Text style={styles.loadingText}>{label}</Text>
    </Card>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="rgba(203,213,225,0.55)"
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
    backgroundColor: "rgba(17,17,29,0.92)",
    borderColor: colors.line,
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    ...shadows.soft,
  },
  darkCard: {
    backgroundColor: colors.darkPanel,
    borderColor: colors.lineStrong,
  },
  sectionHeader: {
    gap: 4,
    marginBottom: 12,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
  },
  pill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  pillSelected: {
    backgroundColor: colors.purple,
    borderColor: "rgba(103,232,249,0.28)",
  },
  pillDark: {
    backgroundColor: colors.purple,
    borderColor: "rgba(103,232,249,0.28)",
  },
  pillGreen: {
    backgroundColor: "rgba(52,211,153,0.12)",
    borderColor: "rgba(52,211,153,0.22)",
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
    backgroundColor: colors.purple,
    borderColor: "rgba(103,232,249,0.24)",
    borderWidth: 1,
    borderRadius: 18,
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: 18,
    boxShadow: "0px 12px 20px rgba(139, 92, 246, 0.28)",
    elevation: 6,
  },
  buttonGold: {
    backgroundColor: colors.gold,
    borderColor: "rgba(246,200,95,0.32)",
  },
  buttonGhost: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: colors.line,
    borderWidth: 1,
    boxShadow: "none",
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  buttonGhostText: {
    color: colors.text,
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
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  stat: {
    backgroundColor: colors.purple,
    borderColor: "rgba(103,232,249,0.2)",
    borderWidth: 1,
    borderRadius: 20,
    flex: 1,
    minHeight: 92,
    justifyContent: "center",
    padding: 14,
  },
  statGold: {
    backgroundColor: colors.gold,
    borderColor: "rgba(246,200,95,0.24)",
  },
  statGreen: {
    backgroundColor: colors.green,
    borderColor: "rgba(52,211,153,0.24)",
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
  loadingCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    minHeight: 72,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
});
