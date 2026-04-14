import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getPrayerName } from './prayerTimesService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer-times', {
      name: 'Namaz Vakitleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1B5E20',
      sound: 'ezan',
    });
  }

  return true;
}

export async function schedulePrayerNotifications(prayerTimes, enabledPrayers = null) {
  // Cancel all existing prayer notifications
  await cancelAllPrayerNotifications();

  const defaultEnabled = enabledPrayers || {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  };

  const prayers = [
    { key: 'fajr', time: prayerTimes.fajr },
    { key: 'sunrise', time: prayerTimes.sunrise },
    { key: 'dhuhr', time: prayerTimes.dhuhr },
    { key: 'asr', time: prayerTimes.asr },
    { key: 'maghrib', time: prayerTimes.maghrib },
    { key: 'isha', time: prayerTimes.isha },
  ];

  const scheduled = [];

  for (const prayer of prayers) {
    if (!defaultEnabled[prayer.key]) continue;

    const [hours, minutes] = prayer.time.split(':').map(Number);
    const now = new Date();
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);

    if (prayerDate <= now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${getPrayerName(prayer.key)} Vakti`,
          body: `${getPrayerName(prayer.key)} namazı vakti geldi. ${prayer.time}`,
          sound: 'ezan',
          data: { prayerKey: prayer.key },
          categoryIdentifier: 'prayer-times',
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
          channelId: 'prayer-times',
        },
      });

      scheduled.push({ key: prayer.key, id, time: prayer.time });
    } catch (error) {
      console.error(`Failed to schedule ${prayer.key} notification:`, error);
    }
  }

  return scheduled;
}

export async function cancelAllPrayerNotifications() {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.prayerKey) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function scheduleTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'NamazPro Test',
      body: 'Bildirimler aktif! Namaz vakitlerinizi kaçırmayacaksınız.',
      sound: true,
    },
    trigger: { seconds: 2 },
  });
}

export function addNotificationListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
