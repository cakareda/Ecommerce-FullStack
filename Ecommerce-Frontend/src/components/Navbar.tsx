import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axios";
import AppContext from "../Context/Context";

const Navbar = ({ onSelectCategory }) => {
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleChange = async (value) => {
    setInput(value);
    if (value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response = await axios.get(`/products/search?keyword=${value}`);
        setSearchResults(response.data);
        setNoResults(response.data.length === 0);
      } catch (error) {
        console.error("Error searching:", error);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const categories = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
      <header>
        <nav className="navbar navbar-expand-lg fixed-top shadow-sm px-3">
          <div className="container-fluid">
            <Link className="navbar-brand me-4" to="/">
              ByteCart
            </Link>
            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
                <li className="nav-item">
                  <Link className="nav-link active" to="/">
                    Home
                  </Link>
                </li>

                {user && (user.role === "ADMIN" || user.role === "ROLE_ADMIN") && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/add_product">
                        Add Product
                      </Link>
                    </li>
                )}

                <li className="nav-item dropdown">
                  <a
                      className="nav-link dropdown-toggle"
                      href="/"
                      role="button"
                      data-bs-toggle="dropdown"
                  >
                    Categories
                  </a>
                  <ul className="dropdown-menu border-0 shadow">
                    {categories.map((category) => (
                        <li key={category}>
                          <button
                              className="dropdown-item"
                              onClick={() => handleCategorySelect(category)}
                          >
                            {category}
                          </button>
                        </li>
                    ))}
                  </ul>
                </li>
              </ul>

              <div className="d-flex align-items-center gap-3">
                {/* Theme Toggle Button */}
                <button
                    className="theme-btn d-flex align-items-center justify-content-center"
                    onClick={toggleTheme}
                    style={{ width: "38px", height: "38px", margin: 0 }}
                >
                  {theme === "dark-theme" ? (
                      <i className="bi bi-moon-fill" style={{ fontSize: "1rem" }}></i>
                  ) : (
                      <i className="bi bi-sun-fill" style={{ fontSize: "1rem" }}></i>
                  )}
                </button>

                {/* Cart Icon */}
                <Link to="/cart" className="nav-link d-flex align-items-center gap-1">
                  <i className="bi bi-cart3" style={{ fontSize: "1.2rem" }}></i>
                  <span className="d-none d-sm-inline">Cart</span>
                </Link>

                <Link to="/categories" className="nav-link d-flex align-items-center gap-1">
                  <i className="bi bi-grid" style={{ fontSize: "1.2rem" }}></i>
                  <span className="d-none d-sm-inline">Categories</span>
                </Link>

                <Link to="/orders" className="nav-link d-flex align-items-center gap-1">
                  <i className="bi bi-receipt" style={{ fontSize: "1.2rem" }}></i>
                  <span className="d-none d-sm-inline">Orders</span>
                </Link>

                {/* Search Bar */}
                <div className="position-relative" style={{ width: "200px" }}>
                  <input
                      className="form-control rounded-pill px-3"
                      type="search"
                      placeholder="Search..."
                      value={input}
                      onChange={(e) => handleChange(e.target.value)}
                      style={{ fontSize: "0.9rem", height: "38px" }}
                  />
                  {showSearchResults && (
                      <ul className="list-group position-absolute w-100 mt-1 shadow border-0" style={{ zIndex: 1050 }}>
                        {searchResults.length > 0 ? (
                            searchResults.map((result) => (
                                <li key={result.id} className="list-group-item border-0">
                                  <Link to={`/product/${result.id}`} className="search-result-link text-decoration-none">
                                    <span>{result.name}</span>
                                  </Link>
                                </li>
                            ))
                        ) : (
                            noResults && (
                                <p className="no-results-message p-2 mb-0 text-muted" style={{ fontSize: "0.85rem" }}>
                                  No Product Found
                                </p>
                            )
                        )}
                      </ul>
                  )}
                </div>

                {/* Auth Controls */}
                <div className="d-flex align-items-center">
                  {user ? (
                      <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold px-2" style={{ fontSize: "0.9rem" }}>
                      👤 {user.username}
                    </span>
                        <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onClick={handleLogout}
                            style={{ height: "36px" }}
                        >
                          Logout
                        </button>
                      </div>
                  ) : (
                      <div className="d-flex align-items-center gap-2">
                        <Link
                            to="/login"
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center"
                            style={{ height: "36px", fontWeight: "500" }}
                        >
                          Login
                        </Link>
                        <Link
                            to="/register"
                            className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center"
                            style={{ height: "36px", fontWeight: "500" }}
                        >
                          Register
                        </Link>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
  );
};

export default Navbar;