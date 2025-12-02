import React, { useState } from 'react';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import './MenuPage.css';

const MenuPage = () => {
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="menu-page">
      {/* Explore categories */}
      <ExploreMenu category={category} setCategory={setCategory} />

      {/* Search box */}
      <div className="menu-search">
        <input
          type="text"
          placeholder="Tìm món ăn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Food list */}
      <FoodDisplay category={category} searchTerm={searchTerm} />
    </div>
  );
};

export default MenuPage;
