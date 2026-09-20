import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../axios";
import AppContext from "../Context/Context";

const Login = () => {
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const { login } = useContext(AppContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await axios.post("/auth/login", credentials);
            const { token, username, role } = response.data;
            login({ username, role }, token);
            alert("Login successful!");
            navigate("/");
        } catch (err) {
            const axiosError = err as { response?: { data?: string } };
            setError(axiosError.response?.data || "An error occurred during login.");
        }
    };

    return (
        <div className="container" style={{ minHeight: "85vh", paddingTop: "80px" }}>
            <div className="center-container" style={{ position: "static", transform: "none", margin: "0 auto", maxWidth: "450px", width: "100%" }}>
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
                    <h2 className="text-center mb-4" style={{ fontWeight: "700", letterSpacing: "0.5px" }}>Login</h2>
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
                                placeholder="Enter your username"
                                value={credentials.username}
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
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12 mt-4">
                            <button type="submit" className="btn-hover color-9" style={{ width: "100%", margin: "0", height: "48px" }}>
                                Login
                            </button>
                        </div>
                    </form>
                    <p className="mt-4 text-center" style={{ fontSize: "0.95rem" }}>
                        Don't have an account? <Link to="/register" style={{ fontWeight: "600", textDecoration: "underline" }}>Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;