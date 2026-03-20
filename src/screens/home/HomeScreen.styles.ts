import { StyleSheet, Dimensions } from "react-native";
import {
  colors,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
  elevation,
  typography,
} from "../../theme";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerStyle: {
    backgroundColor: colors.primary,
  },
  headerTitleStyle: {
    color: colors.textInverse,
    fontWeight: fontWeights.bold,
    fontSize: typography.heading.h5.fontSize,
  },
  container: {
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    ...elevation.xs,
  },
  logoContainer: {
    marginRight: spacing.md,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "contain",
    ...elevation.xs,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: typography.heading.h4.fontSize,
    lineHeight: typography.heading.h4.lineHeight,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },
  welcomeSubText: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  sectionContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...elevation.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    justifyContent: "space-between",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: spacing.sm,
    backgroundColor: colors.primaryLight,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: typography.heading.h5.fontSize,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },
  seeAll: {
    fontSize: fontSizes.sm,
    color: colors.accent,
    fontWeight: fontWeights.medium,
  },
  horizontalList: {
    paddingBottom: spacing.sm,
  },
  card: {
    width: width * 0.65,
    minHeight: 120,
    padding: spacing.md,
    marginRight: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    ...elevation.sm,
    justifyContent: "space-between",
    borderLeftWidth: 3,
    borderLeftColor: colors.disabled,
  },
  cardWithThumbnail: {
    flexDirection: "row",
  },
  thumbnailContainer: {
    width: 70,
    height: 90,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  noteContentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  courseText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.disabled,
  },
  uploaderText: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
    flexShrink: 1,
  },
  dateText: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    fontStyle: "italic",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.md,
    alignSelf: "flex-start",
    marginTop: spacing.sm,
  },
  statusText: {
    fontSize: fontSizes.xs,
    color: "white",
    fontWeight: fontWeights.medium,
  },
  emptyText: {
    fontStyle: "italic",
    color: colors.placeholder,
    textAlign: "center",
    marginVertical: spacing.md,
    width: width * 0.65,
  },
  uploaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  answerCountContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.disabled,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badge: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
});
