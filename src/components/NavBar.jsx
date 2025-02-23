import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image, Button} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import useObjectsStore from '../store/objectsStore';
import adminIcon from '../../assets/images/admin.png';
import userIcon from '../../assets/images/user.png';
import DarkModeToggle from './DarkModeToggle';
const Navbar = () => {
  const {logout, isAdmin} = useObjectsStore();
  const [showLogout, setShowLogout] = useState(false);
  const navigation = useNavigation();

  const handleAvatarClick = () => {
    if (isAdmin) {
      setShowLogout(!showLogout);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogout(false);
  };

  return (
    <View className="flex-row justify-between items-center py-4 gap-3 bg-white dark:bg-gray-900">
      <View className="w-max flex-row items-center gap-3">
        <View className="flex-row justify-between items-center gap-3">
          <TouchableOpacity
            onPress={handleAvatarClick}
            className="flex items-center bg-white border dark:bg-gray-900 border-gray-300 p-1 rounded-full">
            <Image
              source={isAdmin ? adminIcon : userIcon}
              className="w-12 h-12 rounded-full"
            />
          </TouchableOpacity>
          {isAdmin && showLogout && (
            <TouchableOpacity
              title="Logout"
              onPress={handleLogout}
              className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-gilroy rounded-full text-sm px-5 py-2.5 text-center me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
              <Text className="text-white font-gilroyBold">Logout</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-2xl font-gilroyBold dark:text-white text-gray-800">
          {!showLogout && `Assalamualaikum${isAdmin ? '' : ''} ✨`}
        </Text>
      </View>
      <DarkModeToggle />
    </View>
  );
};

export default Navbar;
