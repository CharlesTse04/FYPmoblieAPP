import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';

const UserShopping = () => {
    const [shoppingData, setShoppingData] = useState({});
    const [cardsData, setCardsData] = useState({});
    const [galleriesData, setGalleriesData] = useState({});
    const [combinedData, setCombinedData] = useState([]);
    const [showNoLoginShoppingCart, setShowNoLoginShoppingCart] = useState(false);
    const [showLoginedShoppingCart, setShowLoginedShoppingCart] = useState(false);

    useEffect(() => {
        const database = getDatabase();

        // 获取用户的购物数据
        const shoppingRef = ref(database, `user/12345678-freeman@gmail-com/Shopping`);
        get(shoppingRef).then((snapshot) => {
            if (snapshot.exists()) {
                setShoppingData(snapshot.val());
            } else {
                setShowLoginedShoppingCart(true); // 如果没有购物数据，显示购物车为空
            }
        });

        // 获取卡片数据
        const cardsRef = ref(database, 'cards/');
        get(cardsRef).then((snapshot) => {
            if (snapshot.exists()) {
                setCardsData(snapshot.val());
            }
        });

        // 获取画廊数据
        const galleriesRef = ref(database, 'galleries/');
        get(galleriesRef).then((snapshot) => {
            if (snapshot.exists()) {
                setGalleriesData(snapshot.val());
            }
        });
    }, []);

    useEffect(() => {
        // 当 shoppingData、cardsData 或 galleriesData 更新时，结合这三个数据
        if (
            Object.keys(shoppingData).length > 0 &&
            Object.keys(cardsData).length > 0 &&
            Object.keys(galleriesData).length > 0
        ) {
            const combined = Object.keys(shoppingData).map(key => {


                const cardItem = cardsData[key];
                const galleryItem = galleriesData[key];

                return {
                    name: cardItem ? cardItem.name : (galleryItem ? galleryItem.name : '未找到'),
                    image: cardItem ? cardItem.image : (galleryItem ? galleryItem.imageUrl : '未找到'),
                    price: cardItem ? cardItem.price : (galleryItem ? galleryItem.price : '未找到'),
                    quantity: shoppingData[key] || 0,
                };
            });
            setCombinedData(combined);
        }
    }, [shoppingData, cardsData, galleriesData]);

    return (
        <>
            {showNoLoginShoppingCart && (
                <div className="showCar" id="showCar">
                    <div className="car" id="car1">
                        <div className="d2">
                            <p className="carName">请登录您的账户后再添加到购物车！</p>
                            <button className="like-button">
                                <label className="like">
                                    <span className="like-text"><a href="\FYP_HTML\Login.html">去登录</a></span>
                                </label>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showLoginedShoppingCart && (
                <div className="showCart">
                    <div className="cart">
                        <div className="cartd2">
                            <p className="cartName">你的购物车是空的!</p>
                        </div>
                    </div>
                </div>
            )}
            {combinedData.length > 0 ? (
                combinedData.map((item, index) => (
                    <div className="showCart" key={index}>
                        <div className="cart">
                            <div className='partfour'>
                                <input type='checkbox' className='check' />
                            </div>
                            <div className='partOne'>
                                <img src={item.image} alt="Product" className="product-image" />
                            </div>
                            <div className='partfive'>
                                <span className='cardName'>{item.name}</span>
                                <span className='cardID'>卡片ID</span> {/* 这里可以替换为实际的 ID */}
                            </div>
                            <div className='partTwo'>
                                <span className='cardQuantity'>数量: {item.quantity}</span>
                                <span className='cardPrice'>价格: ${item.price}</span>
                            </div>
                            <div className='partThree'>
                                <div className="like-button2">
                                    <label className="like">
                                        <span className="like-text">编辑</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <hr />
                    </div>
                ))
            ) : (
                <p>购物车没有商品。</p>
            )}
            <div className="showCart1">
                <div className="cart1">
                    <div className='partOne'>
                        <div className='total'>
                            <span>总计</span>
                        </div>
                    </div>
                    <div className='partTwo'>
                        <span className='cardQuantity'> $60 * 10</span>
                        <span className='cardPrice'>$540 * 3</span>
                        <hr />
                        <span className='cardQuantity'>$2,220</span>
                    </div>
                    <div className='partThree'>
                        <div className="like-button2">
                            <label className="like">
                                <span className="like-text">
                                    <a href='../FYP_HTML/payment.html'>
                                        前往付款
                                    </a>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserShopping;