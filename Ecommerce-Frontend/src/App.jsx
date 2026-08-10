import "./App.css";
import React, { useState, useContext } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import UpdateProduct from "./components/UpdateProduct";
import Login from "./components/Login";
import Register from "./components/Register";
import AppContext, { AppProvider } from "./Context/Context";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useContext(AppContext);
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "ROLE_ADMIN" && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { addToCart } = useContext(AppContext);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
      <BrowserRouter>
        <Navbar onSelectCategory={handleCategorySelect} />
        <Routes>
          <Route
              path="/"
              element={
                <Home addToCart={addToCart} selectedCategory={selectedCategory} />
              }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product" element={<Product />} />
          <Route path="/product/:id" element={<Product />} />

          {/* Korumalı Rotalar (Sadece Admin veya Yetkili Kullanıcılar) */}
          <Route
              path="/add_product"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AddProduct />
                </ProtectedRoute>
              }
          />
          <Route
              path="/product/update/:id"
              element={
                <ProtectedRoute adminOnly={true}>
                  <UpdateProduct />
                </ProtectedRoute>
              }
          />
        </Routes>
      </BrowserRouter>
  );
}

function App() {
  return (
      <AppProvider>
        <AppContent />
      </AppProvider>
  );
}

export default App;