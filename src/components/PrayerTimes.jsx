import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Text,
  View,
  Switch,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import useObjectsStore from '../store/objectsStore';
import {schedulePrayerAlarms} from '../services/sheduleAlarms';

const PrayerTimes = () => {
  const {prayers, isAdmin, updatePrayerTime} = useObjectsStore();
  const [jamatToggle, setJamatToggle] = useState({});
  const [jamatTimes, setJamatTimes] = useState({});
  const [showPicker, setShowPicker] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setJamatToggle(
      prayers.reduce(
        (acc, prayer) => ({
          ...acc,
          [prayer.prayerName]: prayer.isJamatOn || false,
        }),
        {},
      ),
    );
  }, [prayers]);
  useEffect(() => {
    console.log('Current showPicker:', showPicker);
  }, [showPicker]);

  const handleJamatToggle = prayerName => {
    setJamatToggle(prev => ({...prev, [prayerName]: !prev[prayerName]}));
  };

  const handleJamatTimeChange = (prayerName, event, selectedTime) => {
    if (event.type === 'dismissed') return setShowPicker(null);

    const updatedPrayerTime = new Date();
    updatedPrayerTime.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
    );

    setJamatTimes(prev => ({
      ...prev,
      [prayerName]: updatedPrayerTime.toISOString(),
    }));

    setShowPicker(null);
  };

  const formatTime = isoString => {
    if (!isoString) return '';

    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', isoString);
      return 'Invalid Time';
    }

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleUpdate = async () => {
    setLoading(true);
    const updatedTimes = prayers.map(prayer => ({
      prayerName: prayer.prayerName,
      jamatTime: jamatTimes[prayer.prayerName] || prayer.jamatTime,
      isJamatOn: jamatToggle[prayer.prayerName] ?? prayer.isJamatOn,
    }));
    const formattedPrayerTimes = {
      prayers: updatedTimes,
    };
    try {
      const updateResult = await updatePrayerTime(formattedPrayerTimes);
      if (updateResult.success == true) {
        await schedulePrayerAlarms(updateResult.prayers);
      }
      // if (updateResult == true) {
      //   await schedulePrayerAlarms();
      // }
    } catch (error) {
      console.error('Error updating prayer times:', error);
      Alert;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="px-4 mt-10">
      <Text className="font-gilroyBold text-3xl mb-2 text-gray-900 dark:text-white">
        Prayer Times 🕌
      </Text>

      <ScrollView>
        {prayers &&
          prayers
            .filter(prayer => (isAdmin ? true : prayer.isJamatOn))
            .map((prayer, index) => (
              <View
                key={index}
                className={`w-full flex-row items-center ${
                  isAdmin ? 'py-3 px-4' : 'p-4'
                } rounded-lg my-2 bg-gray-100 dark:bg-gray-800`}>
                <Text className="text-xl font-gilroyBold w-1/2 text-gray-900 dark:text-white">
                  {prayer.prayerName}
                </Text>

                <View
                  className={`flex-1 ${
                    isAdmin ? 'items-center' : 'items-end'
                  }`}>
                  {isAdmin ? (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          console.log(
                            '🟢 Opening DateTimePicker for:',
                            prayer.prayerName,
                          );
                          setShowPicker(prayer.prayerName);
                        }}
                        className="bg-gray-300 dark:bg-gray-700 py-2 px-3 w-max rounded-md">
                        <Text className="text-lg font-gilroyBold text-black dark:text-white">
                          <Text className="text-lg font-gilroyBold text-gray-500 dark:text-gray-300">
                            {formatTime(
                              jamatTimes[prayer.prayerName] || prayer.jamatTime,
                            )}
                          </Text>
                        </Text>
                      </TouchableOpacity> 

                      {showPicker === prayer.prayerName && (
                          <DateTimePicker
                            value={
                              new Date(
                                jamatTimes[prayer.prayerName] ||
                                  prayer.jamatTime,
                              )
                            }
                            mode="time"
                            is24Hour={false}
                            display="default"
                            onChange={(event, selectedTime) =>
                              handleJamatTimeChange(
                                prayer.prayerName,
                                event,
                                selectedTime,
                              )
                            }
                          />
                      )}
                    </>
                  ) : (
                    <Text className="text-lg font-gilroyBold text-gray-500 dark:text-gray-300 opacity-80">
                      {formatTime(
                        jamatTimes[prayer.prayerName] || prayer.jamatTime,
                      )}
                    </Text>
                  )}
                </View>

                {isAdmin && (
                  <View className="ml-4">
                    <Switch
                      value={jamatToggle[prayer.prayerName] || false}
                      onValueChange={() => handleJamatToggle(prayer.prayerName)}
                      trackColor={{
                        false: '#767577',
                        true: '#4cd137',
                      }}
                      thumbColor={
                        jamatToggle[prayer.prayerName] ? '#ffffff' : '#f4f3f4'
                      }
                    />
                  </View>
                )}
              </View>
            ))}
      </ScrollView>

      {isAdmin && (
        <TouchableOpacity
          onPress={handleUpdate}
          className="bg-blue-500 dark:bg-blue-700 py-4 px-6 rounded-lg my-4 shadow-lg transform hover:scale-105 transition-all duration-300"
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-center text-xl font-gilroyBold">
              Update Prayer Times
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PrayerTimes;
