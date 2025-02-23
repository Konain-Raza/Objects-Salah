import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PermissionsAndroid, Platform, Alert} from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';
import useObjectsStore from './src/store/objectsStore';
import './global.css';
import BackgroundService from 'react-native-background-actions';
import {checkPrayerTimes} from './src/services/BackgroundService';
const sleep = time => new Promise(resolve => setTimeout(resolve, time));
import {createNotificationChannel} from './src/services/notificationConfig';
const backgroundTask = async ({delay}) => {
  while (BackgroundService.isRunning()) {
    console.log('⏰ Running checkPrayerTimes()');
    await checkPrayerTimes();
    await sleep(delay);
  }
};

const options = {
  taskName: 'PrayerCheck',
  taskTitle: 'Objects Salah',
  taskDesc: 'Ensuring you never miss a prayer.',
  taskIcon: {name: 'ic_launcher', type: 'mipmap'},
  color: '#ffffff',
  linkingURI: 'yourSchemeHere://chat/jane',
  parameters: {delay: 60000},
};

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const currentStatus = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (currentStatus) return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;

    Alert.alert(
      'Permission Required',
      'This app requires notification permission to run background tasks properly.',
      [{text: 'OK'}],
    );
  }
  return true; // iOS handles permissions automatically
};

const Stack = createNativeStackNavigator();

const App = () => {
  const {fetchPrayers, loadTheme} = useObjectsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      loadTheme();
      await createNotificationChannel();

      if (await requestNotificationPermission()) {

        if (!BackgroundService.isRunning()) {


          await BackgroundService.start(backgroundTask, options);
        }
      }

      await fetchPrayers();
      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isLoading ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
