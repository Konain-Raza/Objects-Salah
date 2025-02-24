import notifee, { AndroidImportance, AndroidCategory, TriggerType } from '@notifee/react-native';
import { Platform } from 'react-native';

async function schedulePrayerAlarms(prayers) {
  // Check & request alarm permissions (Android 12+)
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    await notifee.openAlarmPermissionSettings();
  }

  // Create a notification channel (required for Android)
  await notifee.createChannel({
    id: 'alarm',
    name: 'Prayer Alarms',
    importance: AndroidImportance.HIGH,
    sound: 'default', // Use 'default' or add a custom sound
  });

  for (const prayer of prayers) {
    if (!prayer.isJamatOn) continue; // Skip if Jamat is off

    // Extract time from jamatTime (ignoring the date part)
    const time = new Date(prayer.jamatTime);
    const hours = time.getHours();
    const minutes = time.getMinutes();

    console.log(`📌 Extracted time for ${prayer.prayerName}: ${hours}:${minutes} (24-hour format)`);

    // Set trigger time for daily schedule
    const now = new Date();
    let triggerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

    // If time has already passed today, move it to tomorrow
    if (triggerTime <= now) {
      triggerTime.setDate(triggerTime.getDate() + 1);
      console.log(`⏳ ${prayer.prayerName} time has passed for today. Scheduling for tomorrow.`);
    }

    console.log(`🕰️ Final scheduled time for ${prayer.prayerName}: ${triggerTime.toISOString()}`);

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTime.getTime(),
      alarmManager: {
        allowWhileIdle: true, // Ensures alarm rings even in Doze mode
      },
    };

    // Schedule the alarm notification
    await notifee.createTriggerNotification(
      {
        title: `🕌 Namaz Time for ${prayer.prayerName}`,
        body: `It's time for ${prayer.prayerName}✨.`,
        android: {
          channelId: 'alarm',
          category: AndroidCategory.ALARM,
          sound: prayer.playSound ? 'default' : undefined,
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger
    );

    console.log(`✅ Alarm successfully scheduled for ${prayer.prayerName} at ${triggerTime.toLocaleString()}`);
  }
}

// Function to cancel all scheduled alarms
async function deleteAllScheduledAlarms() {
  await notifee.cancelAllNotifications();
  console.log("❌ All scheduled prayer alarms have been deleted.");
}

export { schedulePrayerAlarms, deleteAllScheduledAlarms };
