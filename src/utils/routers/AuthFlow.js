import LoginScreen from '../../screens/LoginScreen';
import HomeStack from './HomeStack';
import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();
const AuthFlow = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="HomeStack" component={HomeStack} />
    </Stack.Navigator>
  );
};

export default AuthFlow;
