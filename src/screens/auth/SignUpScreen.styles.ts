import { StyleSheet } from "react-native";
import {
  colors,
  fontWeights,
  spacing,
  borderRadius,
  elevation,
  typography,
} from "../../theme";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  container: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "center",
  },
  logo: {
    width: "60%",
    height: 120,
    alignSelf: "center",
    marginBottom: spacing.xl,
    resizeMode: "contain",
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: typography.body.medium.fontSize,
    backgroundColor: colors.backgroundAlt,
    color: colors.text,
  },
  buttonsContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginBottom: spacing.xs,
    ...elevation.sm,
  },
  buttonSecondary: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: typography.body.medium.fontSize,
    fontWeight: fontWeights.semiBold,
  },
  buttonTextSecondary: {
    color: colors.primary,
    fontSize: typography.body.medium.fontSize,
    fontWeight: fontWeights.semiBold,
  },
});
