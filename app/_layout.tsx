/*import { useState, useEffect } from "react";
import { StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';
//import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DetailsScreen from '@/app/screens/DetailsScreen'; // 导入详情页
import ImageSearch from '@/app/screens/ImageSearch';

const PlaceholderImage = require('@/assets/images/kongbai.png');

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {

  return (
    <>
      <Button
        label="Change Details Page"
        onPress={() => navigation.navigate('Details')} // 跳转到详情页
      />
      <Button
        label="Change ImageSearch Page"
        onPress={() => navigation.navigate('ImageSearch')} // 跳转到详情页
      />
    </>
  )
}

function App() {
  return (
    //<NavigationContainer>
    <>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="ImageSearch" component={ImageSearch} />
    </Stack.Navigator>
    </>
    //</NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
})

export default App;*/

// app/_layout.tsx
import 'react-native-gesture-handler'; // 必须放在最顶部
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Register from './loginUI/Register';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Tab导航作为主界面 */}
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
      <Stack.Screen 
          name="Register" 
          options={{ title: '用户注册' }}
        />
          {/* 其他独立页面 
          <Stack.Screen
            name="details"
            options={{ title: '详情页' }}
          />
          <Stack.Screen
            name="image-search"
            options={{ title: '图片搜索' }}
          />
          <Stack.Screen
            name="qrcode-search"
            options={{ headerShown: false }}
          />*/}
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}