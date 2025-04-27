
import { Box } from "@mui/material";

import React, { useState } from "react";

import Post from "../components/Post";



const Feed = () => {
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Box flex={4} p={2}>
           <Post />
           <Post />
        </Box>
    );
};

export default Feed;