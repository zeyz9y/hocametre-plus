import { colors } from "../theme";

export interface EventDateInfo {
  isExpired: boolean;
  daysRemaining: number;
  displayText: string;
  statusColor: string;
}

export const getEventDateInfo = (eventDate: string): EventDateInfo => {
  const now = new Date();
  const event = new Date(eventDate);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(
    event.getFullYear(),
    event.getMonth(),
    event.getDate()
  );

  const timeDiff = eventDay.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const isExpired = daysDiff < 0;
  const daysRemaining = Math.abs(daysDiff);

  let displayText: string;
  let statusColor: string;

  if (isExpired) {
    displayText = `${daysRemaining} gün önce bitti`;
    statusColor = colors.placeholder;
  } else if (daysDiff === 0) {
    displayText = "Bugün";
    statusColor = colors.error;
  } else if (daysDiff === 1) {
    displayText = "Yarın";
    statusColor = colors.errorAlt;
  } else if (daysDiff <= 7) {
    displayText = `${daysDiff} gün kaldı`;
    statusColor = colors.warning;
  } else {
    displayText = `${daysDiff} gün kaldı`;
    statusColor = colors.success;
  }

  return {
    isExpired,
    daysRemaining,
    displayText,
    statusColor,
  };
};

export const formatEventDate = (eventDate: string): string => {
  const date = new Date(eventDate);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
