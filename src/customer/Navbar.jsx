import { Notifications, Pets } from "@mui/icons-material";
import { MenuItem, Badge, Box, AppBar, styled, Toolbar, Typography, InputBase, Avatar, Menu, Button } from "@mui/material";
import React, { useState } from "react";
import MailIcon from '@mui/icons-material/Mail';


const StyledToolbar = styled(Toolbar)({
    display: "flex",
    justifyContent: "space-between"
});

const Search = styled("div")(({ theme }) => ({
    backgroundColor: "white",
    Padding: "0 10px",
    borderRadius: theme.shape.borderRadius,
    width: "40%"
}));

const Icons = styled(Box)(({ theme }) => ({
    display: "none",
    gap: "20px",
    alignItems: "center",
    [theme.breakpoints.up("sm")]: {
        display: "flex"
    }
}));

const UserBox = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: "10px",
    alignItems: "center",
    [theme.breakpoints.up("sm")]: {
        display: "none"
    }
}));

const Navbar = () => {
    const [open, setOpen] = useState(false)
    return (
        <AppBar  position="fixed" >
            <StyledToolbar>
                <Typography variant="h6" sx={{ display: { xs: "none", sm: "block" } }}>
                    Navbar
                </Typography>
                <Pets sx={{ display: { xs: "block", sm: "none" } }} />
                <Search><InputBase placeholder="search..." /></Search>
                <Icons>
                    <Badge badgeContent={4} color="error">
                        <MailIcon />
                    </Badge>

                    <Badge badgeContent={2} color="error">
                        <Notifications />
                    </Badge>
                    <Avatar sx={{ width: 30, height: 30 }}
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1DSRe0AulOa8ocHFyBhUSfixtnT7u79FKUg&s"
                        onClick={(e) => setOpen(true)}
                    />

                </Icons>
                <UserBox onClick={(e) => setOpen(true)}>
                    <Avatar sx={{ width: 30, height: 30 }} 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1DSRe0AulOa8ocHFyBhUSfixtnT7u79FKUg&s" />
                    <Typography variant="span">John</Typography>
                </UserBox>
            </StyledToolbar>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                open={open}
                onClose={(e)=>setOpen(false)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem>Profile</MenuItem>
                <MenuItem>My account</MenuItem>

                <a href="login.js"><MenuItem>Logout</MenuItem></a>
            </Menu>
        </AppBar>
    )
}
export default Navbar