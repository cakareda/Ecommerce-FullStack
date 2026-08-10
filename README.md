
# 🛍️ Full Stack E-commerce Web Application

A modern, secure, full-stack **E-commerce application** built using **Spring Boot 3** for the backend and **ReactJS with Vite** for the frontend. Features JWT-based authentication, role-based access control (ADMIN / USER), product management with image upload, cart operations, dynamic search, and responsive light/dark theme support.

---

## 📁 Project Structure

```text
SpringBoot-Reactjs-Ecommerce-main/
├── Ecommerce-Backend/       # Spring Boot REST API backend (Java 21)
└── Ecommerce-Frontend/      # React + Vite frontend application

```

---

## 🧩 Backend - Spring Boot

### 🔧 Technologies Used

* **Java 21**
* **Spring Boot 3.3.3**
* **Spring Security & JWT** (JSON Web Token authentication)
* **Spring Data JPA**
* **H2 In-Memory Database** (Can easily be migrated to PostgreSQL/MySQL)
* **Lombok**
* **Maven**

### 📂 Backend Directory Structure

```text
Ecommerce-Backend/
└── src/main/java/com/cart/ecom_proj/
    ├── controller/      # REST API endpoints (Products & Auth)
    ├── model/           # JPA entities (Product, User, Role)
    ├── repo/            # Spring Data JPA repositories
    ├── service/         # Business logic & JWT services
    └── config/          # Spring Security & CORS configurations

```

### ⚙️ Setup & Run

1. **Navigate to the Backend Directory:**
```bash
cd Ecommerce-Backend

```


2. **Run the Application:**
```bash
mvn spring-boot:run

```


*(Or run `EcomProjApplication.java` directly from IntelliJ IDEA)*
3. **Database & API Documentation:**
* **H2 Console:** `http://localhost:8080/h2-console`
  *(JDBC URL: `jdbc:h2:mem:EcommerceDB` | Username: `sa` | Password: `project1`)*
* **Swagger UI:** `http://localhost:8080/swagger-ui.html`



### 📡 Key REST API Endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user (`USER` / `ADMIN`) | ❌ No |
| `POST` | `/api/auth/login` | Login and receive JWT Token | ❌ No |
| `GET` | `/api/products` | Fetch all products | ❌ No |
| `GET` | `/api/product/{id}` | Get product details by ID | ❌ No |
| `GET` | `/api/products/search` | Search products by keyword | ❌ No |
| `POST` | `/api/product` | Add a new product (Multipart Image) | 🔐 Yes (ADMIN) |
| `PUT` | `/api/product/{id}` | Update product details | 🔐 Yes (ADMIN) |
| `DELETE` | `/api/product/{id}` | Delete a product | 🔐 Yes (ADMIN) |

---

## 💻 Frontend - React + Vite

### 🔧 Technologies Used

* **ReactJS 18**
* **Vite** (Next-gen frontend tool)
* **Axios** (With Request Interceptor for JWT handling)
* **React Router DOM v6** (Protected Routing)
* **Bootstrap 5 & Bootstrap Icons**
* **Context API** (Global state for Auth, Cart, and Theme)

### 📂 Frontend Directory Structure

```text
Ecommerce-Frontend/
└── src/
    ├── assets/          # Static images & icons
    ├── components/      # Reusable UI components (Navbar, Cart, Product, Home)
    ├── Context/         # AppContext for global Auth & Cart state
    ├── axios.jsx        # Central Axios instance with JWT Interceptor
    ├── App.jsx          # Main application router & protected routes
    └── main.jsx         # Application entry point

```

### ▶️ Setup & Run

1. **Navigate to the Frontend Directory:**
```bash
cd Ecommerce-Frontend

```


2. **Install Dependencies:**
```bash
npm install

```


3. **Run the Development Server:**
```bash
npm run dev

```


Access the UI at `http://localhost:5173`.

---

## ✨ Features

* 🔐 **Authentication & Authorization:** Secure Login and Registration system powered by Spring Security + JWT.
* 🛡️ **Role-Based Access Control:** `ADMIN` users can add, edit, or delete products, while standard `USER` accounts can browse and purchase items.
* 📦 **Product Management:** Full CRUD operations with image upload and stock management.
* 🛒 **Shopping Cart & Checkout:** Dynamic stock checks, quantity updates, total calculation, and modal confirmation.
* 🔍 **Real-time Search & Filter:** Search by name/keyword and filter products by category.
* 🌓 **Dark / Light Theme:** Global theme toggling with smooth CSS variables transition.
