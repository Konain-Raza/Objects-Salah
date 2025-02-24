import notifee, {
  AndroidImportance,
  AndroidCategory,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import {Platform} from 'react-native';

async function schedulePrayerAlarms(prayers) {
  console.log(`📅 Scheduling alarms for ${prayers.length} prayers`);
  await notifee.deleteChannel('Wuzu_Reminders');
  await notifee.deleteChannel('Jamat_Alarms');
  await notifee.cancelAllNotifications();
  console.log('🔄 Previous alarms cleared.');

  // 📌 Create Channel for Wuzu Reminders
  await notifee.createChannel({
    id: 'Wuzu_Reminders',
    name: 'Wuzu Alerts',
    sound: 'wuzu',
    importance: AndroidImportance.HIGH,
    vibration: true,
    bypassDnd: true,
  });

  // 📌 Create Channel for Jamat Alarms
  await notifee.createChannel({
    id: 'Jamat_Alarms',
    name: 'Prayer Alarms',
    sound: 'bell',
    importance: AndroidImportance.HIGH,
    vibration: true,
    bypassDnd: true,
  });

  const now = new Date();

  for (const prayer of prayers) {
    if (!prayer.isJamatOn) continue;

    const time = new Date(prayer.jamatTime);

    // 📌 Jamat Time
    let jamatTriggerTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      time.getHours(),
      time.getMinutes(),
      0,
      0,
    );

    // 📌 Wuzu Reminder Time (10 minutes before Jamat)
    let wuzuTriggerTime = new Date(jamatTriggerTime);
    wuzuTriggerTime.setMinutes(wuzuTriggerTime.getMinutes() - 10);

    // 🔹 Handling Past & Future Times
    if (wuzuTriggerTime <= now && jamatTriggerTime <= now) {
      // If both Wuzu & Jamat have passed, schedule for the next day
      wuzuTriggerTime.setDate(wuzuTriggerTime.getDate() + 1);
      jamatTriggerTime.setDate(jamatTriggerTime.getDate() + 1);
    } else if (wuzuTriggerTime <= now) {
      // If only Wuzu has passed, set Wuzu for next day
      wuzuTriggerTime.setDate(wuzuTriggerTime.getDate() + 1);
    } else if (jamatTriggerTime <= now) {
      // If only Jamat time has passed, set Jamat for the next day
      jamatTriggerTime.setDate(jamatTriggerTime.getDate() + 1);
      wuzuTriggerTime.setDate(wuzuTriggerTime.getDate() + 1); // Ensure Wuzu aligns with Jamat
    }
    // If neither have passed, keep both for today

    console.log(
      `🌊 Scheduling Wuzu Alert for ${
        prayer.prayerName
      } at ${wuzuTriggerTime.toLocaleString()}`,
    );
    console.log(
      `🕌 Scheduling Jamat Alarm for ${
        prayer.prayerName
      } at ${jamatTriggerTime.toLocaleString()}`,
    );

    const wuzuTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: wuzuTriggerTime.getTime(),
      alarmManager: {allowWhileIdle: true},
      repeatFrequency: RepeatFrequency.DAILY,
    };

    const jamatTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: jamatTriggerTime.getTime(),
      alarmManager: {allowWhileIdle: true},
      repeatFrequency: RepeatFrequency.DAILY,
    };

    // 🌊 Wuzu Reminder (10 minutes before Jamat)
    await notifee.createTriggerNotification(
      {
        title: `🌊 Wuzu Alert for ${prayer.prayerName}`,
        body: `⏳ 10 mins till ${prayer.prayerName} – Time for Wuzu!`,
        android: {
          channelId: 'Wuzu_Reminders',
          smallIcon: 'ic_launcher',
          category: AndroidCategory.ALARM,
          sound: 'wuzu',
          vibrationPattern: [500, 1000, 500, 1000],

          pressAction: {id: 'default'},
        },
      },
      wuzuTrigger,
    );

    // 🕌 Jamat Notification
    await notifee.createTriggerNotification(
      {
        title: `🕌 Namaz Time for ${prayer.prayerName}`,
        body: `It's time for ${prayer.prayerName}✨.`,
        android: {
          channelId: 'Jamat_Alarms',
          category: AndroidCategory.ALARM,
          smallIcon: 'ic_launcher',
          sound: 'bell',
          vibrationPattern: [500, 1000, 500, 1000],
          pressAction: {id: 'default'},
        },
      },
      jamatTrigger,
    );
  }
}

export {schedulePrayerAlarms};
