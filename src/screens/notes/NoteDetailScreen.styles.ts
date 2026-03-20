import { StyleSheet } from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  elevation,
  typography,
  fontWeights,
} from "../../theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: typography.body.medium.fontSize,
    color: colors.textSecondary,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    ...elevation.md,
  },
  title: {
    fontSize: typography.heading.h4.fontSize,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  courseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  courseText: {
    fontSize: typography.body.small.fontSize,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: typography.body.small.fontSize,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  link: {
    fontSize: typography.body.medium.fontSize,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    ...elevation.sm,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: typography.body.medium.fontSize,
    fontWeight: fontWeights.semiBold,
    marginLeft: spacing.sm,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.md,
    marginTop: spacing.md,
  },
  backText: {
    marginLeft: spacing.sm,
    fontSize: typography.body.medium.fontSize,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  thumbnailContainer: {
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  thumbnail: {
    width: 180,
    height: 240,
    borderRadius: borderRadius.md,
    ...elevation.sm,
  },
  thumbnailPlaceholder: {
    width: 180,
    height: 240,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    ...elevation.sm,
  },
});
