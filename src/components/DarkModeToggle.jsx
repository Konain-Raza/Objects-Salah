import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useColorScheme} from 'nativewind';
import useObjectsStore from '../store/objectsStore';

const DarkModeToggle = () => {
  const {setColorScheme} = useColorScheme();
  const {isDarkMode, toggleTheme} = useObjectsStore();

  const handleToggle = () => {
    toggleTheme();
    setColorScheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <View className="flex-row items-center justify-center p-2 bg-gray-100 dark:bg-gray-900 rounded-full">
      <TouchableOpacity
        onPress={handleToggle}
        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
        <Text className="text-2xl">{isDarkMode ? '🌙' : '☀️'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DarkModeToggle;
