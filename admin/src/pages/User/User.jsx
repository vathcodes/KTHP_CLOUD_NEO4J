import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./User.css";

const User = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: "http://localhost:4000",
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users");
      if (res.data.success) {
        setUsers(res.data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.log(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add / Update user
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/api/users/${editingUser.id}`, form);
        setEditingUser(null);
      } else {
        await api.post("/api/users/register", form);
      }
      setForm({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  // Edit user
  const handleEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: "" });
    setEditingUser(user);
  };

  // Delete user
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await api.delete(`/api/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="user-container">
      <h2 className="user-title">User Management</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="user-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required={!editingUser}
        />
        <button type="submit">
          {editingUser ? "Update" : "Add"} User
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="user-list-table">
          <div className="user-list-table-format title">
            <span>Name</span>
            <span>Email</span>
            <span className="user-action-header">Action</span>
          </div>

          {users.map((user) => (
            <div key={user.id} className="user-list-table-format row">
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span className="user-action-icons">
                <FaEdit
                  className="icon edit"
                  onClick={() => handleEdit(user)}
                />
                <FaTrash
                  className="icon remove"
                  onClick={() => handleDelete(user.id)}
                />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default User;
