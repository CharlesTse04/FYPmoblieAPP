import React, { useState, useEffect } from 'react';
import LoginId from '../getData/loginId.jsx';

function NavBarApp() {
    const [loginId, setLoginId] = useState(null);
    const [loading, setLoading] = useState(true); // State to track loading

    // Function to fetch login ID
    const fetchLoginId = async () => {
        setLoading(true); // Start loading
        const fetchedId = await LoginId(); // Assuming this function fetches the login ID asynchronously
        setLoginId(fetchedId);
        setLoading(false); // Stop loading
    };

    useEffect(() => {
        fetchLoginId(); // Fetch login ID when the component mounts
    }, []);

    return (
        <>
            <div className='nav'>
                <div className='nav1'>
                    <div className='navLogo'>
                        <a href=' '>Logo</a>
                    </div>
                    <div>
                        <a href='/index.html'>Oztet Amigo</a>
                    </div>
                </div>
                <div className='nav2'>
                    <input className='navSearch' type='text' placeholder='Search' />
                    <button className='navSearchBtn'>Search</button>
                </div>
                <div className='nav3'>
                    {loading ? ( // Conditional rendering for loading state
                        <div>Loading...</div>
                    ) : (
                        loginId ? (
                            <div><a href='\FYP_HTML\UserInterface.html'>{loginId.firstName}</a></div>
                        ) : (
                            <div><a href='\FYP_HTML\Login.html'>注册/登录</a></div>
                        )
                    )}
                    <div><a href='\FYP_HTML\ShoppingCart.html'>購物車</a></div>
                    <div><a href='\FYP_HTML\WishList.html'>收藏</a></div>
                </div>
            </div>
            <div className='subNav'>
                <div><a href='/FYP_HTML\UnopenedProducts.html'>未開封商品</a></div>
                <div>|</div>
                <div><a href='\FYP_HTML\SingleCardArea.html'>單卡專區</a></div>
                <div>|</div>
                <div><a href='\FYP_HTML\SpecialArea.html'>特價專區</a></div>
                <div>|</div>
                <div><a href='\FYP_HTML\PreOrderProducts.html#'>預定商品</a></div>
                <div>|</div>
                <div><a href='#'>卡牌回收表</a></div>
            </div>
        </>
    );
}

export default NavBarApp;