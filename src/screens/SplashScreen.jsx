import React from 'react';
import {View, Text, Image} from 'react-native';

const icon = require('../../assets/images/icon.png');

const Splash = () => {
  return (
    <View className="flex-1 justify-between bg-white dark:bg-gray-900 p-5 font-gilroy">
      <View className="flex-1 items-center justify-center">
        <Image source={icon} className="w-40 h-40 mb-6" resizeMode="contain" />
        <Text className="text-3xl font-gilroyBold dark:text-white text-black text-center mb-3">
          Salah First! 🏆
        </Text>
        <Text className="text-lg text-gray-400 text-center px-4 mb-4 font-gilroyBold">
          Never miss a moment of connection with your Creator. 🕌✨
        </Text>
      </View>
      <View className="pb-5">
        <Text className="text-xl font-gilroyBold text-gray-400 text-center bottom-0">
          Made with ❤️ by Konain Raza
        </Text>
      </View>
    </View>
  );
};

export default Splash;
