import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../axios";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "USER",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await axios.post("/auth/register", formData);
            alert("Registration successful! You can now log in.");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data || "An error occurred during registration.");
        }
    };

    return (
        <div className="container" style={{ minHeight: "85vh", paddingTop: "80px" }}>
            <div className="center-container" style={{ position: "static", transform: "none", margin: "0 auto", maxWidth: "480px", width: "100%" }}>
                <div
                    className="card"
                    style={{
                        width: "100%",
                        height: "auto",
                        padding: "2rem",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        borderRadius: "12px"
                    }}
                >
                    <h2 className="text-center mb-4" style={{ fontWeight: "700", letterSpacing: "0.5px" }}>Register</h2>
                    {error && <div className="alert alert-danger" style={{ fontSize: "0.9rem" }}>{error}</div>}
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-12">
                            <label className="form-label">
                                <h6>Username</h6>
                            </label>
                            <input
                                type="text"
                                name="username"
                                className="form-control"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">
                                <h6>Email</h6>
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">
                                <h6>Password</h6>
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">
                                <h6>Role</h6>
                            </label>
                            <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                                <option value="USER">User</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>
                        <div className="col-12 mt-4">
                            <button type="submit" className="btn-hover color-9" style={{ width: "100%", margin: "0", height: "48px" }}>
                                Register
                            </button>
                        </div>
                    </form>
                    <p className="mt-4 text-center" style={{ fontSize: "0.95rem" }}>
                        Already have an account? <Link to="/login" style={{ fontWeight: "600", textDecoration: "underline" }}>Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;