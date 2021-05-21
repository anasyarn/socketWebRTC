import React, {useState, useEffect} from 'react';
import {
  View,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import {RTCPeerConnection, RTCView, mediaDevices} from 'react-native-webrtc';
import {Container, Icon} from 'native-base';
const {height, width} = Dimensions.get('screen');
import {socket} from '../utils/constants';
//////

const IncomingScreen = ({navigation, route}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [cachedLocalPC, setCachedLocalPC] = useState(null);
  const [cachedRemotePC] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFront] = useState(true);
  const [audio] = useState(true);
  const [video] = useState(true);
  const [user] = useState(route.params.user);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [callDetails] = useState(route.params.callDetails);

  useEffect(() => {
    startLocalStream();
  }, []);

  const startLocalStream = async () => {
    const devices = await mediaDevices.enumerateDevices();
    const facing = isFront ? 'front' : 'environment';
    const videoSourceId = devices.find(
      device => device.kind === 'videoinput' && device.facing === facing,
    );
    const facingMode = isFront ? 'user' : 'environment';
    const constraints = {
      audio: audio,
      video: video
        ? {
            height: height,
            width: width,
            facingMode,
            optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
          }
        : false,
    };
    const newStream = await mediaDevices.getUserMedia(constraints);
    setLocalStream(newStream);
    startCall(newStream);
  };
  useEffect(() => {
    connectionStatus == 'disconnected' && closeStreams();
  }, [connectionStatus]);

  const startCall = async stream => {
    const configuration = {
      iceServers: [
        {
          urls: ['stun:stun.l.google.com:19302'],
        },
      ],
    };
    const localPC = new RTCPeerConnection(configuration);
    localPC.addStream(stream);
    localPC.onaddstream = e => {
      console.log('onaddstream');
      if (e.stream && remoteStream !== e.stream) {
        setRemoteStream(e.stream);
      }
    };
    localPC.onicecandidate = async e => {
      try {
        if (e.candidate != null) {
          socket.emit('answerIceCandiate', callDetails.sender, e.candidate);
        }
      } catch (err) {
        console.error(`Error adding remotePC iceCandidate: ${err}`);
      }
    };
    try {
      await localPC.setRemoteDescription(callDetails.offerLocalDescription);
      const answer = await localPC.createAnswer();
      await localPC.setLocalDescription(answer);
      socket.emit('answerLocalDescription', callDetails.sender, answer);
    } catch (e) {
      console.log(e);
    }
    callDetails.offerIceCandidate.forEach(async data => {
      try {
        await localPC.addIceCandidate(data);
      } catch (e) {
        console.log('answer Ice' + e);
      }
    });

    localPC.onconnectionstatechange = e => {
      console.log('state', e.target);
      setConnectionStatus(e.target.connectionState);
    };

    setCachedLocalPC(localPC);
  };

  const closeStreams = () => {
    if (cachedLocalPC) {
      cachedLocalPC.removeStream(localStream);
      cachedLocalPC.close();
    }
    if (cachedRemotePC) {
      cachedRemotePC.removeStream(remoteStream);
      cachedRemotePC.close();
    }
    navigation.goBack();
  };
  const toggleMute = () => {
    if (!remoteStream) return;
    else {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMuted(!isMuted);
      });
    }
  };
  const switchCamera = () => {
    localStream.getVideoTracks().forEach(track => track._switchCamera());
  };
  return (
    <Container>
      <View>
        <View
          style={{
            height: height,
            width: width,
            backgroundColor: 'black',
          }}>
          {remoteStream && (
            <RTCView
              zOrder={-1}
              objectFit={'cover'}
              style={{width: '100%', height: '100%'}}
              streamURL={remoteStream.toURL()}
              mirror={true}
            />
          )}
        </View>
        <View
          style={{
            height: height * 0.17,
            borderRadius: 5,
            width: width * 0.3,
            backgroundColor: 'grey',
            position: 'absolute',
            top: height * 0.055,
            left: width * 0.03,
            overflow: 'hidden',
          }}>
          {localStream && (
            <RTCView
              zOrder={1}
              objectFit={'cover'}
              style={{height: '100%', width: '100%'}}
              streamURL={localStream.toURL()}
              mirror={true}
            />
          )}
        </View>
        {connectionStatus != 'connected' ? (
          <View
            style={{
              backgroundColor: 'red',
              height: height * 0.045,
              width: '100%',
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              paddingHorizontal: 20,
            }}>
            <ActivityIndicator color="white" />
            <Text style={{color: 'white', marginLeft: 10}}>
              {connectionStatus}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            height: height * 0.2,
            width: width,
            backgroundColor: 'transparent',
            position: 'absolute',
            bottom: 0,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginBottom: height * 0.1,
          }}>
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
              marginLeft: width * 0.15,
            }}>
            {isMuted ? (
              <Icon
                type="MaterialCommunityIcons"
                name="microphone-off"
                style={{fontSize: 38, color: 'red'}}
                onPress={() => {
                  toggleMute();
                }}
              />
            ) : (
              <Icon
                type="MaterialCommunityIcons"
                name="microphone"
                style={{fontSize: 38}}
                onPress={() => {
                  toggleMute();
                }}
              />
            )}
          </View>

          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
            }}>
            <Icon
              name="ios-call"
              style={{color: 'red', fontSize: 38}}
              onPress={() => {
                closeStreams();
              }}
            />
          </View>
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
              marginRight: width * 0.15,
            }}>
            <Icon
              name="camera-reverse"
              style={{fontSize: 38, color: '#10B83B'}}
              onPress={() => {
                switchCamera();
              }}
            />
          </View>
        </View>
      </View>
      <StatusBar
        backgroundColor={connectionStatus == 'connected' ? '#10B83B' : 'red'}
        barStyle="light-content"
      />
    </Container>
  );
};

export default IncomingScreen;
