import React, {useEffect, useState} from 'react';
import {View, Text, Image, ScrollView} from 'react-native';
import useObjectsStore from '../store/objectsStore';
import PrayerTimes from '../components/PrayerTimes';
import Navbar from '../components/NavBar';

const HomeScreen = () => {
  const {prayers, fetchPrayers} = useObjectsStore();
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    fetchPrayers();
  }, []);

  useEffect(() => {
    if (prayers.length > 0) {
      updateCurrentPrayer();
      const interval = setInterval(updateCurrentPrayer, 60000);
      return () => clearInterval(interval);
    }
  }, [prayers]);

  function updateCurrentPrayer() {
    const now = new Date();
    // now.setHours(7, 0, 0, 0);
    // console.log("New:", now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    const sortedPrayers = prayers
      .filter(prayer => prayer.isJamatOn)
      .map(prayer => {
        const jamatTime = new Date(prayer.jamatTime);
        return {
          ...prayer,
          timeInMinutes: jamatTime.getHours() * 60 + jamatTime.getMinutes(),
        };
      })
      .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

    let nearestPrayer = sortedPrayers.find(
      prayer => prayer.timeInMinutes > currentTimeInMinutes,
    );

    let timeLeft;

    if (!nearestPrayer) {
      nearestPrayer = sortedPrayers[0];
      timeLeft = nearestPrayer.timeInMinutes + 24 * 60 - currentTimeInMinutes;
    } else {
      timeLeft = nearestPrayer.timeInMinutes - currentTimeInMinutes;
    }
    const hoursLeft = Math.floor(timeLeft / 60);
    const minutesLeft = timeLeft % 60;

    setCurrentPrayer(nearestPrayer);
    setTimeRemaining(`${hoursLeft}h ${minutesLeft}m`);
  }

  const formatTime = isoString => {
    if (!isoString) return '--:-- --';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 text-black p-4">
      <Navbar />
      <View className="flex-row items-center bg-blue-500 dark:bg-blue-700 h-max rounded-3xl p-6 shadow-xl">
        <View className="flex-1 gap-2">
          <Text className="text-lg font-gilroyBold text-white opacity-80">
            {currentPrayer ? 'Next Prayer ⏳' : 'No Prayer'}
          </Text>
          <Text className="text-3xl text-white font-gilroyBold">
            {currentPrayer ? currentPrayer.prayerName : 'No Prayer'}
          </Text>
          <Text className="text-2xl font-gilroyBold text-white opacity-90">
            {currentPrayer ? formatTime(currentPrayer.jamatTime) : '--:-- --'}
          </Text>
          <Text className="text-lg font-gilroyBold text-white opacity-90">
            {currentPrayer ? `In ${timeRemaining}` : ''}
          </Text>
        </View>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/128/4358/4358686.png',
          }}
          className="w-28 h-28"
        />
      </View>
      <PrayerTimes />
    </ScrollView>
  );
};

export default HomeScreen;
