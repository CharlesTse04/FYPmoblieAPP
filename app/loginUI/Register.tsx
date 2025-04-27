import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { getDatabase, ref, set } from 'firebase/database';
import { cong } from '../src/cong'; // Import Firebase configuration
import { encrypt  } from '../crypto/jmjm';


function RegisterApp() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState({
        area: '',
        flat: '',
        house: '',
        room: ''
    });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const handleSubmit = async () => {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage("Please enter a valid email address.");
            setMessageType("error");
            return;
        }

        try {
            // Encrypt sensitive fields
            const encryptedEmail = encrypt(email);
            const encryptedPassword = encrypt(password);
            const encryptedPhone = encrypt(phoneNumber);

            const db = getDatabase(cong);
            const encryptKey = encrypt(`${phoneNumber}-${email.replace(/[\.\#\$\[\]]/g, '-')}`);
            const userRef = ref(db, `user/${encryptKey}`);

            await set(userRef, {
                firstName,
                lastName,
                email: encryptedEmail, // Encrypted email
                password: encryptedPassword, // Encrypted password
                phoneNumber: encryptedPhone, // Encrypted phone
                address,
                name: `${lastName} ${firstName}`,
                Point: 0,
            });

            setMessage("Registration successful! You can now log in.");
            setMessageType("success");

            // Clear form fields
            setEmail('');
            setFirstName('');
            setLastName('');
            setPassword('');
            setPhoneNumber('');
            setAddress({ area: '', flat: '', house: '', room: '' });
        } catch (error) {
            console.error("Error:", error);
            setMessage(`Registration failed: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
            setMessageType("error");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Account</Text>
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
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                
            />
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                
                keyboardType="phone-pad"
            />
            <TextInput
                style={styles.input}
                placeholder="Area"
                value={address.area}
                onChangeText={(value) => setAddress({ ...address, area: value })}
                
            />
            <TextInput
                style={styles.input}
                placeholder="House"
                value={address.house}
                onChangeText={(value) => setAddress({ ...address, house: value })}
            />
            <TextInput
                style={styles.input}
                placeholder="Flat"
                value={address.flat}
                onChangeText={(value) => setAddress({ ...address, flat: value })}
            />
            <TextInput
                style={styles.input}
                placeholder="Room"
                value={address.room}
                onChangeText={(value) => setAddress({ ...address, room: value })}
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            {message ? (
                <Text style={{ color: messageType === "error" ? 'red' : 'green' }}>
                    {message}
                </Text>
            ) : null}
            <TouchableOpacity style={styles.loginButton}>
                <Text>Log in</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingLeft: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
    },
    loginButton: {
        marginTop: 20,
        alignItems: 'center',
    },
});

export default RegisterApp;