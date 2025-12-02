import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const url = "https://server-cloud-nnqr.onrender.com";
    const [token, setToken] = useState("");
    const [foodList, setFoodList] = useState([]);

    // Thêm item vào cart
    const addToCart = async (itemId) => {
        setCartItems(prev => ({
            ...prev,
            [itemId]: prev[itemId] ? prev[itemId] + 1 : 1
        }));

        if (token) {
            try {
                await axios.post(
                    `${url}/api/cart/create`,
                    { itemId },
                    { headers: { token } }
                );
            } catch (err) {
                console.error("Error adding to cart:", err);
            }
        }
    };

    // Xóa item khỏi cart
    const removeFromCart = async (itemId) => {
        setCartItems(prev => {
            const updated = { ...prev };
            updated[itemId] = (updated[itemId] || 0) - 1;
            if (updated[itemId] <= 0) delete updated[itemId];
            return updated;
        });

        if (token) {
            try {
                await axios.post(
                    `${url}/api/cart/remove`,
                    { itemId },
                    { headers: { token } }
                );
            } catch (err) {
                console.error("Error removing from cart:", err);
            }
        }
    };

    // Tổng tiền trong cart
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            const quantity = cartItems[itemId];
            if (quantity > 0) {
                const itemInfo = foodList.find(product => product.id === itemId); // UUID
                if (itemInfo) totalAmount += itemInfo.price * quantity;
            }
        }
        return totalAmount;
    };

    // Lấy danh sách food từ server
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            setFoodList(response.data.data);
        } catch (err) {
            console.error("Error fetching food list:", err);
        }
    };

    const loadCartData = async (userToken) => {
    if (!userToken) return;
    try {
        const response = await axios.get(`${url}/api/cart/get`, {
            headers: { token: userToken }
        });
        setCartItems(response.data.cartData || {});
    } catch (err) {
        console.error("Error loading cart:", err);
    }
};


    useEffect(() => {
        const loadData = async () => {
            await fetchFoodList();
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                await loadCartData(storedToken);
            }
        };
        loadData();
    }, []);

    const contextValue = {
        foodList,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
