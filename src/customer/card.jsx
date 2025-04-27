import * as React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import { useNavigate } from 'react-router-dom';

export default function MultiActionAreaCard({ image, name, title, price, quantity }) {
    const navigate = useNavigate();

    const handleBuyClick = () => {
        navigate('/view-card');
    };

    return (
        <Card sx={{ maxWidth: 405 }}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    height="200"
                    image={image}
                    alt={title}
                />
                <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                        {name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Price: {price}
                        <br />
                        Quantity: {quantity}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button
                    size="small"
                    color="primary"
                    aria-label="buy"
                    onClick={handleBuyClick}
                    sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}
                >
                    Buy
                </Button>
            </CardActions>
        </Card>
    );
}

// Prop validation
MultiActionAreaCard.propTypes = {
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
};