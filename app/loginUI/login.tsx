import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";
import { cong } from '../src/cong'; // 確保 Firebase 配置正確
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // 使用 React Navigation
import { encrypt } from '../crypto/jmjm';
// npx expo install expo-router @react-navigation/native react-native-screens react-native-safe-area-context

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const encryptedEmail = encrypt(email);
      const encryptedPassword = encrypt(password);

      const db = getDatabase(cong);
      const usersRef = ref(db, 'user');

      const snapshot = await get(usersRef);
      if (!snapshot.exists()) {
        throw new Error('用戶不存在');
      }

      let userFound = false;
      snapshot.forEach((child) => {
        const user = child.val();
        if (user.email === encryptedEmail) {
          userFound = true;
          if (user.password !== encryptedPassword) {
            throw new Error('密碼錯誤');
          }

          // 儲存用戶資料
          const userData = {
            id: child.key,
            phone: user.phoneNumber,
            Point: user.Point,
            ...user,
            area: user.address ? user.address.area || '' : '',
            house: user.address ? user.address.house || '' : '',
            flat: user.address ? user.address.flat || '' : '',
            room: user.address ? user.address.room || '' : '',
          };

          AsyncStorage.setItem('Login', JSON.stringify(userData));
          //navigation.navigate('Home'); // 導航到主頁面
        }
      });

      if (!userFound) {
        throw new Error('用戶不存在');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('發生未知錯誤');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>登入</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="電子郵件"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="密碼"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>登入</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linksContainer}>
   

          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => navigation.navigate('loginUI/Register')}
            
          >
            <Text style={styles.signupText}>建立新帳號</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {

    backgroundColor: '#f5f5f5',
  },
  innerContainer: {

    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linksContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    marginBottom: 15,
  },
  signupButton: {
    marginTop: 10,
    padding: 10,
  },
  signupText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default LoginScreen;
