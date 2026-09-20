
# Enterprise Modular Commerce & Event-Driven Platform

An enterprise-grade modular e-commerce & event-driven processing platform built with Java 21 / Spring Boot 3.3, PostgreSQL (Flyway), MongoDB (Audit/Activity logs), RabbitMQ (Async event decoupling), React + TypeScript + shadcn/ui, and containerized via Docker/Kubernetes manifests.

It started as a straightforward product catalog + JWT auth sample and has been expanded into a modular platform covering catalog, cart, checkout, order history, asynchronous event processing, and polyglot persistence (relational + document store), with a container and CI/CD story suitable for a portfolio or as a base for further microservice extraction.

---

## Architecture Overview

```text
                        ┌─────────────────────────┐
                        │   React + TS Frontend    │
                        │  (Vite, Tailwind/shadcn)  │
                        └────────────┬─────────────┘
                                     │ REST (JWT)
                                     ▼
                        ┌─────────────────────────┐
                        │   Spring Boot Backend    │
                        │  Auth / Product / Cart /  │
                        │  Order / Category modules │
                        └──────┬──────────┬─────────┘
                               │          │
                 synchronous   │          │  async (order events)
                               ▼          ▼
                    ┌───────────────┐  ┌───────────────────┐
                    │  PostgreSQL   │  │   RabbitMQ topic   │
                    │ (Flyway-      │  │  order.exchange     │
                    │  managed      │  │  -> order.created   │
                    │  schema)      │  │     queue            │
                    └───────────────┘  └─────────┬───────────┘
                                                  │ consumed by
                                                  ▼
                                        ┌───────────────────┐
                                        │  Audit listener    │
                                        │  writes to MongoDB │
                                        └───────────────────┘
```

The backend is organized into feature packages (`cart/`, `order/`, `category/`, `audit/`) alongside the original flat `model/controller/repo/service` packages used by the pre-existing Product and Auth code, which were left untouched.

**Order event flow:** placing an order (`POST /api/orders`) persists the order and its line items in PostgreSQL inside a single transaction, clears the user's cart, writes a synchronous audit entry, and then publishes an `OrderCreatedEvent` to the `order.exchange` topic exchange in RabbitMQ. A `@RabbitListener` consumer picks the event up asynchronously from the `order.created.queue` and records a second audit entry in MongoDB — demonstrating decoupled, event-driven processing on top of the synchronous request/response path. Product searches are also recorded to the audit log.

---

## Backend - Spring Boot

### Technologies

* Java 21, Spring Boot 3.3.3
* Spring Security & JWT authentication
* Spring Data JPA + PostgreSQL (Flyway-managed schema) for local dev: H2 in-memory
* Spring Data MongoDB for audit/activity logging
* Spring AMQP / RabbitMQ for asynchronous order events
* springdoc-openapi (Swagger UI)
* Testcontainers (Postgres, MongoDB, RabbitMQ) + Mockito/JUnit 5 for testing
* Maven, Lombok

### Backend directory structure

```text
Ecommerce-Backend/
└── src/main/java/com/cart/ecom_proj/
    ├── controller/ model/ repo/ service/   # Original Product & Auth code (unchanged)
    ├── security/                           # JWT filter, security config
    ├── config/                             # RabbitMQConfig, Swagger config
    ├── category/                           # Category entity, repo, service, controller
    ├── cart/                               # Cart, CartItem, cart service/controller
    ├── order/                              # Order, OrderItem, checkout service/controller
    └── audit/                              # MongoDB AuditLog + async order-event listener
```

### Local development (H2, no external infrastructure)

```bash
cd Ecommerce-Backend
mvn spring-boot:run
```

This runs with the `dev` profile (the default), backed by an in-memory H2 database — no PostgreSQL, MongoDB, or RabbitMQ required. Audit writes and event publishing fail silently (logged, non-fatal) if Mongo/RabbitMQ are not reachable, so the app still runs standalone.

* H2 Console: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:EcommerceDB`, user `sa`, password `project1`)
* Swagger UI: `http://localhost:8080/swagger-ui.html`

### Full stack with Docker Compose (PostgreSQL, MongoDB, RabbitMQ)

```bash
docker compose up --build
```

This starts PostgreSQL, MongoDB, RabbitMQ, the backend (Spring profile `docker`, Flyway-migrated schema), and the frontend (nginx). Backend on `http://localhost:8080`, frontend on `http://localhost:5173`, RabbitMQ management UI on `http://localhost:15672` (guest/guest).

### Key REST API endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user (`USER` / `ADMIN`) | No |
| `POST` | `/api/auth/login` | Login and receive JWT token (includes user id) | No |
| `GET` | `/api/products` | Fetch all products | No |
| `GET` | `/api/products/{id}` | Get product details by ID | No |
| `GET` | `/api/products/search?keyword=` | Search products (audit-logged) | No |
| `POST` | `/api/products` | Add a new product (multipart image) | Yes (ADMIN) |
| `PUT` | `/api/products/{id}` | Update product details | Yes (ADMIN) |
| `DELETE` | `/api/products/{id}` | Delete a product | Yes (ADMIN) |
| `GET` | `/api/categories` | List all categories | No |
| `GET` | `/api/categories/{id}` | Get a category | No |
| `POST` | `/api/categories` | Create a category | Yes (ADMIN) |
| `PUT` | `/api/categories/{id}` | Update a category | Yes (ADMIN) |
| `DELETE` | `/api/categories/{id}` | Delete a category | Yes (ADMIN) |
| `GET` | `/api/cart` | Get the authenticated user's cart | Yes |
| `POST` | `/api/cart` | Add/increment an item in the cart | Yes |
| `DELETE` | `/api/cart/{cartItemId}` | Remove an item from the cart | Yes |
| `POST` | `/api/orders` | Checkout: convert cart into an order | Yes |
| `GET` | `/api/orders/{userId}` | Order history for a user | Yes |
| `GET` | `/api/orders/detail/{orderId}` | Get a single order's detail | Yes |

---

## Frontend - React + TypeScript

### Technologies

* React 18 + TypeScript, Vite
* Tailwind CSS + hand-authored shadcn/ui-style primitives (`Button`, `Card`, `Input`, `Badge`)
* React Router DOM v6 (protected routes)
* Axios, with a typed API client (`src/api/client.ts`) wrapping products/categories/cart/orders
* Context API for auth/cart/theme state
* Existing Bootstrap-based pages (Home, Product, Navbar, legacy Cart) remain as-is; new pages (Cart checkout, Order history, Category browser) use Tailwind/shadcn

### Frontend directory structure

```text
Ecommerce-Frontend/
└── src/
    ├── api/client.ts     # Typed wrapper around backend REST endpoints
    ├── types/            # Shared TypeScript interfaces (Product, Cart, Order, Category, User)
    ├── components/ui/    # shadcn-style Button, Card, Input, Badge primitives
    ├── pages/            # CartPage, OrdersPage, CategoriesPage (Tailwind/shadcn)
    ├── components/       # Existing Navbar, Home, Product, Login, Register, etc. (Bootstrap)
    ├── Context/           # AppContext for global auth/cart/theme state
    ├── axios.ts           # Central Axios instance with JWT interceptor
    ├── App.tsx            # Router and protected routes
    └── main.tsx           # Application entry point
```

### Setup & run

```bash
cd Ecommerce-Frontend
npm install
npm run dev
```

Access the UI at `http://localhost:5173`.

### Build & type-check

```bash
npm run build   # tsc --noEmit && vite build
```

---

## Testing

### Backend

```bash
cd Ecommerce-Backend
mvn test                     # fast unit tests (Mockito), excludes *IT classes by default
mvn test -Dtest='*IT'        # Testcontainers-based integration tests (requires Docker)
```

Unit tests cover `CartService` and `OrderService` business logic. `OrderCheckoutIT` is a Testcontainers-based integration test that spins up real PostgreSQL and MongoDB containers, exercises the full checkout flow (cart -> order), and verifies both the persisted order and the audit log entry. It is excluded from the default `mvn test` run and named with the `IT` suffix / tagged `integration` so CI can run it separately on Docker-enabled runners.

### Frontend

```bash
cd Ecommerce-Frontend
npm run build   # type-checks with tsc and builds with Vite
npm run lint
```

### CI/CD

`.github/workflows/ci.yml` runs backend unit tests, Testcontainers integration tests, and a Maven package on every push/PR, plus a frontend job (`npm ci`, lint, `npm run build`). `.gitlab-ci.yml` mirrors the same build/test stages for GitLab.

---

## Deployment

* **Docker Compose** (`docker-compose.yml`): backend, frontend, PostgreSQL, MongoDB, and RabbitMQ with health checks and named volumes — see "Full stack with Docker Compose" above.
* **Kubernetes** (`k8s/`): plain YAML manifests — namespace, ConfigMap/Secret, Deployments and Services for backend, frontend, PostgreSQL (with PVC), MongoDB (with PVC), and RabbitMQ. Apply with `kubectl apply -f k8s/`.

---

## Features

* **Authentication & Authorization:** JWT-based login/registration with role-based access control (`ADMIN` / `USER`).
* **Product Catalog & Categories:** CRUD product management with image upload, plus category management and category-based browsing.
* **Cart & Checkout:** Server-side cart backed by PostgreSQL, checkout that atomically creates an order and clears the cart.
* **Order History:** Per-user order history with line items and status.
* **Asynchronous Event Processing:** RabbitMQ-based `OrderCreatedEvent` decouples audit logging from the checkout request.
* **Audit Logging:** MongoDB-backed audit trail for order creation and product searches.
* **Polyglot Persistence:** PostgreSQL (relational, Flyway-migrated) alongside MongoDB (document store) for audit data.
* **Containerized & Cloud-Ready:** Multi-stage Docker images, Docker Compose for local full-stack runs, and Kubernetes manifests for cluster deployment.
* **CI/CD:** GitHub Actions and GitLab CI pipelines covering backend tests/build and frontend type-check/build.
