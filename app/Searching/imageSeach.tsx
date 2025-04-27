import React, { useState } from 'react';
import { Button, Image, View, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';


type ImageFile = {
  uri: string;
};

type ApiResponse = {
  predicted_class: string;
} | {
  error: string;
};

export default function App() {
  
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相机权限');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,  // 压缩图片减少上传体积
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (imageFile: ImageFile): Promise<void> => {
    setLoading(true);
    try {

      // 创建 FormData
      const formData = new FormData();
      formData.append('file', {
        uri: imageFile.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);  // 类型断言解决 React Native 的类型问题

      console.log('FormData:', formData);
      // 发送请求
      const response = await fetch(`http://192.168.0.102:5010/api/add`, {
        method: 'POST',
        body: formData,

      });

      // 处理 HTTP 错误状态码
      if (!response.ok) {
        throw new Error(`HTTP 错误！状态码：${response.status}`);
      }

      // 解析 JSON
      const data: ApiResponse = await response.json();

      // 类型守卫检查响应结构
      if ('predicted_class' in data) {
        Alert.alert('识别结果', `预测类别：${data.predicted_class}`);
        navigation.navigate('Searching/Search', {
            searchQuery: data.predicted_class // 显式声明更安全
          });
        console.log('识别成功:', data.predicted_class);
      } else {
        throw new Error(data.error || '未知错误');
      }
    } catch (error) {

      Alert.alert('上传失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="拍照上传" onPress={takePhoto} />
      )}
    </View>
  );
}