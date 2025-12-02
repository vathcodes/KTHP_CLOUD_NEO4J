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

  const PIE_COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#FF9800", "#9C27B0", "#00BCD4"];
  const BAR_COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#FF9800", "#9C27B0", "#00BCD4", "#E91E63", "#3F51B5", "#009688", "#795548"];

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

        // Orders chart
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
        OrderID: o.id,
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

  // ================= Chart Data Optimizations =================
  // PieChart: Số lượng món theo category
  const categoryMap = {};
  foods.forEach(f => {
    const cat = f.category || "Unknown";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryData = Object.keys(categoryMap).map(key => ({
    category: key,
    count: categoryMap[key]
  }));

  // BarChart: Top 10 Foods + Others
  const topFoods = [...foods]
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 10);
  const othersValue = foods.slice(10).reduce((sum, f) => sum + (f.price || 0), 0);
  const barData = [
    ...topFoods.map(f => ({ name: f.name, price: f.price || 0 })),
    ...(othersValue > 0 ? [{ name: "Others", price: othersValue }] : [])
  ];

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
        {/* Orders Over Time */}
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

        {/* PieChart: số lượng món theo category */}
        <div className="chart-item">
          <h3>Food Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

       
      </div>
    </div>
  );
};

export default Dashboard;
