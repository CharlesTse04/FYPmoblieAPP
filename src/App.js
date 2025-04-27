import Sidebar from "./customer/Sidebar.jsx"

import { Box } from "@mui/material"

import Login from "./login/Login.jsx";
import Register from "./customer/Register.tsx";
import AddNewCard from "./components/AddNewCard"
import BuyCard from "./customer/buyCard.jsx";
import Card from "./customer/card.jsx"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginId from "./getData/loginId.jsx";

import  AddCard  from "./customer/addCard.jsx";
import Update  from "./components/update.jsx";
import MyPage from "./components/mypage.jsx";
import Carddate from "./customer/CardData.jsx";



function App() {

  const loginId = LoginId();
  return (
    <Box>
      {/* <Navbar />
      { }
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Sidebar />
        <Feed />

      </Stack> */}


       {/* <NavBarApp />
    <Login />
      <Addtest /> */}


    {/* <NavBarApp />
    <Register /> */}

{/* <NavBarApp />
<Stack direction="row" spacing={2} justifyContent="flex-start" alignItems="flex-start">
<Sidebar />
<BuyCard />
</Stack> */}


<Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/Card" element={<Card />} />
        <Route path="/AddNewCard" element={<AddNewCard />} />
        <Route path="/mypage" element={<MyPage/>} />
        <Route path="/Sidebar" element={<Sidebar />} />
        <Route path="/buyCard" element={<BuyCard loginId={loginId} />}/>
        <Route path="/AddCard" element={<AddCard />} />
        <Route path="/update" element={<Update />} />
        <Route path="/Register" element={<Register />} />
        <Route path='/BuyCard' element={<BuyCard />} />
        <Route path='/Carddate' element={<Carddate />} />
      </Routes>
    </Router>

    </Box>

  );
}

export default App;