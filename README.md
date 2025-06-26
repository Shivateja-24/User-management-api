# User Management API

A simple RESTful API built with Node.js, Express, and SQLite that allows you to perform CRUD operations on user records. This project demonstrates how to build backend APIs with validations, error handling, soft deletion, and relational integrity using SQLite.

## 🚀 Features

- Create new users with validation
- Retrieve users by ID, phone number, manager, or active status
- Bulk update or individually update users
- Smart update: updates create new rows if only manager is changed
- Modular validation using reusable utility functions
- Postman documentation included

## 🧱 Tech Stack

- Node.js
- Express
- SQLite (via sqlite3)
- UUID for unique user IDs
- Postman (for API testing/documentation)

## Run Locally

Clone the project

```bash
  git clone https://github.com/Shivateja-24/User-management-api.git
```

Go to the project directory

```bash
  cd user-management-api
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## 📌 API Endpoints

### 🔸 Create User

Creates a new user. Validates mobile number, PAN number, and checks for existing active manager

### 🔸 Get User

Fetches users. You can pass filters like user_id, mob_num, manager_id, or is_active.
If no filters are passed, it returns all users.

### 🔸 Delete User

Delete a user based on user_id or mob_num

### 🔸 Update User

Updates user(s).  
If only manager_id is given, it creates a new row (soft update).
If multiple fields are passed, updates the existing row directly.

## Documentation

[![Postman](https://img.shields.io/badge/View%20in-Postman-orange?logo=postman) Documentation](https://shivatejaannaram.postman.co/workspace/Shivateja-Annaram's-Workspace~14816378-0956-4803-81ca-c4a7cc5a4366/collection/46226326-68847e39-923d-4d5e-a59b-bd89cc1bbccd?action=share&creator=46226326)

## Assignment Reference

This project was built based on a structured assignment.\
👉[View Full Assignment Document](./REQUIREMENTS.md)

## Authors

- [Shivateja Annaram](https://www.github.com/Shivateja-24)
