# RESTful Blog API

A RESTful Blog API built with **Node.js**, **Express**, and **MongoDB**, featuring JWT-based authentication & authorization.

## Features

- JWT Authentication (Register / Login / Logout)
- Role-based Authorization (user / admin)
- CRUD Posts with slug, tags, categories, view counter, likes
- Nested Comments (replies) with like support
- Category management (admin only)
- User management (admin only)
- Global error handling & async error wrapper

## Project Structure

```
src/
├── config/         # Database connection
├── controllers/    # Business logic (Layer 2)
├── middleware/     # auth, asyncHandler, errorHandler
├── models/         # Mongoose schemas (Layer 3)
├── routes/         # Express routers (Layer 1)
└── utils/          # ErrorResponse helper
server.js
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### 1. Clone the repository

```bash
git clone https://github.com/lhuyhoang/RESTful-Blog-API.git
cd RESTful-Blog-API
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog_api
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
```

### 4. Run the server

```bash
# Development (auto-restart with nodemon)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Auth – `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Create new account |
| POST | `/login` | Public | Login, returns JWT token |
| POST | `/logout` | Private | Logout |
| GET | `/me` | Private | Get current user info |
| PUT | `/me` | Private | Update profile |

### Posts – `/api/posts`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | List all posts |
| POST | `/` | Private | Create a post |
| GET | `/:slug` | Public | Get post by slug |
| PUT | `/:id` | Private | Update post (owner/admin) |
| DELETE | `/:id` | Private | Delete post (owner/admin) |
| PUT | `/:id/like` | Private | Like / Unlike a post |

### Comments – `/api/posts/:postId/comments` & `/api/comments`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/posts/:postId/comments` | Public | Get comments (with replies) |
| POST | `/api/posts/:postId/comments` | Private | Add a comment or reply |
| PUT | `/api/comments/:id` | Private | Update comment (owner) |
| DELETE | `/api/comments/:id` | Private | Delete comment + replies |

### Categories – `/api/categories`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | List categories |
| GET | `/:slug` | Public | Get category by slug |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

### Users – `/api/users` *(Admin only)*

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin | List all users |
| GET | `/:id` | Admin | Get a user |
| PUT | `/:id` | Admin | Update a user |
| DELETE | `/:id` | Admin | Delete a user |

## Authentication

All private routes require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Token (JWT) |
| Password | bcryptjs |
| Slug | slugify |
