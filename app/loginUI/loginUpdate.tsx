import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { getDatabase, ref, update } from 'firebase/database'; // Adjust import based on your Firebase setup
import useLoginId from '../getData/loginId'; // Custom hook to get loginId


const UpdateUserData = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  const loginId = useLoginId(); // Assuming you have a hook to get loginId

  interface UpdateUserDataProps {
    firstName?: string;
    lastName?: string;
    password?: string;

  }

  interface LoginId {
    id: string;
  }

  const updateUserData = async (data: UpdateUserDataProps): Promise<boolean> => {
    const db = getDatabase();
    try {
      const userId: LoginId = await loginId; // Await the Promise to get the resolved value
      const userRef = ref(db, `user/${userId.id}`);
      await update(userRef, data);
      console.log('Update successful');
      return true;
    } catch (error) {
      console.error('Update failed:', error);
      return false;
    }
  };

  const handleUpdate = async () => {
    const success = await updateUserData({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    if (success) {
      Alert.alert("Name update successful");
      // Add any additional logic you want after a successful update
    } else {
      Alert.alert("Update failed, please try again.");
    }
  };

  const handleUpdatePassword = async () => {
    // Implement your password update logic here
    const success = await updateUserData({
      password: password.trim(),
    });

    if (success) {
      Alert.alert("Password update successful");
      // Add any additional logic you want after a successful update
    } else {
      Alert.alert("Password update failed, please try again.");
    }
  };



  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
    
      <Button title="Update Name" onPress={handleUpdate} />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Update Password" onPress={handleUpdatePassword} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default UpdateUserData;