import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { FaUsers, FaHamburger, FaShoppingCart } from "react-icons/fa";
import "./DashBoard.css";

const Dashboard = ({ url }) => {
  const [stats, setStats] = useState({ users: 0, foods: 0, orders: 0 });
  const [users, setUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderChartData, setOrderChartData] = useState([]);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#f08080"];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, foodsRes, ordersRes] = await Promise.all([
          axios.get(`${url}/api/users/list`),
          axios.get(`${url}/api/food/list`),
          axios.get(`${url}/api/order/list`)
        ]);

        const usersData = Array.isArray(usersRes.data.users) ? usersRes.data.users : [];
        const foodsData = Array.isArray(foodsRes.data.data) ? foodsRes.data.data : [];
        const ordersData = Array.isArray(ordersRes.data.data) ? ordersRes.data.data : [];

        setUsers(usersData);
        setFoods(foodsData);
        setOrders(ordersData);

        setStats({
          users: usersData.length,
          foods: foodsData.length,
          orders: ordersData.length
        });

        const dateMap = {};
        ordersData.forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString();
          dateMap[date] = (dateMap[date] || 0) + 1;
        });
        setOrderChartData(Object.keys(dateMap).map(date => ({ date, orders: dateMap[date] })));

      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchStats();
  }, [url]);

  // ================= Export Excel =================
  const exportUsersToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      users.map(u => ({
        Name: u.name,
        Email: u.email
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "users.xlsx");
  };

  const exportFoodsToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      foods.map(f => ({
        Name: f.name,
        Category: f.category || "Unknown",
        Price: f.price
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Foods");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "foods.xlsx");
  };

const exportOrdersToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(
    orders.map(o => ({
      OrderID: o._id,
      UserName: o.address ? `${o.address.firstName} ${o.address.lastName}` : "Unknown",
      UserEmail: o.address?.email || "Unknown",
      Phone: o.address?.phone || "N/A",
      Address: o.address
        ? `${o.address.street}, ${o.address.city}, ${o.address.state}, ${o.address.zipCode}, ${o.address.country}`
        : "N/A",
      OrderedFoods: o.items?.map(i => i.name).join(", ") || "N/A",
      Amount: o.amount,
      Status: o.status || "Pending",
      CreatedAt: o.createdAt ? new Date(o.createdAt).toLocaleString() : ""
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "orders.xlsx");
};


  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <FaUsers className="stat-icon users" />
          <h3>Total Users</h3>
          <p>{stats.users}</p>
        </div>
        <div className="stat-card">
          <FaHamburger className="stat-icon foods" />
          <h3>Total Foods</h3>
          <p>{stats.foods}</p>
        </div>
        <div className="stat-card">
          <FaShoppingCart className="stat-icon orders" />
          <h3>Total Orders</h3>
          <p>{stats.orders}</p>
        </div>
      </div>

      {/* Export Buttons */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "15px" }}>
        <button onClick={exportUsersToExcel} className="export-btn">Export Users</button>
        <button onClick={exportFoodsToExcel} className="export-btn">Export Foods</button>
        <button onClick={exportOrdersToExcel} className="export-btn">Export Orders</button>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-item">
          <h3>Orders Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={orderChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h3>Food Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={foods.map(f => ({ name: f.name || "Unknown", value: f.price || 0 }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {foods.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h3>Foods Price Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={foods.map(f => ({ name: f.name, price: f.price || 0 }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="price" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
