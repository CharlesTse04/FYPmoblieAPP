import { List, ListItem, Box, ListItemButton, ListItemIcon, ListItemText, Switch } from "@mui/material";
import Settings from '@mui/icons-material/Settings'; // Import the Settings icon
import React from "react";
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import { ModeNight } from "@mui/icons-material";

const Sidebar = () => {
    return (
        <Box flex={1} p={2} height="4px"
            sx={{ display: { xs: "none", sm: "block" } }}
        >
            
            <Box position="fixed">
   
                <ListItem disablePadding>
                    <ListItemButton component="a" href="#home">
                        <ListItemIcon>
                       
                        </ListItemIcon>
                        <ListItemText primary="Homepage" />
                    </ListItemButton>
                </ListItem>
            <List>
                <ListItem disablePadding>
                    <ListItemButton component="a" href="#home">
                        <ListItemIcon>
                            <Settings />
                        </ListItemIcon>
                        <ListItemText primary="Homepage" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton component="a" href="#Groupes">
                        <ListItemIcon>
                            <GroupIcon />
                        </ListItemIcon>
                        <ListItemText primary="Groupes" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton component="a" href="#Marketplace">
                        <ListItemIcon>
                            <ShoppingCartIcon />
                        </ListItemIcon>
                        <ListItemText primary="Marketplace" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton component="a" href="#Firends">
                        <ListItemIcon>
                            <PersonAddIcon />
                        </ListItemIcon>
                        <ListItemText primary="Firends" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton component="a" href="#Settings">
                        <ListItemIcon>
                            <Settings />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton component="a" href="#Profile">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="Profile" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton component="a" href="#simple-list">
                        <ListItemIcon>
                            <ModeNight />
                        </ListItemIcon>
                        <Switch />
                    </ListItemButton>
                </ListItem>
            </List>
            </Box>
        </Box>
    );
};

export default Sidebar;