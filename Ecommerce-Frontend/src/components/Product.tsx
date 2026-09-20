import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context";
import axios from "../axios";

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData, user } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/product/${id}`);
        setProduct(response.data);
        if (response.data.imageName) {
          fetchImage();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchImage = async () => {
      try {
        const response = await axios.get(`/product/${id}/image`, {
          responseType: "blob",
        });
        setImageUrl(URL.createObjectURL(response.data));
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const deleteProduct = async () => {
    try {
      await axios.delete(`/product/${id}`);
      removeFromCart(id);
      alert("Product deleted successfully");
      refreshData();
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handleAddToCart = () => {
    addToCart(product);
    alert("Product added to cart");
  };

  if (!product) {
    return (
        <h2 className="text-center" style={{ padding: "10rem" }}>
          Loading...
        </h2>
    );
  }

  const isAdmin = user && (user.role === "ADMIN" || user.role === "ROLE_ADMIN");

  return (
      <div className="containers" style={{ display: "flex" }}>
        <img
            className="left-column-img"
            src={imageUrl}
            alt={product.imageName}
            style={{ width: "50%", height: "auto" }}
        />

        <div className="right-column" style={{ width: "50%" }}>
          <div className="product-description">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "lighter" }}>
              {product.category}
            </span>
              <p className="release-date" style={{ marginBottom: "2rem" }}>
                Listed: <i>{new Date(product.releaseDate).toLocaleDateString()}</i>
              </p>
            </div>

            <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", textTransform: "capitalize", letterSpacing: "1px" }}>
              {product.name}
            </h1>
            <i style={{ marginBottom: "3rem" }}>{product.brand}</i>
            <p style={{ fontWeight: "bold", fontSize: "1rem", margin: "10px 0px 0px" }}>
              PRODUCT DESCRIPTION :
            </p>
            <p style={{ marginBottom: "1rem" }}>{product.description}</p>
          </div>

          <div className="product-price">
          <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
            {"$" + product.price}
          </span>
            <button
                className={`cart-btn ${!product.productAvailable ? "disabled-btn" : ""}`}
                onClick={handleAddToCart}
                disabled={!product.productAvailable}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1rem",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginBottom: "1rem",
                }}
            >
              {product.productAvailable ? "Add to cart" : "Out of Stock"}
            </button>
            <h6 style={{ marginBottom: "1rem" }}>
              Stock Available:{" "}
              <i style={{ color: "green", fontWeight: "bold" }}>
                {product.stockQuantity}
              </i>
            </h6>
          </div>

          {/* Güncelle/Sil butonlarını sadece Admin görür */}
          {isAdmin && (
              <div className="update-button" style={{ display: "flex", gap: "1rem" }}>
                <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleEditClick}
                >
                  Update
                </button>
                <button
                    className="btn btn-danger"
                    type="button"
                    onClick={deleteProduct}
                >
                  Delete
                </button>
              </div>
          )}
        </div>
      </div>
  );
};

export default Product;