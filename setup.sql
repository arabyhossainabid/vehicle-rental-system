-- Drop existing tables if they exist
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer'))
);

-- Create vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    daily_rent_price DECIMAL(10, 2) NOT NULL CHECK (daily_rent_price > 0),
    availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('available', 'booked'))
);

-- Create bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id),
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
    rent_start_date DATE NOT NULL,
    rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price > 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'returned'))
);