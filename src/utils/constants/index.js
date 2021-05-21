import Socket from 'socket.io-client';
export const urls = {
  liveSocketUri: 'your signaling socket server url',
  testSocketUri: 'https://a8945db2f3ee.ngrok.io',
};
export const socket = Socket.connect(urls.liveSocketUri);
