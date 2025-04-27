import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions
import cong from '../assets/index'; // Ensure correct Firebase config import

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const ManageGalleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [newGallery, setNewGallery] = useState({
    galleryId: '',
    price: '',
    quantity: '',
    name: '',
    discount: 0,
    status: '',
    pre_status: '',
    type: '',
    imageUrl: '', // Add image URL state
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showPreOrder, setShowPreOrder] = useState(false);
  const [imageFile, setImageFile] = useState(null); // State to hold the image file
  const db = getDatabase(cong);
  const storage = getStorage(cong);

  useEffect(() => {
    const galleriesRef = ref(db, 'galleries/');
    onValue(galleriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const galleriesList = Object.values(data);
        setGalleries(galleriesList);
      }
    });
  }, [db]);

  const handleGalleryChange = (e) => {
    const { name, value } = e.target;
    setNewGallery((prevGallery) => ({
      ...prevGallery,
      [name]: value,
    }));

    if (name === "status") {
      setShowDiscount(value === "specials");
      setShowPreOrder(value === "pre order");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const addGallery = async () => {
    const { galleryId, price, quantity, name, status, type } = newGallery;
    
    if (galleryId && price && quantity && name && status && type && imageFile) {
      try {
        // Upload the image file to Firebase Storage
        const imgRef = storageRef(storage, `images/${galleryId}`);
        await uploadBytes(imgRef, imageFile);
        const imageUrl = await getDownloadURL(imgRef);

        const galleryRef = ref(db, `galleries/${galleryId}`);
        const galleryData = {
          galleryId,
          name,
          price: Number(price),
          quantity: Number(quantity),
          discount: newGallery.discount,
          status,
          pre_status: newGallery.pre_status,
          type,
          imageUrl, // Save the image URL in the database
        };
        await set(galleryRef, galleryData);
        setGalleries((prev) => [...prev, galleryData]);
        setNewGallery({
          galleryId: '',
          price: '',
          quantity: '',
          name: '',
          discount: 0,
          status: '',
          pre_status: '',
          type: '',
          imageUrl: '',
        });
        setImageFile(null); // Reset the image file
        setShowDiscount(false);
        setShowPreOrder(false);
        setOpenSnackbar(true);
        setErrorMessage("Gallery added successfully!");
      } catch (error) {
        setErrorMessage("Error adding gallery: " + error.message);
        setOpenSnackbar(true);
      }
    } else {
      setErrorMessage("Please fill out all fields.");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box flex={4} p={2}>
      <Typography variant="h6" component="div" gutterBottom>
        Add Gallery
      </Typography>

      <TextField
        fullWidth
        name="galleryId"
        label="Gallery ID"
        value={newGallery.galleryId}
        onChange={handleGalleryChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        name="name"
        label="Name"
        value={newGallery.name}
        onChange={handleGalleryChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        name="price"
        label="Price"
        type="number"
        value={newGallery.price}
        onChange={handleGalleryChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        name="quantity"
        label="Quantity"
        type="number"
        value={newGallery.quantity}
        onChange={handleGalleryChange}
        margin="normal"
        required
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="type-select-label">Type</InputLabel>
        <Select
          labelId="type-select-label"
          id="type-select"
          value={newGallery.type}
          label="Type"
          onChange={handleGalleryChange}
          name="type"
          required
        >
          <MenuItem value={"Pokémon Cards"}>Pokémon Cards</MenuItem>
          <MenuItem value={"Trainer Cards"}>Trainer Cards</MenuItem>
          <MenuItem value={"Energy Cards"}>Energy Cards</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="status-select-label">Status</InputLabel>
        <Select
          labelId="status-select-label"
          id="status-select"
          value={newGallery.status}
          label="Status"
          onChange={handleGalleryChange}
          name="status"
          required
        >
          <MenuItem value={"default"}>Default</MenuItem>
          <MenuItem value={"specials"}>Specials</MenuItem>
          <MenuItem value={"pre order"}>Pre Order</MenuItem>
        </Select>
      </FormControl>

      {showDiscount && (
        <Box display="flex" alignItems="center" marginTop={2}>
          <TextField
            name="discount"
            label="Discount (%)"
            type="number"
            value={newGallery.discount}
            onChange={handleGalleryChange}
            margin="normal"
            required
            inputProps={{
              min: 1,
              max: 100,
            }}
            helperText="Enter a value between 1 and 100"
          />
          <Typography variant="h6" marginLeft={1}>%</Typography>
        </Box>
      )}

      {showPreOrder && (
        <Box display="flex" alignItems="center" marginTop={2}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="pre_status-select-label">Pre Status</InputLabel>
            <Select
              labelId="pre_status-select-label"
              id="pre_status-select"
              value={newGallery.pre_status}
              label="Pre status"
              onChange={handleGalleryChange}
              name="pre_status"
              required
            >
              <MenuItem value={"0"}>Accepting Reservations</MenuItem>
              <MenuItem value={"1"}>Temporarily Not Accepting Reservations</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        required
      />

      <Button variant="contained" color="primary" onClick={addGallery} style={{ marginTop: 16 }}>
        Add Gallery
      </Button>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={errorMessage.includes("Error") ? "error" : "success"}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageGalleries;