import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  BackHandler,
  Alert,
  StatusBar,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import {Button, Container, Content, Header, Icon, ListItem} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {socket} from '../utils/constants';
const {height, width} = Dimensions.get('screen');
const HomeScreen = ({navigation, route}) => {
  const handleLogOut = async () => {
    await AsyncStorage.removeItem('user');
    BackHandler.exitApp();
  };
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState({});
  const [userSocketId, setUserSocketId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState('connecting');
  let incomingCall = false;
  useEffect(async () => {
    console.log(route);
    const value = await AsyncStorage.getItem('user');
    let user = {};
    if (value != null) {
      user = JSON.parse(value);
      setUserData(user);
    }
    socket.emit('login');
    socket.on('login', async res => {
      console.log('relogin');
      setUserSocketId(res.socketId);
      console.log(res);
    });
  }, []);

  useEffect(() => {
    if (userSocketId != null) {
      getClients(userSocketId);
      setSocketStatus('connected');
    }
  }, [userSocketId]);

  useEffect(() => {
    socket.on('offer', async (id, message) => {
      if (!incomingCall && userData) {
        incomingCall = true;
        Alert.alert(
          'Incoming Call',
          message.senderName,
          [
            {
              text: 'Answer',
              onPress: () => {
                incomingCall = false;
                navigation.navigate('Incoming', {
                  user: {name: userData.name, socketId: userSocketId},
                  callDetails: {
                    offerIceCandidate: message.offerIceCandidate,
                    offerLocalDescription: message.offerLocalDescription,
                    revceiver: message.receiver,
                    sender: message.sender,
                    senderName: message.senderName,
                  },
                });
              },
            },
            {text: ''},
            {
              text: 'Reject',
              onPress: () => {
                incomingCall = false;
              },
            },
          ],
          {cancelable: false},
        );
        console.log(message);
      }
    });
  }, []);

  const getClients = userSoceket => {
    console.log('im called');
    socket.emit('getConnectedClients');
    socket.on('getConnectedClients', res => {
      if (res.clients && res.clients.length > 1) {
        let clients = [];
        clients = res.clients;
        clients.splice(clients.indexOf(userSoceket), 1);
        setUsers(clients);
      }
      setLoading(false);
      setRefreshing(false);
    });
  };

  return (
    <Container>
      <Header
        style={{
          backgroundColor: 'white',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View style={{flexDirection: 'column'}}>
          <Text style={{color: 'grey', fontSize: 16}}>{userData.name}</Text>
          {/* <Text style={{color: 'grey', fontSize: 12}}>{userSocketId}</Text> */}
        </View>
        <Icon
          name="ios-exit-outline"
          style={{color: 'grey', marginRight: 10}}
          onPress={() => {
            Alert.alert('Logout', 'Are you sure to logout and exit the app?', [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'OK', onPress: () => handleLogOut()},
            ]);
          }}
        />
      </Header>
      {loading ? (
        <ActivityIndicator color="grey" style={{marginTop: '50%'}} />
      ) : (
        <FlatList
          data={users}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            getClients(userSocketId);
          }}
          renderItem={({item}) => {
            return (
              <ListItem style={{justifyContent: 'space-between'}} key={item}>
                <View style={{flexDirection: 'column'}}>
                  <Text>{item}</Text>
                </View>
                <Button
                  transparent
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate('Outgoing', {
                      receiver: item,
                      sender: userSocketId,
                      user: userData,
                    });
                  }}>
                  <Image
                    source={require('../assets/icons/outgoing.png')}
                    style={{
                      height: 40,
                      width: 40,
                      alignSelf: 'center',
                    }}></Image>
                </Button>
              </ListItem>
            );
          }}
          keyExtractor={item => item}
        />
      )}
      <StatusBar
        backgroundColor={socketStatus == 'connected' ? 'white' : 'red'}
        barStyle="dark-content"
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={socketStatus == 'connected' ? false : true}
        onRequestClose={() => {}}>
        <View style={styles.modalView}>
          <ActivityIndicator color="white" />
          <Text style={{color: 'white', marginLeft: 10}}>
            Connecting to socket server....
          </Text>
        </View>
      </Modal>
    </Container>
  );
};
const styles = StyleSheet.create({
  modalView: {
    width: '100%',
    height: 58,
    backgroundColor: 'red',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    width: '20%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderRadius: 5,
    borderColor: 'lightgrey',
  },
});
export default HomeScreen;
