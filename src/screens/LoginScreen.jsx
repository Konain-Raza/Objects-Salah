import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import useObjectsStore from '../store/objectsStore';
import {useNavigation} from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {login} = useObjectsStore();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const isSuccess = await login(email, password);
      if (isSuccess) {
        navigation.navigate('Home');
      } else {
        setErrorMessage('Invalid credentials!');
      }
    } catch {
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center px-14 py-8 font-gilroy">
    <Image
      source={require('../../assets/images/icon.png')}
      className="w-44 h-44 mb-6"
    />
    <TextInput
      className="bg-gray-50 dark:bg-gray-800 border font-gilroy border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-4 mb-4"
      placeholder="Email"
      value={email}
      placeholderTextColor={'gray'}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      editable={!loading}
    />
    <TextInput
      className="bg-gray-50 dark:bg-gray-800 border font-gilroy border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-4 mb-4"
      placeholder="Password"
      placeholderTextColor={'gray'}
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      editable={!loading}
    />
    {errorMessage && (
      <Text className="text-red-500 text-sm mb-4">{errorMessage}</Text>
    )}
    <TouchableOpacity
      className="w-full bg-blue-600 dark:bg-blue-700 py-3 rounded-lg items-center mb-6 shadow-md disabled:opacity-50"
      onPress={handleLogin}
      disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-white font-gilroyBold text-lg">
          Login
        </Text>
      )}
    </TouchableOpacity>
    <Text className="text-gray-500 dark:text-gray-400 text-md font-gilroyBold ">
      This login is only for admin access.
    </Text>
  </View>
  );
};

export default LoginScreen;
