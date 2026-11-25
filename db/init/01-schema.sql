

-- database tables creation

-- table: categories - YES
CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT
);

-- table: suppliers - YES
CREATE TABLE suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  contact_name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT
);

ALTER TABLE suppliers ADD COLUMN active BOOLEAN DEFAULT TRUE;


-- table: products - YES
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  barcode VARCHAR(50),
  brand VARCHAR(100),
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  stock INT,
  stock_minimum INT,
  photo VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  category_id INT,
  supplier_id INT,
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- table: roles - YES
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  code VARCHAR(50)
);
-- inserting roles - YES
INSERT INTO roles (name, code) VALUES ('ADMIN', '__inventory__control__system__');
INSERT INTO roles (name) VALUES ('SELLER');

-- table: users - YES
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  password VARCHAR(255),
  address TEXT,
  role_id INT,
  photo VARCHAR(255),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- table: customers - YES
CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  ci VARCHAR(20),
  email VARCHAR(100),
  phone VARCHAR(20)
);

-- table: inventory - YES - add supplier_id
CREATE TABLE inventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  supplier_id INT NULL,
  type VARCHAR(50),
  quantity INT,
  date DATETIME,
  comment VARCHAR(255),
  user_id INT,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- table: sales - YES
CREATE TABLE sales (
  sale_id INT AUTO_INCREMENT PRIMARY KEY,
  date DATETIME,
  customer_id INT,
  seller_id INT,
  total DECIMAL(10,2),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- table: sale_details - YES
CREATE TABLE sale_details (
  sale_details_id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT,
  product_id INT,
  quantity INT,
  unit_price DECIMAL(10,2),
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- table: notifications - YES
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT,
  type VARCHAR(50),
  title VARCHAR(250),
  message TEXT,
  date DATETIME,
  expiration_date DATETIME,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- table: repairs - YES
CREATE TABLE repairs (
  repair_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  customer_id INT,
  description TEXT,
  model VARCHAR(150),
  total_price DECIMAL(10,2),
  deposit DECIMAL(10,2),
  spare_part_cost DECIMAL(10,2),
  status VARCHAR(50),
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME,
  observations TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- table: sections - YES
CREATE TABLE sections (
  section_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT
);
ALTER TABLE categories
ADD COLUMN section_id INT,
ADD FOREIGN KEY (section_id) REFERENCES sections(section_id);

ALTER TABLE categories
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE,
ADD FOREIGN KEY (section_id) REFERENCES sections(section_id);

-- table: dollar
CREATE TABLE dollar_exchange (
  dollar_exchange_id INT AUTO_INCREMENT PRIMARY KEY,
  price DECIMAL(10,2),
  observation VARCHAR(250),
  register_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
