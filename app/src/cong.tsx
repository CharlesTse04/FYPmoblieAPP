import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // { version 2 }
import { getDatabase } from "firebase/database"; // { version 2 }

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

const auth = getAuth(cong); // { version 2 }
const db = getDatabase(cong); // { version 2 }

//export default cong;
export { cong, auth, db };  // { version 2 }