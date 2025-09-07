# 📖 BookNGo Backend

## Table of Contents
1. [Project Overview](#project-overview)  
2. [Features](#features)  
3. [Tech Stack](#tech-stack)  
4. [Architecture](#architecture)  
5. [API Documentation](#api-documentation)  
6. [Database Schema](#database-schema)  
7. [Setup & Installation](#setup--installation)  
8. [Environment Variables](#environment-variables)  
9. [Running the Server](#running-the-server)  
10. [Testing](#testing)  
11. [Folder Structure](#folder-structure)  

---

## Project Overview

**BookNGo** is an event booking platform backend that allows users to browse events, book tickets, and view their booking history. Administrators can create, update, and manage events, as well as track bookings.  

This backend is built using **Node.js**, **Express.js**, and **PostgreSQL** (hosted on Neon DB). It follows a modular architecture to ensure scalability, maintainability, and easy integration with the frontend.

---

## Features

### User Features:
- Browse upcoming events  
- Book tickets with user details  
- View previous bookings  

### Admin Features:
- Add new events  
- Update existing events  
- View all bookings in table format  

### Common Features:
- JWT-based authentication and authorization  
- Input validation for all API endpoints  
- Error handling with meaningful messages  
- CORS enabled for frontend integration  

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon DB) |
| Authentication | JWT (JSON Web Tokens) |
| API Testing | Postman |
| Version Control | Git, GitHub |
| Deployment | Vercel / Render / Heroku |

---

## Architecture

The backend follows a **MVC-inspired modular structure**:
BookNGo-Backend/
├─ server.js # Entry point
├─ routes/ # API route definitions
├─ controllers/ # Business logic for routes
├─ models/ # Database models / queries
├─ middlewares/ # Auth, error handling, validation
├─ services/ # Helper functions and reusable logic
├─ config/ # DB and environment configuration
└─ utils/ # Utility functions


- **Routes** define API endpoints  
- **Controllers** process requests and return responses  
- **Models** interact with the database  
- **Middlewares** handle authentication, errors, and validation  
- **Services** include helper methods like email notifications or reusable DB operations  

---

## API Documentation

### Base URL
http://localhost:5000/bookngo


### Auth Routes
| Method | Endpoint        | Description            | Body |
|--------|----------------|------------------------|------|
| POST   | `/signup`       | Create new user/admin | `{ name, email, password, role }` |
| POST   | `/login`        | Login user/admin      | `{ email, password }` |

### Event Routes
| Method | Endpoint             | Description             | Body / Query |
|--------|---------------------|------------------------|--------------|
| GET    | `/events`            | Fetch all events       | - |
| GET    | `/events/:id`        | Fetch single event     | - |
| POST   | `/events`            | Create new event (Admin) | `{ title, description, date, location, ticketsAvailable }` |
| PUT    | `/events/:id`        | Update event (Admin)  | `{ title?, description?, date?, location?, ticketsAvailable? }` |
| DELETE | `/events/:id`        | Delete event (Admin)  | - |

### Booking Routes
| Method | Endpoint                 | Description             | Body |
|--------|-------------------------|------------------------|------|
| POST   | `/bookings`             | Book an event          | `{ userId, eventId, numberOfTickets, contactInfo }` |
| GET    | `/bookings/user/:userId` | Get user booking history | - |
| GET    | `/bookings`             | Admin view of all bookings | - |

> All routes (except signup/login) require **JWT authentication**.

---

## Database Schema

### Tables:

#### Users
| Column      | Type    | Description |
|------------|--------|-------------|
| id         | SERIAL PRIMARY KEY | Unique user ID |
| name       | VARCHAR | User full name |
| email      | VARCHAR UNIQUE | User email |
| password   | VARCHAR | Hashed password |
| role       | VARCHAR | `user` or `admin` |
| created_at | TIMESTAMP | Account creation timestamp |

#### Events
| Column           | Type         | Description |
|-----------------|-------------|-------------|
| id              | SERIAL PRIMARY KEY | Unique event ID |
| title           | VARCHAR     | Event title |
| description     | TEXT        | Event description |
| date            | TIMESTAMP   | Event date and time |
| location        | VARCHAR     | Event venue/location |
| ticketsAvailable| INT         | Total available tickets |
| created_at      | TIMESTAMP   | Event creation timestamp |

#### Bookings
| Column         | Type      | Description |
|----------------|-----------|-------------|
| id             | SERIAL PRIMARY KEY | Booking ID |
| user_id        | INT REFERENCES Users(id) | User who booked |
| event_id       | INT REFERENCES Events(id) | Event booked |
| number_of_tickets | INT     | Number of tickets booked |
| contact_info   | JSON      | Contact info for booking |
| created_at     | TIMESTAMP | Booking timestamp |

---

## Setup & Installation

1. **Clone the repo**
```bash
git clone https://github.com/your-username/bookngo-backend.git
cd bookngo-backend
```
2. **Install Dependencies**
 ```bash
npm install
```
3. **Create an env file**
   ```
   PORT=5000
   DB_HOST=your-db-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=your-db-name
   JWT_SECRET=your-secret-key```

## Running a server
# Start the server in development mode
npm run dev

# Start the server in production mode
npm start

Server will run on: http://localhost:5000

Testing

Use Postman or Insomnia to test API endpoints.

Ensure .env variables are correctly set.

Test user signup/login, event creation, bookings, and retrieval.






