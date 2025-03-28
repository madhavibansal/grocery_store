# grocery_store

This is a Grocery Store Management System built with Node.js, Express, TypeScript, MySQL, and Docker. The project allows users to manage groceries, customers, and orders.

Features

Add, update, and fetch groceries

Register and manage customers

Place and manage orders

Track payments

Technologies Used

Backend: Node.js, Express.js, TypeScript

Database: MySQL

Validation: Yup

Environment Variables: dotenv

ORM/Querying: MySQL2

Containerization: Docker

Prerequisites

Make sure you have the following installed:

Node.js (v18 or later)

MySQL

Docker (Optional for containerized setup)

Git (optional, for cloning the repo)

Installation & Setup

1. Clone the Repository

git clone https://github.com/madhavibansal/grocery_store.git
cd grocery_store

2. Install Dependencies

npm install

3. Configure Environment Variables

Create a .env file in the root directory and add the following:

DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=grocery_store
PORT=3000

4. Database Setup

Run the following SQL script to create the required database and tables:

mysql -u root -p < database.sql

Alternatively, you can execute the SQL file manually in MySQL.

5. Start the Server

Development Mode

npm run dev

Production Mode

npm run build
npm start

6. Running with Docker

docker build -t grocery-store .
docker run -p 5000:5000 grocery-store

API Endpoints

Method

Endpoint

Description

POST

/customer

Create a new customer

GET

/customer/:id

Fetch customer details by ID

PUT

/customer/:id

Update customer details

POST

/order

Place a new order

GET

/order/:userId

Get order details for a customer

PATCH

/customer_pay/:id

Update payment status