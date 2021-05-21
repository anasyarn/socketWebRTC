import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeStack from './HomeStack';
import AuthFlow from './AuthFlow';
import {ActivityIndicator, View} from 'react-native';
import {useState, useEffect} from 'react';

const routers = () => {
  const [loadingAuthentication, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  useEffect(async () => {
    try {
      const value = await AsyncStorage.getItem('user');
      if (value !== null) {
        setTimeout(() => {
          setUserData(JSON.parse(value));
          setLoading(false);
          // this.setState({userData: value, loadingAuthentication: false});
        }, 1000);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  });
  return (
    <NavigationContainer>
      {loadingAuthentication ? (
        <View style={{marginTop: '50%'}}>
          <ActivityIndicator color="grey" />
        </View>
      ) : userData ? (
        <HomeStack />
      ) : (
        <AuthFlow />
      )}
    </NavigationContainer>
  );
};

export default routers;
