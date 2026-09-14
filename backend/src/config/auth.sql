-- AUTHENTICATION
CREATE USER 'admin'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'admin';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;




-- Create database
CREATE DATABASE inventory_control_db;
USE inventory_control_db;