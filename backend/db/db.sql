-- Create the database
CREATE DATABASE IF NOT EXISTS urban_service;
USE urban_service;

-- Service Categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt DATETIME,
  updatedAt DATETIME
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cityName VARCHAR(255) NOT NULL,
  pinCode TEXT NOT NULL,
  serviceCategoryId VARCHAR(255)
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100),
  price DECIMAL(10,2),
  availability VARCHAR(100),
  status VARCHAR(50),
  image VARCHAR(255)
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(20),
  city VARCHAR(100),
  status VARCHAR(50),
  joined DATE,
  avatar VARCHAR(10)
);

-- City Services table
CREATE TABLE IF NOT EXISTS city_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT,
  service_id INT,
  status VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100),
  price DECIMAL(10,2),
  availability VARCHAR(100),
  status VARCHAR(50)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  service_id INT,
  amount DECIMAL(10,2),
  status VARCHAR(50),
  date DATE,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  joined DATE DEFAULT CURRENT_DATE,
  avatar VARCHAR(10),
  reset_token VARCHAR(255),
  reset_token_expiry DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Settings table (optional)
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_name VARCHAR(255),
  profile_email VARCHAR(255),
  profile_role VARCHAR(50),
  bio TEXT
);

-- Analytics table (optional)
CREATE TABLE IF NOT EXISTS analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month VARCHAR(20),
  orders INT,
  revenue DECIMAL(10,2)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL UNIQUE,
  items JSON NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  schedule ENUM('instant', 'scheduled', 'recurring') NOT NULL,
  scheduled_at DATETIME,
  cadence VARCHAR(50),
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_address TEXT NOT NULL,
  contact_city VARCHAR(100) NOT NULL,
  contact_pincode VARCHAR(20) NOT NULL,
  contact_area VARCHAR(100),
  payment VARCHAR(50) NOT NULL,
  placed_at DATETIME NOT NULL,
  status ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
  history JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
