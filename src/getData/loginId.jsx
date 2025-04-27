// getLoginId.jsx
const getLoginId = () => {
    const userData = localStorage.getItem('Login');
    if (userData) {
        return JSON.parse(userData); // Parse the JSON and return the object
    }
    return null; // Return null if no user data is found
};

export default getLoginId;