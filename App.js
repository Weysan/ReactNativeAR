import React from 'react';
import ARCamera from './ARCamera';
import * as Permissions from 'expo-permissions';
import { Text, View } from 'react-native';
import { Camera } from 'expo-camera';

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    hasLocationPermission: null,
    type: Camera.Constants.Type.back,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });

    const { statusLocation } = await Permissions.askAsync(Permissions.LOCATION);
    this.setState({ hasLocationPermission: statusLocation === 'granted' });
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera or Location</Text>;
    } else {
      return (
        <ARCamera/>
      );
    }
  }
}
