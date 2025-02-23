import {create} from 'zustand';
import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colorScheme} from 'nativewind';

const useObjectsStore = create(set => ({
  prayers: async () => {
    await AsyncStorage.getItem('prayers');
  },
  isAdmin: false,
  isDarkMode: false,

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      console.log('🔵 Loaded Theme from Storage:', savedTheme);

      if (savedTheme !== null) {
        const parsedTheme = JSON.parse(savedTheme);
        console.log('🟢 Parsed Theme:', parsedTheme);

        set({isDarkMode: parsedTheme});

        setTimeout(() => {
          colorScheme.set(parsedTheme ? 'dark' : 'light');
          console.log('🎨 Theme Updated:', parsedTheme ? 'dark' : 'light');
        }, 50);
        console.log('🟣 Theme applied:', parsedTheme ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('🔴 Error loading theme:', error);
    }
  },

  toggleTheme: async () => {
    set(state => {
      const newTheme = !state.isDarkMode;
      console.log('🔄 Toggling Theme to:', newTheme ? 'dark' : 'light');

      AsyncStorage.setItem('theme', JSON.stringify(newTheme));

      // ✅ Apply the new theme to NativeWind
      colorScheme.set(newTheme ? 'dark' : 'light');

      return {isDarkMode: newTheme};
    });
  },

  checkJamatTime: async () => {
    alert('hye');
    console.log('✅ checkJamatTime function is running!');
  },

  fetchPrayers: async () => {
    try {
      const {data} = await api.get('/prayer');
      set({prayers: data});
      if (data.length > 0) {
        await AsyncStorage.setItem('prayers', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to fetch prayers:', error);
      const storedPrayers = await AsyncStorage.getItem('prayers');
      if (storedPrayers) {
        set({prayers: JSON.parse(storedPrayers)});
      }
    }
  },

  updatePrayerTime: async updatedTimes => {
    try {
      const response = await api.post('/prayer/set', updatedTimes);
      const updatedPrayers = response.data.updatedPrayers;

      if (!Array.isArray(updatedPrayers)) {
        throw new Error('Updated prayers should be an array');
      }

      let newPrayers;

      set(state => {
        newPrayers = state.prayers.map(prayer => {
          const updatedPrayer = updatedPrayers.find(
            updated => updated.prayerName === prayer.prayerName,
          );

          return {
            ...prayer,
            jamatTime: updatedPrayer?.jamatTime || prayer.jamatTime,
            isJamatOn: updatedPrayer?.isJamatOn ?? prayer.isJamatOn,
          };
        });

        return {prayers: newPrayers};
      });

      // Await AsyncStorage update AFTER Zustand state update
      await AsyncStorage.setItem('prayers', JSON.stringify(newPrayers));
    } catch (error) {
      console.error('Failed to update prayer times:', error);
    }
  },

  login: async (email, password) => {
    try {
      console.log('Attempting login with email:', email);

      const {data} = await api.post('/admin/login', {email, password});

      console.log('Login response:', data);

      // Check for success using the message returned
      if (data.message === 'Login successful!') {
        console.log('Login successful, setting isAdmin to true');
        set({isAdmin: true});
        return true; // Return true to indicate successful login
      } else {
        console.log('Login failed, status:', data.message);
        return false; // Return false if login was unsuccessful
      }
    } catch (error) {
      console.error('Login failed with error:', error);
      alert(error.response?.data?.message || 'Invalid credentials!');
    }
  },

  logout: () => set({isAdmin: false}),
}));

export default useObjectsStore;
