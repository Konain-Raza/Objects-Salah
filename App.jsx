import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';
import useObjectsStore from './src/store/objectsStore';
import './global.css';
import { schedulePrayerAlarms} from './src/services/sheduleAlarms';

const Stack = createNativeStackNavigator();

const App = () => {
  const {prayers,fetchPrayers, loadTheme} = useObjectsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      loadTheme();
      const fetchResult = await fetchPrayers();

      if (fetchResult.success) {
        console.log("Fetched j:", fetchResult.prayers);
        await schedulePrayerAlarms(fetchResult.prayers);
      } else {
        console.log("Failed to fetch prayers.");
      }
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
