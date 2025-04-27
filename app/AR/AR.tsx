import React from 'react';
import { StyleSheet } from 'react-native';
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroText,
} from '@viro-community/react-viro';

const HelloWorldSceneAR = () => {
  return (
    <ViroARScene>
      <ViroText
        text="Hello AR World!"
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle}
      />
    </ViroARScene>
  );
};

export default () => {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{ scene: HelloWorldSceneAR }}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});