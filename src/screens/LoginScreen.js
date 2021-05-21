import React, {Component, useState, useEffect} from 'react';
import {
  Text,
  View,
  Dimensions,
  StatusBar,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  In,
} from 'react-native';
import {Container, Header, Button, Input, Toast} from 'native-base';
const {height, width} = Dimensions.get('window');
const proportional = (height * width) / height + width;
import AsyncStorage from '@react-native-async-storage/async-storage';
import {urls, socket} from '../utils/constants/index';
const LoginScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = name => {
    if (name == '') {
      Toast.show({
        text: 'Enter name',
        buttonText: '',
        type: 'danger',
        position: 'bottom',
      });
      return;
    }

    setLoading(true);
    try {
      socket.emit('login');
      socket.on('login', async res => {
        await AsyncStorage.setItem('user', JSON.stringify({name: name}));
        
        navigation.navigate('HomeStack', {
          screen: 'HomeScreen',
          params: {
            socketId: res.socketId,
            user: {name: name},
          },
        });
      });
    } catch (error) {
      alert(error);
    }
  };

  return (
    <Container>
      <Header
        style={{
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{color: 'grey', fontSize: 24}}>Login</Text>
      </Header>
      <ScrollView>
        <View
          style={{
            width: '90%',
            alignSelf: 'center',
            flexDirection: 'column',
            marginTop: '50%',
          }}>
          <Text style={{fontSize: 18}}>Enter your name</Text>
          <Input
            placeholder={'Enter name'}
            placeholderTextColor="grey"
            onChangeText={txt => {
              setName(txt);
            }}
            autoCapitalize="none"
            style={styles.inputField}
            underlineColor="grey"
            value={name}
          />
        </View>
      </ScrollView>
      <Button
        full
        disabled={loading}
        style={{
          backgroundColor: loading ? 'grey' : '#FC5372',
          marginTop: 20,
          width: '90%',
          borderRadius: 5,
          alignSelf: 'center',
          marginBottom: 20,
        }}
        onPress={() => {
          handleLogin(name);
        }}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{color: 'white', fontSize: 18}}>Continue</Text>
        )}
      </Button>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
    </Container>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff'},
  head: {height: 40, backgroundColor: '#f1f8ff'},
  wrapper: {flexDirection: 'row'},
  title: {flex: 1, backgroundColor: '#f6f8fa'},
  row: {height: 28},
  text: {textAlign: 'center'},
  inputContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 15,
  },
  inputField: {
    borderWidth: 1,
    width: '100%',
    borderColor: 'lightgrey',
    borderRadius: 5,
    height: 50,
    backgroundColor: '#F8F9FA',
  },
});
