import React, { useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = () => {
  const url = "http://localhost:4000";

  const [image, setImage] = useState(null); // file ảnh
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "", // VND luôn
    category: "Cơm",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price)); // VND trực tiếp
    formData.append("category", data.category);

    if (image) formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/food/create`, formData);
      if (response.data.success) {
        setData({ name: "", description: "", price: "", category: "Cơm" });
        setImage(null);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tạo sản phẩm!");
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image" className="image-label">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt="Preview"
              className="image-preview"
            />
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
          />
        </div>

        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Mô tả sản phẩm"
            required
          />
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select onChange={onChangeHandler} name="category" value={data.category}>
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

          <div className="add-price flex-col">
            <p>Product price (VND)</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              name="price"
              placeholder="20000"
              required
            />
          </div>
        </div>

        <button type="submit" className="add-btn">
          ADD
        </button>
      </form>
    </div>
  );
};

export default Add;
