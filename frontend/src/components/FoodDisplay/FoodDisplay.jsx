import React, { useContext } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category = "All", searchTerm = "" }) => {
  const { food_list } = useContext(StoreContext) || { food_list: [] };

  // đảm bảo food_list luôn là mảng
  const list = Array.isArray(food_list) ? food_list : [];

  const filteredList = list.filter(item => {
    const matchCategory = category === "All" || category === item.category;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className='food-display' id='food-display'>
      <h2>Danh sách món ăn</h2>
      <div className="food-display-list">
        {filteredList.length > 0 ? (
          filteredList.map((item, index) => (
            <FoodItem
              key={index}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))
        ) : (
          <p>Không tìm thấy món ăn nào.</p>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
