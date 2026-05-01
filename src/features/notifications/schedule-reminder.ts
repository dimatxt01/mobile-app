import * as Notifications from 'expo-notifications';

export async function scheduleReminder(time: string): Promise<void> {
  const parts = time.split(':').map(Number);
  const hour = parts[0] ?? 21;
  const minute = parts[1] ?? 0;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'HMC Check-In',
      body: 'Time to score your day.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}
