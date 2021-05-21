import React, {Component} from 'react';
import HomeScreen from '../../screens/HomeScreen';
import OutgoingScreen from '../../screens/OutgoingScreen';
import IncomingScreen from '../../screens/IncomingScreen';
import {createStackNavigator} from '@react-navigation/stack';
const Stack = createStackNavigator();
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Outgoing" component={OutgoingScreen} />
      <Stack.Screen name="Incoming" component={IncomingScreen} />
    </Stack.Navigator>
  );
};

export default HomeStack;
