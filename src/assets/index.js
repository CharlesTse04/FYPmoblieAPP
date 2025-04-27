import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyAqmI8e_ZB4txdq48T9b0wiMgLRsNy-wU8",
    authDomain: "typ-test-53bc0.firebaseapp.com",
    databaseURL: "https://typ-test-53bc0-default-rtdb.firebaseio.com",
    projectId: "typ-test-53bc0",
    storageBucket: "typ-test-53bc0.appspot.com",
    messagingSenderId: "469407202354",
    appId: "1:469407202354:web:41b11a63bc8e29c910102b",
    measurementId: "G-V4ZFTHWLWN"
};

const cong = initializeApp(firebaseConfig);

export default cong;