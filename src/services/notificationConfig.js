import notifee, { AndroidImportance } from '@notifee/react-native';

export const createNotificationChannel = async () => {
  try {
    const channelExists = await notifee.isChannelCreated('objects-salah-channel');
    console.log('Channel exists:', channelExists);

    if (channelExists) {
      console.log('Notification channel already exists.');
      return;
    }

    await notifee.createChannel({
      id: 'objects-salah-channel',
      name: 'Objects Salah Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'wuzu',
      vibration: true,
      playSound: true,
    });
    console.log('Notification channel created successfully');
  } catch (error) {
    console.error('Error creating notification channel:', error);
  }
};
