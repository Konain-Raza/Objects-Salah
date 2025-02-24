import {create} from 'zustand';
import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colorScheme} from 'nativewind';
import {schedulePrayerAlarms} from '../services/sheduleAlarms';

const useObjectsStore = create(set => ({
  prayers: async () => {
    await AsyncStorage.getItem('prayers');
  },
  isAdmin: true,
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

  fetchPrayers: async () => {
    try {
      console.log("Fetching prayers from API...");
      const { data } = await api.get('/prayer');
      set({ prayers: data });
  
      if (data.length > 0) {
        await AsyncStorage.setItem('prayers', JSON.stringify(data));
        console.log("Prayers saved to AsyncStorage:", data);
        return { success: true, prayers: data };
      }
    } catch (error) {
      console.error("Failed to fetch prayers from API:", error);
  
      // Try loading from AsyncStorage
      const storedPrayers = await AsyncStorage.getItem('prayers');
      if (storedPrayers) {
        const parsedPrayers = JSON.parse(storedPrayers);
        set({ prayers: parsedPrayers });
  
        console.log("Loaded prayers from AsyncStorage:", parsedPrayers);
        return { success: true, prayers: parsedPrayers };
      }
    }
  
    console.log("No prayers found in API or AsyncStorage.");
    return { success: false, prayers: [] }; // Ensures a valid return
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
      return {
        success: true,
        prayers: newPrayers,
      };
    } catch (error) {
      console.error('Failed to update prayer times:', error);
      alert('Failed to update prayer times ' + error.message);
      return {
        success: false,
      };
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
