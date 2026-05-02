import * as Notifications from 'expo-notifications';

export async function scheduleReminder(time: string): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: requested } = await Notifications.requestPermissionsAsync();
    if (requested !== 'granted') return;
  }
  const parts = time.split(':').map(Number);
  const hour = parts[0] ?? 21;
  const minute = parts[1] ?? 0;
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Daily check-in reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Habits Check-In',
      body: 'Time to score your day.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  // Weekly check-up reminder on Sundays at the same time
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Habits Weekly Check-Up',
      body: 'Time for your weekly check-up.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // 1 = Sunday in expo-notifications
      hour,
      minute,
    },
  });
}
