import { StyleSheet, Dimensions } from "react-native";
import {
  colors,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
} from "../../theme";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.xl * 1.2,
  },
  logo: {
    width: width * 0.5,
    height: 80,
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.md,
    textAlign: "center",
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl * 1.5,
    textAlign: "center",
  },
  label: {
    fontSize: fontSizes.md,
    marginBottom: spacing.md,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  roles: {
    flexDirection: "column",
    marginBottom: spacing.xl * 1.5,
    gap: spacing.lg,
  },
  roleCard: {
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundAlt,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.info,
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.info,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  roleIcon: {
    fontSize: 24,
  },
  roleTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  roleDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  roleText: { fontSize: fontSizes.md },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveText: {
    color: colors.textInverse,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
});
