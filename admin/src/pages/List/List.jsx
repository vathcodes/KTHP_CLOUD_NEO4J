import React, { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";

const List = () => {
  const url = "https://server-cloud-nnqr.onrender.com";
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [editingFood, setEditingFood] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    category: "",
    price: "",
    image: null,
    preview: null,
  });

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
        setFilteredList(response.data.data);
      } else toast.error("Error fetching list");
    } catch (error) {
      toast.error("Error fetching list");
      console.log(error);
    }
  };

  // === 🔍 Search + Filter Logic ===
  useEffect(() => {
    let data = list;

    // Lọc theo search
    if (search.trim() !== "") {
      data = data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Lọc theo category
    if (categoryFilter !== "") {
      data = data.filter((item) => item.category === categoryFilter);
    }

    setFilteredList(data);
  }, [search, categoryFilter, list]);

  // Remove Food
  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else toast.error("Error removing food");
    } catch (error) {
      toast.error("Error removing food");
      console.log(error);
    }
  };

  // Edit Modal
  const openEditModal = (food) => {
    setEditingFood(food);
    setEditData({
      name: food.name,
      category: food.category,
      price: food.price,
      image: null,
      preview: `${url}/images/${food.image}`,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData({
        ...editData,
        image: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const submitEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("id", editingFood.id);
      formData.append("name", editData.name);
      formData.append("category", editData.category);
      formData.append("price", editData.price);
      if (editData.image) formData.append("image", editData.image);

      const response = await axios.post(`${url}/api/food/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setEditingFood(null);
        fetchList();
      } else toast.error("Update failed");
    } catch (error) {
      toast.error("Error updating food");
      console.log(error);
    }
  };

  const closeModal = () => setEditingFood(null);

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <p className="list-title">All Foods List</p>

      {/* 🔍 Search + Filter */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search food name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="Cơm">Cơm</option>
          <option value="Món Nước">Món Nước</option>
          <option value="Món Cuốn">Món Cuốn</option>
          <option value="Lẩu">Lẩu</option>
          <option value="Đồ Nướng">Đồ Nướng</option>
          <option value="Ăn Vặt">Ăn Vặt</option>
          <option value="Bánh Ngọt">Bánh Ngọt</option>
          <option value="Đồ Uống">Đồ Uống</option>
        </select>
      </div>

      {/* Table */}
      <div className="list-table">
        <div className="list-table-format title">
          <span>Image</span>
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span className="action-header">Action</span>
        </div>

        {filteredList.map((item, index) => (
          <div key={index} className="list-table-format row">
            <img src={`${url}/images/${item.image}`} alt={item.name} />
            <span>{item.name}</span>
            <span>{item.category}</span>
            <span>${item.price}</span>
            <span className="action-icons">
              <FaEdit className="icon edit" onClick={() => openEditModal(item)} />
              <FaTrash className="icon remove" onClick={() => removeFood(item.id)} />
            </span>
          </div>
        ))}
      </div>

      {/* Modal Edit */}
      {editingFood && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Food</h3>

            <label>Name:</label>
            <input type="text" name="name" value={editData.name} onChange={handleEditChange} />

            <label>Category:</label>
            <select name="category" value={editData.category} onChange={handleEditChange}>
              <option value="Cơm">Cơm</option>
              <option value="Món Nước">Món Nước</option>
              <option value="Món Cuốn">Món Cuốn</option>
              <option value="Lẩu">Lẩu</option>
              <option value="Đồ Nướng">Đồ Nướng</option>
              <option value="Ăn Vặt">Ăn Vặt</option>
              <option value="Bánh Ngọt">Bánh Ngọt</option>
              <option value="Đồ Uống">Đồ Uống</option>
            </select>

            <label>Price:</label>
            <input type="number" name="price" value={editData.price} onChange={handleEditChange} />

            <label>Image:</label>
            <input type="file" name="image" onChange={handleImageChange} />

            {editData.preview && (
              <div className="image-preview">
                <img src={editData.preview} alt="Preview" />
              </div>
            )}

            <div className="modal-buttons">
              <button onClick={submitEdit}>Save</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;