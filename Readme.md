# Backend Development Project

## Overview

This project is a backend application designed to handle user authentication, secure data storage, and efficient API responses. Built with Node.js and Express, it utilizes MongoDB for persistent data storage, JWT for secure authentication, and cookies for maintaining session states on the client side.

## Features

- **User Authentication**
  - Registration and login endpoints
  - Secure password hashing
  - JWT-based authentication for stateless sessions

- **Database Interaction (MongoDB)**
  - User and data schemas
  - CRUD operations using Mongoose
  - Efficient data validation and error handling

- **JWT Authentication**
  - Token issuance on successful login
  - Token verification middleware for protected routes
  - Token expiration and refresh strategy

- **Express Server**
  - Modular structure with routers, controllers, and middlewares
  - Custom error handling
  - Listening on a configurable port

- **Cookies Storage**
  - HTTP-only cookies for storing JWT tokens securely on the browser
  - Cookie parsing and management with middleware

## Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB** with **Mongoose**
- **JWT (jsonwebtoken)**
- **bcrypt** for password hashing
- **cookie-parser** for cookie management
- **dotenv** for environment variable management

## Getting Started

### Prerequisites

- Node.js (v18 or above recommended)
- MongoDB instance (local or cloud)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ETKHAN/backend-auth-project.git
   cd backend-auth-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory and add the following:
     ```
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

### Running the Server

```bash
npm start
```
Server will be running on `http://localhost:5000` (or your configured port).

## API Endpoints

### Auth Routes

- `POST /api/auth/register`  
  Register a new user

- `POST /api/auth/login`  
  Authenticate user and receive JWT token (also set as HTTP-only cookie)

- `GET /api/auth/me`  
  Get current authenticated user's info (protected route)

### Example Protected Route

- `GET /api/dashboard`  
  Accessible only with valid JWT

## Project Structure

```
backend-auth-project/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/
├── .env.example
├── server.js
└── README.md
```

## Security Considerations

- Passwords are hashed with bcrypt before storage.
- JWT tokens are signed with a secret and have expiration.
- HTTP-only cookies prevent client-side JavaScript access to tokens.
- Input validation and error handling throughout.

## Contributing

Feel free to open issues or submit pull requests for improvements and bug fixes.

