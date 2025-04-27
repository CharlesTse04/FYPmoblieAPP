// app/qr-scanner.tsx
import { CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import {
  AppState,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Platform } from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function QRScanner() {
  const router = useRouter();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!qrLock.current && data) {
      qrLock.current = true;
      
      // 跳转到详情页并传递扫描结果
      router.push({
        pathname: "/QRcodeSearch/DisplayIdScreen",
        params: { id: data }
      });

      // 2秒后允许再次扫描
      setTimeout(() => {
        qrLock.current = false;
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "QR Scanner",
          headerShown: false,
        }}
      />
      
      {Platform.OS === "android" && <StatusBar hidden />}
      
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
      />
           <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 10,
    zIndex: 999
  }
});