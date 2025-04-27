import React from 'react';
import { useState } from 'react';
//import { cong, auth, db } from '../../src/index.js'; // 导入 Firebase 配置
import { ref, set } from "firebase/database"; // { version 2 }

import { createUserWithEmailAndPassword } from "firebase/auth"; // { version 2 }
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
// import { hashData } from '../../src/hash.js'; // { version 2 }
//import { encrypt } from '../../src/jmjm.js'; // { version 2 }

const RegisterApp = () => {
    // console.log("Auth instance:", auth);
    // console.log("Firebase app:", cong);

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    // const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState({
        area: '',
        flat: '',
        house: '',
        room: ''
    });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const name = `${lastName} ${firstName}`;
    const [Point, setPoint] = useState(0);

    /*const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage("Please enter a valid email address.");
            setMessageType("error");
            return;
        }

        // Check if passwords match
        // { version 1}
        /*if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            setMessageType("error");
            return;
        }*/

        /*const db = getDatabase(cong);
        const userRef = ref(db, `user/${phoneNumber}-${email.replace(/[\.\#\$\[\]]/g, '-')}`);
        
        try {
            await set(userRef, {
                firstName,
                lastName,
                email,
                password, // Consider using Firebase Auth for actual applications
                phoneNumber,
                address,
                name,
                Point,
            });
            setMessage("Registration successful! You can now log in.");
            setMessageType("success");
            // Reset form fields
            setEmail('');
            setFirstName('');
            setLastName('');
            setPassword('');
            //setConfirmPassword('');
            setPhoneNumber('');
            setAddress({ area: '', flat: '', house: '', room: '' });
        } catch (error) {
            console.error("Error saving user:", error);
            setMessage("Error registering user. Please try again.");
            setMessageType("error");
        }*/

        // { version 2 }
        /*try {
            // 使用预初始化的 auth 实例
            /*const userCredential = await createUserWithEmailAndPassword(auth, email, password); // [!code ++]
            const user = userCredential.user;
            console.log("User created:", user.uid); // 确认 UID 生成*/

            // 哈希敏感字段
            /*const hashedEmail = hashData(email);
            const hashedPassword = hashData(password);
            const hashedPhone = hashData(phoneNumber);*/

            // 加密敏感字段
            /*const encryptedEmail = encrypt(email);
            const encryptedPassword = encrypt(password);
            const encryptedPhone = encrypt(phoneNumber);

            // 使用预初始化的 db 实例
            const encryptKey = encrypt(`${phoneNumber}-${email.replace(/[\.\#\$\[\]]/g, '-')}`);
            const userRef = ref(db, `user/${encryptKey}`);
            

            await set(userRef, {
                firstName,
                lastName,
                /*email: hashedEmail,
                password: hashedPassword,
                phoneNumber: hashedPhone,*/
                /*email: encryptedEmail,    // 加密后的邮箱
                password: encryptedPassword, // 加密后的密码
                phoneNumber: encryptedPhone, // 加密后的电话
                address,
                name,
                Point,
            });

            setMessage("Registration successful! You can now log in.");
            setMessageType("success");

            // 清空表单
            setEmail('');
            setFirstName('');
            setLastName('');
            setPassword('');
            setPhoneNumber('');
            setAddress({ area: '', flat: '', house: '', room: '' });
        } catch (error) {
            console.error("Error:", error);
            setMessage(`Registration failed: ( Error code: ${error.code}, Message: ${error.message} )`);
            setMessageType("error");
        }
    };*/

    return (
        /*<>
            <View>
                <View>
                    <h1>Create Account</h1>
                    <form onSubmit={handleSubmit}>
                        <View>
                            <Text>FirstName</Text>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required={true} />
                            <Text>LastName</Text>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required={true} />
                        </View>
                        <View>
                            <Text>Email</Text>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required={true} placeholder="e.g. abcdefg@gmail.com" />
                        </View>
                        <View>
                            <Text>Password</Text>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={true} />
                        </View>
                        <View>
                            <Text>Phone number</Text>
                            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g.12345678" required={true} />
                        </View>
                        <View>
                            <Text>Adress</Text>
                            <select id="country" onChange={(e) => setAddress({ ...address, area: e.target.value })} required={true}>
                                <option value="null">Select a Area</option>
                                <option value="Central and Western">Central and Western</option>
                                <option value="Eastern">Eastern</option>
                                <option value="Southern">Southern</option>
                                <option value="Wan Chai">Wan Chai</option>
                                <option value="Kowloon City">Kowloon City</option>
                                <option value="Kwun Tong">Kwun Tong</option>
                                <option value="Sham Shui Po">Sham Shui Po</option>
                                <option value="Wong Tai Sin">Wong Tai Sin</option>
                                <option value="Yau Tsim Mong">Yau Tsim Mong</option>
                                <option value="Islands">Islands</option>
                                <option value="Kwai Tsing">Kwai Tsing</option>
                                <option value="North">North</option>
                                <option value="Sai Kung">Sai Kung</option>
                                <option value="Sha Tin">Sha Tin</option>
                                <option value="Tai Po">Tai Po</option>
                                <option value="Tsuen Wan">Tsuen Wan</option>
                                <option value="Tuen Mun">Tuen Mun</option>
                                <option value="Yuen Long">Yuen Long</option>
                            </select>
                            <input type="text" value={address.house} onChange={(e) => setAddress({ ...address, house: e.target.value })} placeholder="Enter HOUSE" />
                            <input type="text" value={address.flat} onChange={(e) => setAddress({ ...address, flat: e.target.value })} placeholder="Enter FLAT" />
                            <input type="text" value={address.room} onChange={(e) => setAddress({ ...address, room: e.target.value })} placeholder="Enter ROOM" />
                        </View>
                        <View>
                            <input type="checkbox" id="agreeornot" required={true} />
                            <Text>Agreeing to the terms and conditions</Text>
                        </View>
                        <View>
                            <Button type='submit' id="btnSignup">Sign up</Button>
                        </View>
                    </form>
                    {message && (
                        <View>
                            {message}
                        </View>
                    )}
                    <View>
                        <Button>
                            <a href="Login.html">Log in</a>
                        </Button>
                    </View>
                </View>
            </View>
        </>*/
        <></>
    );
}

export default RegisterApp;