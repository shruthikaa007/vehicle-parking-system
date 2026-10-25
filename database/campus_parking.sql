-- Vehicle Parking and Campus Access Management System
-- Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS campus_parking;
USE campus_parking;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    registration_id VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'staff', 'security', 'admin') NOT NULL DEFAULT 'student',
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_registration_id (registration_id),
    INDEX idx_role (role)
);

-- Vehicles Table
CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type ENUM('Car', 'Motorcycle', 'Scooter', 'Other') NOT NULL,
    model VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    document_path VARCHAR(255),
    verification_status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    rejection_reason VARCHAR(255),
    verified_at TIMESTAMP NULL,
    verified_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_registration_number (registration_number),
    INDEX idx_user_id (user_id),
    INDEX idx_verification_status (verification_status)
);

-- Parking Zones Table
CREATE TABLE parking_zones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    zone_name VARCHAR(50) UNIQUE NOT NULL,
    zone_code VARCHAR(10) UNIQUE NOT NULL,
    description VARCHAR(255),
    total_slots INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_zone_code (zone_code)
);

-- Parking Slots Table
CREATE TABLE parking_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slot_number VARCHAR(50) NOT NULL,
    zone_id INT NOT NULL,
    floor INT NOT NULL,
    slot_type ENUM('General', 'Staff', 'Accessible', 'Electric Vehicle') NOT NULL,
    status ENUM('Available', 'Reserved', 'Occupied', 'Maintenance') DEFAULT 'Available',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES parking_zones(id) ON DELETE CASCADE,
    INDEX idx_slot_number (slot_number),
    INDEX idx_zone_id (zone_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_slot (zone_id, slot_number)
);

-- Reservations Table
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    parking_slot_id INT NOT NULL,
    reservation_start DATETIME NOT NULL,
    reservation_end DATETIME NOT NULL,
    status ENUM('Active', 'Completed', 'Cancelled', 'Expired') DEFAULT 'Active',
    cancellation_reason VARCHAR(255),
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (parking_slot_id) REFERENCES parking_slots(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_parking_slot_id (parking_slot_id),
    INDEX idx_status (status),
    INDEX idx_reservation_period (reservation_start, reservation_end)
);

-- Entry/Exit Logs Table
CREATE TABLE entry_exit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    reservation_id INT,
    entry_time DATETIME,
    entry_gate VARCHAR(100),
    entry_verified_by INT,
    entry_verification_result ENUM('Cleared', 'Flagged', 'Under Review'),
    exit_time DATETIME,
    exit_gate VARCHAR(100),
    exit_verified_by INT,
    duration_minutes INT,
    is_overstay BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
    FOREIGN KEY (entry_verified_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (exit_verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_registration_number (registration_number),
    INDEX idx_entry_time (entry_time),
    INDEX idx_exit_time (exit_time)
);

-- Violations Table
CREATE TABLE violations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    registration_number VARCHAR(50) NOT NULL,
    user_id INT,
    violation_type ENUM('Unauthorized Parking', 'Overstay', 'Wrong Parking Slot', 'Unregistered Vehicle', 'Expired Reservation', 'Other') NOT NULL,
    severity ENUM('Low', 'Medium', 'High') NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100),
    status ENUM('Open', 'Under Review', 'Resolved') DEFAULT 'Open',
    reported_by INT NOT NULL,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_by INT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    fine_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_registration_number (registration_number),
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_reported_at (reported_at)
);

-- Notifications Table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('Reservation', 'Vehicle', 'Violation', 'Entry/Exit', 'General') NOT NULL,
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
);

-- Insert sample data

-- Users
INSERT INTO users (name, email, phone, registration_id, password_hash, role, department, is_verified) VALUES
('Riya', 'riya.student@ritchennai.ac.in', '9876543210', 'RIT001', '$2y$10$dXRLy7xF2.5ZLHv1bxZhhuNjd1e1cFGJlN9Kqq1V8H6xZj5zO5C2e', 'student', 'Computer Science', TRUE),
('Priya Singh', 'priya.student@ritchennai.ac.in', '8765432109', 'RIT002', '$2y$10$dXRLy7xF2.5ZLHv1bxZhhuNjd1e1cFGJlN9Kqq1V8H6xZj5zO5C2e', 'student', 'Information Technology', TRUE),
('Dr. Sharma', 'sharma.staff@ritchennai.ac.in', '7654321098', 'STAFF001', '$2y$10$dXRLy7xF2.5ZLHv1bxZhhuNjd1e1cFGJlN9Kqq1V8H6xZj5zO5C2e', 'staff', 'Computer Science', TRUE),
('Ravi Security', 'ravi.security@ritchennai.ac.in', '6543210987', 'SEC001', '$2y$10$dXRLy7xF2.5ZLHv1bxZhhuNjd1e1cFGJlN9Kqq1V8H6xZj5zO5C2e', 'security', 'Security', TRUE),
('Admin User', 'admin@ritchennai.ac.in', '5432109876', 'ADMIN001', '$2y$10$dXRLy7xF2.5ZLHv1bxZhhuNjd1e1cFGJlN9Kqq1V8H6xZj5zO5C2e', 'admin', 'Administration', TRUE);

-- Parking Zones
INSERT INTO parking_zones (zone_name, zone_code, description, total_slots) VALUES
('Zone A - Main Campus', 'ZA', 'Main campus parking near academic buildings', 50),
('Zone B - Administrative', 'ZB', 'Administrative building parking', 30),
('Zone C - Sports Complex', 'ZC', 'Sports and recreation area', 40),
('Zone D - Hostels', 'ZD', 'Student hostel area', 60),
('Zone E - Faculty Quarters', 'ZE', 'Faculty residential area', 35);

-- Parking Slots
INSERT INTO parking_slots (slot_number, zone_id, floor, slot_type, status) VALUES
-- Zone A (50 slots)
('A-01', 1, 1, 'General', 'Available'),
('A-02', 1, 1, 'General', 'Available'),
('A-03', 1, 1, 'General', 'Occupied'),
('A-04', 1, 1, 'Staff', 'Available'),
('A-05', 1, 1, 'Accessible', 'Available'),
('A-06', 1, 2, 'General', 'Available'),
('A-07', 1, 2, 'General', 'Reserved'),
('A-08', 1, 2, 'Electric Vehicle', 'Available'),
('A-09', 1, 2, 'General', 'Maintenance'),
('A-10', 1, 2, 'General', 'Available'),
-- Zone B (30 slots)
('B-01', 2, 1, 'Staff', 'Available'),
('B-02', 2, 1, 'Staff', 'Occupied'),
('B-03', 2, 1, 'General', 'Available'),
('B-04', 2, 1, 'General', 'Available'),
('B-05', 2, 1, 'Accessible', 'Available'),
-- Zone C (40 slots)
('C-01', 3, 1, 'General', 'Available'),
('C-02', 3, 1, 'General', 'Occupied'),
('C-03', 3, 1, 'Electric Vehicle', 'Available'),
('C-04', 3, 2, 'General', 'Available'),
('C-05', 3, 2, 'General', 'Available'),
-- Zone D (60 slots)
('D-01', 4, 1, 'General', 'Available'),
('D-02', 4, 1, 'General', 'Occupied'),
('D-03', 4, 1, 'General', 'Available'),
('D-04', 4, 2, 'General', 'Reserved'),
('D-05', 4, 2, 'General', 'Available'),
-- Zone E (35 slots)
('E-01', 5, 1, 'Staff', 'Available'),
('E-02', 5, 1, 'General', 'Available'),
('E-03', 5, 1, 'General', 'Occupied'),
('E-04', 5, 2, 'General', 'Available'),
('E-05', 5, 2, 'General', 'Available');

-- Vehicles
INSERT INTO vehicles (user_id, registration_number, vehicle_type, model, color, verification_status) VALUES
(1, 'TN07AB1234', 'Car', 'Toyota Fortuner', 'Silver', 'Verified'),
(1, 'TN07AB5678', 'Motorcycle', 'Hero Honda', 'Black', 'Verified'),
(2, 'TN07CD9012', 'Car', 'Maruti Swift', 'White', 'Pending'),
(3, 'TN07EF3456', 'Car', 'Hyundai Creta', 'Blue', 'Verified'),
(4, 'TN07GH7890', 'Motorcycle', 'Bajaj Pulsar', 'Red', 'Verified');

-- Reservations (with overlapping time checks)
INSERT INTO reservations (user_id, vehicle_id, parking_slot_id, reservation_start, reservation_end, status) VALUES
(1, 1, 3, '2026-09-27 08:00:00', '2026-09-27 18:00:00', 'Active'),
(2, 3, 7, '2026-09-27 09:00:00', '2026-09-27 17:00:00', 'Active'),
(3, 4, 12, '2026-09-27 07:30:00', '2026-09-27 16:30:00', 'Active'),
(1, 1, 1, '2026-09-28 08:00:00', '2026-09-28 18:00:00', 'Active');

-- Entry/Exit Logs
INSERT INTO entry_exit_logs (vehicle_id, registration_number, reservation_id, entry_time, entry_gate, entry_verified_by, entry_verification_result, is_overstay) VALUES
(1, 'TN07AB1234', 1, '2026-09-27 08:15:00', 'Main Gate', 4, 'Cleared', FALSE),
(2, 'TN07AB5678', NULL, '2026-09-27 09:30:00', 'Back Gate', 4, 'Flagged', FALSE),
(4, 'TN07EF3456', 3, '2026-09-27 07:45:00', 'Main Gate', 4, 'Cleared', FALSE);

-- Violations
INSERT INTO violations (vehicle_id, registration_number, user_id, violation_type, severity, description, location, status, reported_by, reported_at) VALUES
(2, 'TN07AB5678', 2, 'Unauthorized Parking', 'High', 'Vehicle parked in staff zone without permission', 'Zone B-02', 'Open', 4, '2026-09-27 10:00:00'),
(NULL, 'TN07XY9999', NULL, 'Unregistered Vehicle', 'High', 'Unregistered vehicle found in Zone A', 'Zone A-03', 'Under Review', 4, '2026-09-26 15:30:00');

-- Notifications (Sample)
INSERT INTO notifications (user_id, title, message, type, related_id, is_read) VALUES
(1, 'Reservation Confirmed', 'Your reservation for slot A-01 on 2026-09-27 has been confirmed.', 'Reservation', 1, FALSE),
(2, 'Vehicle Verification Pending', 'Your vehicle TN07CD9012 is pending verification.', 'Vehicle', 3, TRUE),
(1, 'Violation Notice', 'A violation has been reported for your vehicle.', 'Violation', 1, FALSE);

-- Audit Logs (Sample)
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at) VALUES
(1, 'CREATE', 'Reservation', 1, '{"slot_id": 3, "start": "2026-09-27 08:00", "end": "2026-09-27 18:00"}', '2026-09-27 08:00:00'),
(4, 'CREATE', 'Entry_Exit_Log', 1, '{"vehicle_id": 1, "entry_gate": "Main Gate"}', '2026-09-27 08:15:00'),
(5, 'UPDATE', 'Violation', 2, '{"status": "Under Review"}', '2026-09-26 16:00:00');

-- Create Views for Statistics

CREATE VIEW dashboard_statistics AS
SELECT 
    (SELECT COUNT(*) FROM vehicles WHERE verification_status = 'Verified') as verified_vehicles,
    (SELECT COUNT(*) FROM parking_slots WHERE status = 'Available') as available_slots,
    (SELECT COUNT(*) FROM parking_slots WHERE status = 'Reserved') as reserved_slots,
    (SELECT COUNT(*) FROM parking_slots WHERE status = 'Occupied') as occupied_slots,
    (SELECT COUNT(*) FROM reservations WHERE status = 'Active') as active_reservations,
    (SELECT COUNT(*) FROM violations WHERE status = 'Open') as open_violations,
    (SELECT COUNT(*) FROM entry_exit_logs WHERE DATE(entry_time) = CURDATE()) as today_entries,
    (SELECT COUNT(*) FROM entry_exit_logs WHERE DATE(exit_time) = CURDATE()) as today_exits;

-- Create Indexes for Performance
CREATE INDEX idx_reservation_slot_time ON reservations(parking_slot_id, reservation_start, reservation_end, status);
CREATE INDEX idx_vehicle_active ON vehicles(user_id, verification_status, is_active);
CREATE INDEX idx_slot_available ON parking_slots(zone_id, slot_type, status);

-- Note: Sample passwords for test accounts:
-- All accounts use password: "password123"
-- Generated with: password_hash("password123", PASSWORD_BCRYPT)
