import React, { useState } from "react";
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
    Autocomplete,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { getDatabase, ref, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import cong from '../assets/index';
import Ratit from './Rarity.js';

const Alert = React.forwardRef((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const AddCard = () => {
    const initialFormData = {
        cardId: '',
        galleryId: '',
        name: '',
        engName: '', // 新增字段
        price: '',
        quantity: '',
        rarity: '',
        type: '',
        status: '',
        discount: 0,
        pre_status: '',
        image: null,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [errorMessage, setErrorMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);
    const [showPreOrder, setShowPreOrdert] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "discount" && value === "") {
            setFormData({ ...formData, [name]: 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (name === "status") {
            setShowDiscount(value === "specials");
            setShowPreOrdert(value === "pre order");
        }
    };

    const handleImageChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const db = getDatabase(cong);
        const storage = getStorage(cong);
        const formattedCardId = formData.cardId.replace(/\//g, '-');
        const cardRef = ref(db, `cards/${formattedCardId}`);

        try {
            let imageUrl = '';
            if (formData.image) {
                const imageRef = storageRef(storage, `images/${formData.image.name}`);
                await uploadBytes(imageRef, formData.image);
                imageUrl = await getDownloadURL(imageRef);
            }

            await set(cardRef, { ...formData, cardId: formattedCardId, image: imageUrl });
            setErrorMessage("Card added successfully!");
            setOpenSnackbar(true);
            setFormData(initialFormData);
            setShowDiscount(false);
            setShowPreOrdert(false);
        } catch (error) {
            console.error('Error adding card:', error);
            setErrorMessage("Error adding card: " + error.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Box flex={4} p={2}>
            <Typography variant="h5" component="div" gutterBottom>
                Add Card
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    name="cardId"
                    label="Card ID"
                    value={formData.cardId}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    name="name"
                    label="Chinese Name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    name="engName" // 新增输入框的 name 属性
                    label="English Name" // 输入框的标签
                    value={formData.engName} // 绑定值
                    onChange={handleChange} // 处理变化
                    margin="normal"
                    required
                />
                <Autocomplete
                    options={Ratit}
                    getOptionLabel={(option) => option.label}
                    onChange={(event, newValue) => {
                        setFormData({ ...formData, rarity: newValue ? newValue.label : '' });
                    }}
                    renderInput={(params) => <TextField {...params} label="Rarity" margin="normal" required />}
                />
                <TextField
                    fullWidth
                    name="galleryId"
                    label="GalleryId"
                    value={formData.galleryId}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    name="price"
                    label="Price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    name="quantity"
                    label="Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="type-select-label">Type</InputLabel>
                    <Select
                        labelId="type-select-label"
                        id="type-select"
                        value={formData.type}
                        label="Type"
                        onChange={handleChange}
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
                        value={formData.status}
                        label="Status"
                        onChange={handleChange}
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
                        <Typography variant="h2" marginLeft={1}>- </Typography>
                        <TextField
                            name="discount"
                            label="Discount (%)"
                            type="number"
                            value={formData.discount}
                            onChange={handleChange}
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
                                value={formData.pre_status}
                                label="Pre status"
                                onChange={handleChange}
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

                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button variant="contained" color="primary" type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </Button>
                </Box>
            </form>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={errorMessage.includes("Error") ? "error" : "success"}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AddCard;