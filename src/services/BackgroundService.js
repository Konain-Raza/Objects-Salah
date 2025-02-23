import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import notifee from '@notifee/react-native';

// Load the Adhan sound
const adhan = new Sound('bell.mp3', Sound.MAIN_BUNDLE, error => {
  if (error) console.log('Error loading Adhan sound:', error);
});

export const checkPrayerTimes = async () => {
  try {
    const data = await AsyncStorage.getItem('prayers');
    if (!data) return;

    const prayers = JSON.parse(data);
    const now = new Date();
    const todayDate = now.toISOString().split('T')[0];

    const upcomingPrayers = prayers.map(prayer => {
      const originalJamatTime = new Date(prayer.jamatTime);
      const hours = originalJamatTime.getHours();
      const minutes = originalJamatTime.getMinutes();

      let jamatTime = new Date(
        `${todayDate}T${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:00`,
      );

      if (jamatTime < now) {
        jamatTime.setDate(jamatTime.getDate() + 1);
      }

      return {...prayer, jamatTime};
    });

    if (upcomingPrayers.length === 0) return;

    for (let prayer of upcomingPrayers) {
      const timeDiffMin = (prayer.jamatTime.getTime() - now.getTime()) / 60000;
      const wuzuTimeDiffMin = timeDiffMin - 10; 
      console.log(
        `Checking prayer: ${prayer.prayerName}, Time Diff: ${timeDiffMin} min, Wuzu Reminder Time: ${wuzuTimeDiffMin} min`,
      );

      // Wuzu Reminder
      if (wuzuTimeDiffMin >= 0 && wuzuTimeDiffMin < 1) {
        console.log(`Wuzu reminder for ${prayer.prayerName}`);
        await notifee.displayNotification({
          title: `🌊 Wuzu Alert for ${prayer.prayerName}`,
          body: `⏳ 10 mins till ${prayer.prayerName} – Time for Wuzu!`,
          android: {
            channelId: 'default',
            sound: 'wuzu',
            pressAction: {id: 'default'},
          },
        });
      }

      // Namaz Notification (Adhan)
      if (timeDiffMin >= 0 && timeDiffMin < 1) {
        console.log(`Playing Adhan for ${prayer.prayerName}`);
        // Play Adhan sound
        adhan.play(success => {
          if (!success) {
            console.log('Failed to play Adhan');
          }
        });

        // Send Namaz (prayer) notification
        await notifee.displayNotification({
          title: `🕌 Namaz Time for ${prayer.prayerName} `,
          body: `It's time for ${prayer.prayerName}✨.`,
          android: {
            channelId: 'objects-salah-channel',
            sound: 'wuzu',
            pressAction: {id: 'default'},
          },
        });
      }
    }
  } catch (error) {
    console.log('Error checking prayer times:', error);
  }
};
