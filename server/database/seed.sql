-- Cisco Trainer Progress Tracking System - Seed Data

-- ============================================
-- CENTRES
-- ============================================
INSERT INTO centres (name, location, status) VALUES
('Nairobi Training Centre', 'Nairobi CBD, Kimathi Street', 'active'),
('Mombasa Training Centre', 'Mombasa, Nkrumah Road', 'active'),
('Kisumu Training Centre', 'Kisumu, Oginga Odinga Street', 'active');

-- ============================================
-- USERS - Passwords are hashed with bcryptjs
-- All passwords are the same as the username part before @
-- Example: admin@cisco.com password is 'admin123'
-- We'll hash these in setup.js, for now using a placeholder hash
-- ============================================

-- Super Admin
INSERT INTO users (name, email, password_hash, phone, centre_id, role, status) VALUES
('Super Administrator', 'admin@cisco.com', '\\\', '+254700000000', NULL, 'super_admin', 'active');

-- Centre Admins
INSERT INTO users (name, email, password_hash, phone, centre_id, role, status) VALUES
('Nairobi Admin', 'nairobi.admin@cisco.com', '\\\', '+254711000001', 1, 'admin', 'active'),
('Mombasa Admin', 'mombasa.admin@cisco.com', '\\\', '+254711000002', 2, 'admin', 'active'),
('Kisumu Admin', 'kisumu.admin@cisco.com', '\\\', '+254711000003', 3, 'admin', 'active');

-- Instructors for Nairobi
INSERT INTO users (name, email, password_hash, phone, centre_id, role, status) VALUES
('John Instructor', 'instructor1.nairobi@cisco.com', '\\\', '+254722000001', 1, 'instructor', 'active'),
('Jane Instructor', 'instructor2.nairobi@cisco.com', '\\\', '+254722000002', 1, 'instructor', 'active');

-- Instructors for Mombasa
INSERT INTO users (name, email, password_hash, phone, centre_id, role, status) VALUES
('Mike Instructor', 'instructor1.mombasa@cisco.com', '\\\', '+254722000003', 2, 'instructor', 'active');

-- Instructors for Kisumu
INSERT INTO users (name, email, password_hash, phone, centre_id, role, status) VALUES
('Paul Instructor', 'instructor1.kisumu@cisco.com', '\\\', '+254722000004', 3, 'instructor', 'active');

-- ============================================
-- STUDENTS - 10 per centre (40 total)
-- Streams: Love, Joy, Peace, Mnara
-- ============================================

-- Nairobi Students
INSERT INTO students (first_name, last_name, email, phone, stream, centre_id, enrollment_date, status, emergency_contact, notes) VALUES
('Alice', 'Wanjiku', 'alice.wanjiku@email.com', '+254712000001', 'Love', 1, '2024-01-15', 'active', '+254733000001', 'Good progress'),
('Bob', 'Mwangi', 'bob.mwangi@email.com', '+254712000002', 'Joy', 1, '2024-01-15', 'active', '+254733000002', 'Needs extra practice'),
('Carol', 'Wambui', 'carol.wambui@email.com', '+254712000003', 'Peace', 1, '2024-01-15', 'active', '+254733000003', 'Excellent attendance'),
('David', 'Kamau', 'david.kamau@email.com', '+254712000004', 'Mnara', 1, '2024-01-15', 'active', '+254733000004', 'Quick learner'),
('Emily', 'Njeri', 'emily.njeri@email.com', '+254712000005', 'Love', 1, '2024-01-20', 'active', '+254733000005', 'Struggling with Module 3'),
('Frank', 'Odhiambo', 'frank.odhiambo@email.com', '+254712000006', 'Joy', 1, '2024-01-20', 'active', '+254733000006', 'Lab assistant volunteer'),
('Grace', 'Akinyi', 'grace.akinyi@email.com', '+254712000007', 'Peace', 1, '2024-01-20', 'active', '+254733000007', 'Needs mentorship'),
('Henry', 'Kiprotich', 'henry.kiprotich@email.com', '+254712000008', 'Mnara', 1, '2024-02-01', 'active', '+254733000008', 'Part-time student'),
('Irene', 'Chebet', 'irene.chebet@email.com', '+254712000009', 'Love', 1, '2024-02-01', 'active', '+254733000009', 'Top performer'),
('James', 'Mutua', 'james.mutua@email.com', '+254712000010', 'Joy', 1, '2024-02-01', 'active', '+254733000010', 'Needs financial aid');

-- Mombasa Students
INSERT INTO students (first_name, last_name, email, phone, stream, centre_id, enrollment_date, status, emergency_contact, notes) VALUES
('Kassim', 'Ali', 'kassim.ali@email.com', '+254712000011', 'Love', 2, '2024-01-15', 'active', '+254733000011', 'Regular attendance'),
('Linda', 'Hassan', 'linda.hassan@email.com', '+254712000012', 'Joy', 2, '2024-01-15', 'active', '+254733000012', 'Good practical skills'),
('Mohamed', 'Said', 'mohamed.said@email.com', '+254712000013', 'Peace', 2, '2024-01-20', 'active', '+254733000013', 'Needs theory improvement'),
('Nancy', 'Juma', 'nancy.juma@email.com', '+254712000014', 'Mnara', 2, '2024-01-20', 'active', '+254733000014', 'Excellent student'),
('Omar', 'Bakari', 'omar.bakari@email.com', '+254712000015', 'Love', 2, '2024-02-01', 'active', '+254733000015', 'Lab equipment specialist'),
('Patricia', 'Mwakio', 'patricia.mwakio@email.com', '+254712000016', 'Joy', 2, '2024-02-01', 'active', '+254733000016', 'Needs peer tutoring'),
('Rashid', 'Khamis', 'rashid.khamis@email.com', '+254712000017', 'Peace', 2, '2024-02-01', 'active', '+254733000017', 'Part-time student'),
('Sarah', 'Mwalimu', 'sarah.mwalimu@email.com', '+254712000018', 'Mnara', 2, '2024-01-15', 'active', '+254733000018', 'Helps with lab setup'),
('Tom', 'Odhiambo', 'tom.odhiambo@email.com', '+254712000019', 'Love', 2, '2024-01-20', 'active', '+254733000019', 'Fast learner'),
('Amina', 'Wanjala', 'amina.wanjala@email.com', '+254712000020', 'Joy', 2, '2024-02-01', 'active', '+254733000020', 'Good attendance record');

-- Kisumu Students
INSERT INTO students (first_name, last_name, email, phone, stream, centre_id, enrollment_date, status, emergency_contact, notes) VALUES
('Brian', 'Ochieng', 'brian.ochieng@email.com', '+254712000021', 'Love', 3, '2024-01-15', 'active', '+254733000021', 'Lab team leader'),
('Christine', 'Atieno', 'christine.atieno@email.com', '+254712000022', 'Joy', 3, '2024-01-15', 'active', '+254733000022', 'Struggling financially'),
('Daniel', 'Onyango', 'daniel.onyango@email.com', '+254712000023', 'Peace', 3, '2024-01-20', 'active', '+254733000023', 'Excellent practicals'),
('Elizabeth', 'Akoth', 'elizabeth.akoth@email.com', '+254712000024', 'Mnara', 3, '2024-01-20', 'active', '+254733000024', 'Top of class'),
('Frederick', 'Ouma', 'frederick.ouma@email.com', '+254712000025', 'Love', 3, '2024-02-01', 'active', '+254733000025', 'Needs extra modules'),
('Gladys', 'Anyango', 'gladys.anyango@email.com', '+254712000026', 'Joy', 3, '2024-02-01', 'active', '+254733000026', 'Good peer tutor'),
('Hillary', 'Otieno', 'hillary.otieno@email.com', '+254712000027', 'Peace', 3, '2024-02-01', 'active', '+254733000027', 'Network specialist interest'),
('Ivan', 'Okoth', 'ivan.okoth@email.com', '+254712000028', 'Mnara', 3, '2024-01-15', 'active', '+254733000028', 'Hardware expert'),
('Joyce', 'Apondi', 'joyce.apondi@email.com', '+254712000029', 'Love', 3, '2024-01-20', 'active', '+254733000029', 'Needs counseling'),
('Kevin', 'Omondi', 'kevin.omondi@email.com', '+254712000030', 'Joy', 3, '2024-02-01', 'active', '+254733000030', 'Good overall performance');

-- ============================================
-- ATTENDANCE RECORDS - Last 5 days
-- Assuming today is 2024-03-20
-- ============================================

-- Day 1 - 2024-03-14 (Mostly Present)
INSERT INTO attendance_records (student_id, date, status, absence_reason, time_in, marked_by) VALUES
(1, '2024-03-14', 'P', NULL, '08:00', 5),
(2, '2024-03-14', 'P', NULL, '08:05', 5),
(3, '2024-03-14', 'A', 'Sick', NULL, 5),
(4, '2024-03-14', 'P', NULL, '08:00', 5),
(5, '2024-03-14', 'P', NULL, '08:10', 5),
(6, '2024-03-14', 'P', NULL, '08:00', 5),
(7, '2024-03-14', 'P', NULL, '08:15', 5),
(8, '2024-03-14', 'A', 'Family Emergency', NULL, 5),
(9, '2024-03-14', 'P', NULL, '08:00', 5),
(10, '2024-03-14', 'P', NULL, '08:05', 5);

-- Day 2 - 2024-03-15
INSERT INTO attendance_records (student_id, date, status, absence_reason, time_in, marked_by) VALUES
(1, '2024-03-15', 'P', NULL, '08:00', 5),
(2, '2024-03-15', 'P', NULL, '08:10', 5),
(3, '2024-03-15', 'A', 'Sick', NULL, 5),
(4, '2024-03-15', 'P', NULL, '08:00', 5),
(5, '2024-03-15', 'A', 'No Reason', NULL, 5),
(6, '2024-03-15', 'P', NULL, '08:05', 5),
(7, '2024-03-15', 'P', NULL, '08:00', 5),
(8, '2024-03-15', 'P', NULL, '08:20', 5),
(9, '2024-03-15', 'P', NULL, '08:00', 5),
(10, '2024-03-15', 'P', NULL, '08:00', 5);

-- Day 3 - 2024-03-18
INSERT INTO attendance_records (student_id, date, status, absence_reason, time_in, marked_by) VALUES
(1, '2024-03-18', 'P', NULL, '08:00', 5),
(2, '2024-03-18', 'P', NULL, '08:05', 5),
(3, '2024-03-18', 'P', NULL, '08:10', 5),
(4, '2024-03-18', 'A', 'Family Emergency', NULL, 5),
(5, '2024-03-18', 'P', NULL, '08:00', 5),
(6, '2024-03-18', 'P', NULL, '08:00', 5),
(7, '2024-03-18', 'P', NULL, '08:15', 5),
(8, '2024-03-18', 'P', NULL, '08:00', 5),
(9, '2024-03-18', 'A', 'Sick', NULL, 5),
(10, '2024-03-18', 'P', NULL, '08:05', 5);

-- Day 4 - 2024-03-19
INSERT INTO attendance_records (student_id, date, status, absence_reason, time_in, marked_by) VALUES
(1, '2024-03-19', 'P', NULL, '08:00', 5),
(2, '2024-03-19', 'P', NULL, '08:00', 5),
(3, '2024-03-19', 'P', NULL, '08:10', 5),
(4, '2024-03-19', 'P', NULL, '08:05', 5),
(5, '2024-03-19', 'P', NULL, '08:00', 5),
(6, '2024-03-19', 'A', 'No Reason', NULL, 5),
(7, '2024-03-19', 'P', NULL, '08:00', 5),
(8, '2024-03-19', 'P', NULL, '08:20', 5),
(9, '2024-03-19', 'P', NULL, '08:00', 5),
(10, '2024-03-19', 'P', NULL, '08:00', 5);

-- Day 5 - 2024-03-20 (Today)
INSERT INTO attendance_records (student_id, date, status, absence_reason, time_in, marked_by) VALUES
(1, '2024-03-20', 'P', NULL, '08:00', 5),
(2, '2024-03-20', 'P', NULL, '08:05', 5),
(3, '2024-03-20', 'P', NULL, '08:00', 5),
(4, '2024-03-20', 'P', NULL, '08:00', 5),
(5, '2024-03-20', 'A', 'Sick', NULL, 5),
(6, '2024-03-20', 'P', NULL, '08:10', 5),
(7, '2024-03-20', 'P', NULL, '08:00', 5),
(8, '2024-03-20', 'P', NULL, '08:15', 5),
(9, '2024-03-20', 'P', NULL, '08:00', 5),
(10, '2024-03-20', 'P', NULL, '08:00', 5);

-- ============================================
-- PERFORMANCE SCORES - Modules 1-4 for all Nairobi students
-- ============================================

-- Module 1: Introduction to Personal Computer Hardware
INSERT INTO performance_scores (student_id, module_number, module_name, quiz_score, practical_score, exam_score, date_entered) VALUES
(1, 1, 'Introduction to Personal Computer Hardware', 85, 90, 88, '2024-01-20'),
(2, 1, 'Introduction to Personal Computer Hardware', 70, 75, 72, '2024-01-20'),
(3, 1, 'Introduction to Personal Computer Hardware', 90, 95, 92, '2024-01-20'),
(4, 1, 'Introduction to Personal Computer Hardware', 65, 80, 75, '2024-01-20'),
(5, 1, 'Introduction to Personal Computer Hardware', 55, 60, 58, '2024-01-20'),
(6, 1, 'Introduction to Personal Computer Hardware', 88, 85, 87, '2024-01-20'),
(7, 1, 'Introduction to Personal Computer Hardware', 72, 70, 71, '2024-01-20'),
(8, 1, 'Introduction to Personal Computer Hardware', 80, 82, 81, '2024-01-20'),
(9, 1, 'Introduction to Personal Computer Hardware', 95, 98, 96, '2024-01-20'),
(10, 1, 'Introduction to Personal Computer Hardware', 68, 72, 70, '2024-01-20');

-- Module 2: PC Assembly
INSERT INTO performance_scores (student_id, module_number, module_name, quiz_score, practical_score, exam_score, date_entered) VALUES
(1, 2, 'PC Assembly', 82, 88, 85, '2024-02-05'),
(2, 2, 'PC Assembly', 75, 78, 76, '2024-02-05'),
(3, 2, 'PC Assembly', 92, 95, 93, '2024-02-05'),
(4, 2, 'PC Assembly', 70, 85, 78, '2024-02-05'),
(5, 2, 'PC Assembly', 50, 55, 52, '2024-02-05'),
(6, 2, 'PC Assembly', 85, 90, 87, '2024-02-05'),
(7, 2, 'PC Assembly', 78, 75, 77, '2024-02-05'),
(8, 2, 'PC Assembly', 82, 80, 81, '2024-02-05'),
(9, 2, 'PC Assembly', 98, 100, 99, '2024-02-05'),
(10, 2, 'PC Assembly', 65, 70, 68, '2024-02-05');

-- Module 3: Advanced Computer Hardware
INSERT INTO performance_scores (student_id, module_number, module_name, quiz_score, practical_score, exam_score, date_entered) VALUES
(1, 3, 'Advanced Computer Hardware', 80, 85, 82, '2024-02-20'),
(2, 3, 'Advanced Computer Hardware', 78, 82, 80, '2024-02-20'),
(3, 3, 'Advanced Computer Hardware', 94, 92, 93, '2024-02-20'),
(4, 3, 'Advanced Computer Hardware', 72, 88, 80, '2024-02-20'),
(5, 3, 'Advanced Computer Hardware', 45, 50, 48, '2024-02-20'),
(6, 3, 'Advanced Computer Hardware', 82, 88, 85, '2024-02-20'),
(7, 3, 'Advanced Computer Hardware', 75, 72, 74, '2024-02-20'),
(8, 3, 'Advanced Computer Hardware', 85, 82, 84, '2024-02-20'),
(9, 3, 'Advanced Computer Hardware', 96, 98, 97, '2024-02-20'),
(10, 3, 'Advanced Computer Hardware', 62, 68, 65, '2024-02-20');

-- Module 4: Preventive Maintenance and Troubleshooting
INSERT INTO performance_scores (student_id, module_number, module_name, quiz_score, practical_score, exam_score, date_entered) VALUES
(1, 4, 'Preventive Maintenance and Troubleshooting', 88, 92, 90, '2024-03-10'),
(2, 4, 'Preventive Maintenance and Troubleshooting', 80, 85, 82, '2024-03-10'),
(3, 4, 'Preventive Maintenance and Troubleshooting', 90, 95, 92, '2024-03-10'),
(4, 4, 'Preventive Maintenance and Troubleshooting', 75, 90, 83, '2024-03-10'),
(5, 4, 'Preventive Maintenance and Troubleshooting', 48, 52, 50, '2024-03-10'),
(6, 4, 'Preventive Maintenance and Troubleshooting', 86, 90, 88, '2024-03-10'),
(7, 4, 'Preventive Maintenance and Troubleshooting', 72, 75, 73, '2024-03-10'),
(8, 4, 'Preventive Maintenance and Troubleshooting', 80, 85, 82, '2024-03-10'),
(9, 4, 'Preventive Maintenance and Troubleshooting', 95, 98, 96, '2024-03-10'),
(10, 4, 'Preventive Maintenance and Troubleshooting', 68, 72, 70, '2024-03-10');

-- ============================================
-- LAB WORKSTATIONS - 10 per centre
-- ============================================

-- Nairobi Workstations
INSERT INTO lab_workstations (workstation_number, centre_id, status, cpu_status, monitor_status, keyboard_status, mouse_status, network_status, notes) VALUES
('WS-NAI-001', 1, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'New workstation'),
('WS-NAI-002', 1, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'Upgraded RAM to 16GB'),
('WS-NAI-003', 1, 'partial', TRUE, TRUE, FALSE, TRUE, TRUE, 'Keyboard needs replacement'),
('WS-NAI-004', 1, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-NAI-005', 1, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'SSD installed'),
('WS-NAI-006', 1, 'down', FALSE, TRUE, TRUE, TRUE, FALSE, 'Motherboard issue, needs replacement'),
('WS-NAI-007', 1, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-NAI-008', 1, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'New monitor installed'),
('WS-NAI-009', 1, 'partial', TRUE, FALSE, TRUE, TRUE, TRUE, 'Monitor flickering, needs check'),
('WS-NAI-010', 1, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'Reserved for instructor demos');

-- Mombasa Workstations
INSERT INTO lab_workstations (workstation_number, centre_id, status, cpu_status, monitor_status, keyboard_status, mouse_status, network_status, notes) VALUES
('WS-MBA-001', 2, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-MBA-002', 2, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-MBA-003', 2, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'Good for networking labs'),
('WS-MBA-004', 2, 'partial', TRUE, TRUE, FALSE, TRUE, TRUE, 'Keyboard missing keys'),
('WS-MBA-005', 2, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-MBA-006', 2, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'New CPU'),
('WS-MBA-007', 2, 'down', FALSE, FALSE, FALSE, FALSE, FALSE, 'Complete failure, needs replacement'),
('WS-MBA-008', 2, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-MBA-009', 2, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-MBA-010', 2, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'Student favorite');

-- Kisumu Workstations
INSERT INTO lab_workstations (workstation_number, centre_id, status, cpu_status, monitor_status, keyboard_status, mouse_status, network_status, notes) VALUES
('WS-KSM-001', 3, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-KSM-002', 3, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'Dual monitor setup'),
('WS-KSM-003', 3, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-KSM-004', 3, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'High-spec for video editing'),
('WS-KSM-005', 3, 'partial', TRUE, TRUE, TRUE, FALSE, TRUE, 'Mouse not working'),
('WS-KSM-006', 3, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-KSM-007', 3, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-KSM-008', 3, 'down', TRUE, TRUE, TRUE, TRUE, FALSE, 'Network card failure'),
('WS-KSM-009', 3, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, ''),
('WS-KSM-010', 3, 'functional', TRUE, TRUE, TRUE, TRUE, TRUE, 'Latest updates installed');

-- ============================================
-- LAB LAPTOPS
-- ============================================
INSERT INTO lab_laptops (brand, model, serial_number, centre_id, status, uaf_expiry_date, warranty_expiry, purchase_date, notes) VALUES
('Dell', 'Latitude 5540', 'DL-2024-001', 1, 'available', '2025-01-15', '2027-01-15', '2024-01-15', 'Instructor laptop'),
('Dell', 'Latitude 5540', 'DL-2024-002', 1, 'assigned', '2025-01-15', '2027-01-15', '2024-01-15', 'Assigned to Alice Wanjiku'),
('HP', 'EliteBook 850', 'HP-2024-001', 1, 'available', '2025-02-01', '2027-02-01', '2024-02-01', ''),
('Lenovo', 'ThinkPad T14', 'LN-2024-001', 1, 'maintenance', '2025-03-01', '2027-03-01', '2024-03-01', 'Battery replacement needed'),
('Dell', 'Latitude 5550', 'DL-2024-003', 2, 'available', '2025-01-20', '2027-01-20', '2024-01-20', 'Mombasa centre'),
('HP', 'ProBook 450', 'HP-2024-002', 2, 'assigned', '2025-02-15', '2027-02-15', '2024-02-15', 'Assigned to Kassim Ali'),
('Lenovo', 'ThinkPad T15', 'LN-2024-002', 3, 'available', '2025-03-15', '2027-03-15', '2024-03-15', 'Kisumu centre'),
('Dell', 'Latitude 5540', 'DL-2024-004', 3, 'available', '2025-04-01', '2027-04-01', '2024-04-01', '');

-- ============================================
-- LAB EQUIPMENT
-- ============================================
INSERT INTO lab_equipment (equipment_type, brand, model, serial_number, centre_id, quantity, status, location, notes) VALUES
('Router', 'Cisco', 'ISR 4321', 'CISCO-4321-001', 1, 4, 'available', 'Lab Room A', 'For CCNA labs'),
('Switch', 'Cisco', 'Catalyst 2960', 'CISCO-2960-001', 1, 6, 'in-use', 'Lab Room A', 'Currently used for Module 5'),
('Server', 'Dell', 'PowerEdge R450', 'DELL-R450-001', 1, 2, 'available', 'Server Room', 'For virtualization labs'),
('Firewall', 'Cisco', 'ASA 5506-X', 'CISCO-ASA-001', 1, 2, 'available', 'Lab Room B', 'Security module equipment'),
('Router', 'Cisco', 'ISR 4221', 'CISCO-4221-002', 2, 3, 'available', 'Main Lab', 'Mombasa equipment'),
('Switch', 'Cisco', 'Catalyst 2960', 'CISCO-2960-002', 2, 4, 'available', 'Main Lab', ''),
('Server', 'HP', 'ProLiant DL380', 'HP-DL380-001', 2, 1, 'maintenance', 'Server Room', 'Needs OS reinstall'),
('Router', 'Cisco', 'ISR 4321', 'CISCO-4321-003', 3, 3, 'available', 'Lab 1', 'Kisumu equipment'),
('Switch', 'Cisco', 'Catalyst 9200', 'CISCO-9200-001', 3, 4, 'available', 'Lab 1', 'New switches'),
('Access Point', 'Cisco', 'Aironet 3800', 'CISCO-AP-001', 1, 8, 'in-use', 'All Labs', 'Wireless coverage');

-- ============================================
-- OTHER DEVICES
-- ============================================
INSERT INTO lab_other_devices (device_type, brand, model, serial_number, centre_id, status, location, notes) VALUES
('Projector', 'Epson', 'EB-X41', 'EPS-X41-001', 1, 'available', 'Lab Room A', ''),
('Projector', 'Epson', 'EB-X41', 'EPS-X41-002', 2, 'available', 'Main Lab', ''),
('Projector', 'BenQ', 'MW560', 'BENQ-560-001', 3, 'available', 'Lab 1', ''),
('Printer', 'HP', 'LaserJet Pro', 'HP-LJ-001', 1, 'available', 'Admin Office', 'Network printer'),
('UPS', 'APC', 'Smart-UPS 1500', 'APC-1500-001', 1, 'in-use', 'Server Room', ''),
('Smart Board', 'SMART', 'SB680', 'SMART-680-001', 1, 'available', 'Lab Room A', 'Interactive whiteboard'),
('Toolkit', 'iFixit', 'Pro Tech Toolkit', 'IFIX-001', 1, 'in-use', 'Lab Storage', 'For PC maintenance labs'),
('Cable Tester', 'Fluke', 'MicroScanner2', 'FLUKE-MS2-001', 1, 'available', 'Lab Storage', 'Network cable testing');

-- ============================================
-- MAINTENANCE LOGS
-- ============================================
INSERT INTO maintenance_logs (device_type, device_id, centre_id, issue_description, status, priority, reported_by, assigned_to, date_reported, date_resolved, resolution_notes) VALUES
('workstation', 6, 1, 'Computer not powering on, suspected motherboard failure', 'open', 'critical', 5, 'IT Support Team', '2024-03-10', NULL, NULL),
('workstation', 3, 1, 'Keyboard not responding, multiple keys not working', 'in-progress', 'medium', 5, 'Lab Technician', '2024-03-12', NULL, 'Ordered replacement keyboard'),
('workstation', 9, 1, 'Monitor flickering intermittently', 'open', 'low', 6, 'Lab Technician', '2024-03-15', NULL, NULL),
('workstation', 7, 2, 'Complete system failure, no power, no display', 'open', 'critical', 7, 'IT Support Team', '2024-03-08', NULL, 'Needs complete replacement'),
('workstation', 4, 2, 'Keyboard missing several keys', 'in-progress', 'medium', 7, 'Lab Technician', '2024-03-14', NULL, 'Replace keyboard'),
('laptop', 4, 1, 'Battery not holding charge, needs replacement', 'open', 'medium', 5, 'IT Support', '2024-03-16', NULL, NULL),
('equipment', 7, 2, 'Server needs OS reinstallation after crash', 'in-progress', 'high', 7, 'System Admin', '2024-03-05', NULL, 'Backing up data before reinstall'),
('workstation', 8, 3, 'Network card not detected by OS', 'resolved', 'high', 8, 'Lab Technician', '2024-03-01', '2024-03-10', 'Replaced network card, updated drivers'),
('workstation', 5, 3, 'Mouse cursor jumping erratically', 'open', 'low', 8, 'Lab Technician', '2024-03-18', NULL, NULL);

-- ============================================
-- PREVENTIVE MAINTENANCE
-- ============================================
INSERT INTO preventive_maintenance (centre_id, device_type, device_id, task_description, frequency, last_done, next_due, assigned_to, status) VALUES
(1, 'workstation', 1, 'Clean dust from CPU fans and vents', 'monthly', '2024-02-15', '2024-03-15', 'Lab Technician', 'overdue'),
(1, 'workstation', 2, 'Clean dust from CPU fans and vents', 'monthly', '2024-02-15', '2024-03-15', 'Lab Technician', 'overdue'),
(1, 'workstation', 3, 'Clean dust from CPU fans and vents', 'monthly', '2024-03-01', '2024-04-01', 'Lab Technician', 'pending'),
(1, 'all', 0, 'Update antivirus definitions', 'weekly', '2024-03-17', '2024-03-24', 'IT Support', 'pending'),
(1, 'all', 0, 'Backup student data and configurations', 'daily', '2024-03-19', '2024-03-20', 'System Admin', 'pending'),
(2, 'workstation', 1, 'Clean dust from CPU fans and vents', 'monthly', '2024-02-28', '2024-03-28', 'Lab Technician', 'pending'),
(2, 'all', 0, 'Update antivirus definitions', 'weekly', '2024-03-16', '2024-03-23', 'IT Support', 'pending'),
(3, 'workstation', 1, 'Clean dust from CPU fans and vents', 'monthly', '2024-03-01', '2024-04-01', 'Lab Technician', 'pending'),
(3, 'all', 0, 'Update operating systems and software', 'monthly', '2024-03-01', '2024-04-01', 'IT Support', 'pending');

-- ============================================
-- TIMETABLE CONFIG
-- ============================================
INSERT INTO timetable_config (day_of_week, stream, centre_id, start_time, end_time, session_type, is_active) VALUES
('Monday', 'Love', 1, '08:00', '12:00', 'cisco', TRUE),
('Monday', 'Joy', 1, '13:00', '17:00', 'cisco', TRUE),
('Tuesday', 'Peace', 1, '08:00', '12:00', 'cisco', TRUE),
('Tuesday', 'Mnara', 1, '13:00', '17:00', 'cisco', TRUE),
('Wednesday', 'Love', 1, '08:00', '12:00', 'cisco', TRUE),
('Wednesday', 'Joy', 1, '13:00', '17:00', 'cisco', TRUE),
('Thursday', 'Peace', 1, '08:00', '12:00', 'cisco', TRUE),
('Thursday', 'Mnara', 1, '13:00', '17:00', 'cisco', TRUE),
('Friday', 'All Streams', 1, '08:00', '12:00', 'extra', TRUE),
('Saturday', 'All Streams', 1, '09:00', '13:00', 'intensive', TRUE),
('Monday', 'Love', 2, '08:00', '12:00', 'cisco', TRUE),
('Monday', 'Joy', 2, '13:00', '17:00', 'cisco', TRUE),
('Tuesday', 'Peace', 2, '08:00', '12:00', 'cisco', TRUE),
('Tuesday', 'Mnara', 2, '13:00', '17:00', 'cisco', TRUE),
('Wednesday', 'Love', 2, '08:00', '12:00', 'cisco', TRUE),
('Wednesday', 'Joy', 2, '13:00', '17:00', 'cisco', TRUE),
('Monday', 'Love', 3, '08:00', '12:00', 'cisco', TRUE),
('Monday', 'Joy', 3, '13:00', '17:00', 'cisco', TRUE),
('Tuesday', 'Peace', 3, '08:00', '12:00', 'cisco', TRUE),
('Tuesday', 'Mnara', 3, '13:00', '17:00', 'cisco', TRUE);

-- ============================================
-- DELIVERY PLANS
-- ============================================
INSERT INTO delivery_plans (term, centre_id, stream, total_hours, completed_hours, modules_planned, modules_completed, saturday_intensives, start_date, end_date, status, notes) VALUES
(1, 1, 'Love', 120, 100, '1,2,3,4,5', '1,2,3,4', 4, '2024-01-15', '2024-04-15', 'in-progress', 'On track to complete'),
(1, 1, 'Joy', 120, 95, '1,2,3,4,5', '1,2,3,4', 3, '2024-01-15', '2024-04-15', 'in-progress', 'Slightly behind schedule'),
(1, 1, 'Peace', 120, 110, '1,2,3,4,5', '1,2,3,4', 5, '2024-01-15', '2024-04-15', 'in-progress', 'Ahead of schedule'),
(1, 1, 'Mnara', 120, 90, '1,2,3,4,5', '1,2,3,4', 3, '2024-01-15', '2024-04-15', 'in-progress', 'Need more intensives'),
(2, 1, 'Love', 120, 0, '6,7,8,9,10', '', 0, '2024-05-01', '2024-08-01', 'planned', 'Term 2 preparation'),
(2, 1, 'Joy', 120, 0, '6,7,8,9,10', '', 0, '2024-05-01', '2024-08-01', 'planned', ''),
(3, 1, 'Love', 120, 0, '11,12,13,14', '', 0, '2024-09-01', '2024-12-01', 'planned', 'Final term'),
(1, 2, 'Love', 120, 85, '1,2,3,4,5', '1,2,3,4', 2, '2024-01-20', '2024-04-20', 'in-progress', 'Mombasa centre'),
(1, 3, 'Love', 120, 90, '1,2,3,4,5', '1,2,3,4', 3, '2024-01-25', '2024-04-25', 'in-progress', 'Kisumu centre');

-- ============================================
-- MODULE CURRICULUM - IT Essentials v8
-- Module 1-7 with all sections
-- ============================================

-- Module 1: Introduction to Personal Computer Hardware
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(1, 'Introduction to Personal Computer Hardware', 1.1, 'Personal Computers', 'What is a PC? Types of personal computers, Desktop vs Laptop components', 1),
(1, 'Introduction to Personal Computer Hardware', 1.2, 'PC Components', 'Motherboard, CPU, RAM, Storage devices, Power supply, Cooling systems', 1),
(1, 'Introduction to Personal Computer Hardware', 1.3, 'Computer Disassembly', 'Safety procedures, Tools required, Step-by-step disassembly process, ESD protection', 1),
(1, 'Introduction to Personal Computer Hardware', 1.4, 'Computer Assembly', 'Component installation order, Cable management, POST testing, BIOS configuration', 1);

-- Module 2: PC Assembly
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(2, 'PC Assembly', 2.1, 'Assembly Preparation', 'Workspace setup, Tools inventory, Component compatibility check, ESD precautions', 1),
(2, 'PC Assembly', 2.2, 'Motherboard Installation', 'CPU installation, Thermal paste application, RAM installation, Motherboard mounting', 1),
(2, 'PC Assembly', 2.3, 'Internal Components', 'Power supply installation, Storage drives, Expansion cards, Front panel connections', 1),
(2, 'PC Assembly', 2.4, 'Cable Management', 'Power cables, Data cables, Cable routing, Airflow optimization', 1),
(2, 'PC Assembly', 2.5, 'POST and BIOS', 'Power-on self-test, BIOS/UEFI configuration, Boot sequence, Hardware monitoring', 1);

-- Module 3: Advanced Computer Hardware
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(3, 'Advanced Computer Hardware', 3.1, 'Power Supplies', 'Voltage rails, Wattage calculation, Efficiency ratings, Modular vs non-modular', 1),
(3, 'Advanced Computer Hardware', 3.2, 'Cooling Systems', 'Air cooling, Liquid cooling, Thermal paste types, Fan configuration', 1),
(3, 'Advanced Computer Hardware', 3.3, 'Storage Technologies', 'SSD vs HDD, NVMe, RAID configurations, Storage benchmarking', 1),
(3, 'Advanced Computer Hardware', 3.4, 'Display Technologies', 'Monitor types, Resolution standards, Refresh rates, Multiple display setup', 1),
(3, 'Advanced Computer Hardware', 3.5, 'Peripheral Devices', 'Input devices, Output devices, KVM switches, Docking stations', 1);

-- Module 4: Preventive Maintenance and Troubleshooting
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(4, 'Preventive Maintenance and Troubleshooting', 4.1, 'Preventive Maintenance', 'Cleaning procedures, Hardware maintenance schedule, Software maintenance, Data backup strategies', 1),
(4, 'Preventive Maintenance and Troubleshooting', 4.2, 'Troubleshooting Methodology', 'Identify the problem, Establish theory, Test theory, Create action plan, Implement solution, Verify functionality, Document findings', 1),
(4, 'Preventive Maintenance and Troubleshooting', 4.3, 'Common Hardware Issues', 'No power, No POST, Overheating, Blue screen errors, Performance issues', 1),
(4, 'Preventive Maintenance and Troubleshooting', 4.4, 'Diagnostic Tools', 'Built-in diagnostics, Third-party tools, Hardware testing equipment, Software utilities', 1);

-- Module 5: Networking Concepts
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(5, 'Networking Concepts', 5.1, 'Network Fundamentals', 'OSI model, TCP/IP model, Network topologies, Bandwidth and throughput', 1),
(5, 'Networking Concepts', 5.2, 'Network Devices', 'Routers, Switches, Hubs, Access Points, Network Interface Cards', 1),
(5, 'Networking Concepts', 5.3, 'Cabling and Connectors', 'Ethernet cables, Fiber optic, Coaxial, Cable standards, Connector types', 1),
(5, 'Networking Concepts', 5.4, 'IP Addressing', 'IPv4 addressing, Subnetting, IPv6 basics, DHCP, DNS concepts', 1);

-- Module 6: Applied Networking
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(6, 'Applied Networking', 6.1, 'Network Configuration', 'IP configuration, Subnet mask, Default gateway, Static vs Dynamic IP', 1),
(6, 'Applied Networking', 6.2, 'Network Services', 'DHCP server, DNS server, File sharing, Printer sharing, Remote desktop', 1),
(6, 'Applied Networking', 6.3, 'Wireless Networking', 'WiFi standards, SSID configuration, Security protocols, Channel selection', 1),
(6, 'Applied Networking', 6.4, 'Network Troubleshooting', 'Ping, Tracert, Nslookup, Ipconfig, Network connectivity issues', 1);

-- Module 7: Laptops and Other Mobile Devices
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(7, 'Laptops and Other Mobile Devices', 7.1, 'Laptop Components', 'Laptop vs Desktop, Internal components, Display types, Battery technology', 1),
(7, 'Laptop Components', 7.2, 'Laptop Maintenance', 'Cleaning procedures, Keyboard replacement, Screen replacement, Battery replacement', 1),
(7, 'Laptop Components', 7.3, 'Mobile Devices', 'Smartphones, Tablets, Wearables, Mobile OS comparison', 1),
(7, 'Laptop Components', 7.4, 'Mobile Device Troubleshooting', 'Common mobile issues, Reset procedures, Data recovery, Security features', 1);

-- Module 8: Printers
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(8, 'Printers', 8.1, 'Printer Types', 'Inkjet, Laser, Thermal, Impact, 3D printers', 1),
(8, 'Printers', 8.2, 'Printer Installation', 'Local installation, Network installation, Driver installation, Print server setup', 1),
(8, 'Printers', 8.3, 'Printer Maintenance', 'Toner replacement, Ink cartridge replacement, Cleaning procedures, Calibration', 1),
(8, 'Printers', 8.4, 'Printer Troubleshooting', 'Paper jams, Print quality issues, Connectivity problems, Error codes', 1);

-- Module 9: Virtualization and Cloud Computing
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(9, 'Virtualization and Cloud Computing', 9.1, 'Virtualization Concepts', 'Hypervisors Type 1 and 2, Virtual machines, Resource allocation, Snapshots', 1),
(9, 'Virtualization and Cloud Computing', 9.2, 'Virtual Machine Setup', 'VMware installation, VirtualBox configuration, Guest OS installation, VM networking', 1),
(9, 'Virtualization and Cloud Computing', 9.3, 'Cloud Computing', 'IaaS, PaaS, SaaS, Public vs Private cloud, Hybrid cloud', 1),
(9, 'Virtualization and Cloud Computing', 9.4, 'Cloud Services', 'AWS basics, Azure fundamentals, Google Cloud, Cloud storage solutions', 1);

-- Module 10: Windows Installation
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(10, 'Windows Installation', 10.1, 'Windows Versions', 'Windows 10, Windows 11, Edition comparison, System requirements', 1),
(10, 'Windows Installation', 10.2, 'Installation Methods', 'Clean install, Upgrade, Dual boot, USB installation media creation', 1),
(10, 'Windows Installation', 10.3, 'Post-Installation', 'Driver installation, Windows updates, Activation, User account setup', 1),
(10, 'Windows Installation', 10.4, 'Disk Management', 'Partitioning, Formatting, Disk cleanup, Defragmentation, Storage spaces', 1);

-- Module 11: Windows Configuration
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(11, 'Windows Configuration', 11.1, 'Control Panel', 'System settings, Device manager, Programs and features, Power options', 1),
(11, 'Windows Configuration', 11.2, 'User Management', 'Local users, Microsoft accounts, User groups, Permissions, UAC', 1),
(11, 'Windows Configuration', 11.3, 'System Tools', 'Task manager, Event viewer, Performance monitor, System configuration', 1),
(11, 'Windows Configuration', 11.4, 'Security Features', 'Windows Defender, Firewall, BitLocker, Windows Hello, Updates', 1);

-- Module 12: Mobile, Linux, and macOS Operating Systems
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(12, 'Mobile, Linux, and macOS Operating Systems', 12.1, 'Mobile Operating Systems', 'Android OS, iOS, Mobile OS features, Mobile security', 1),
(12, 'Mobile, Linux, and macOS Operating Systems', 12.2, 'Linux Introduction', 'Linux distributions, Installation, Command line basics, File system structure', 1),
(12, 'Mobile, Linux, and macOS Operating Systems', 12.3, 'Linux Administration', 'User management, Package management, File permissions, Process management', 1),
(12, 'Mobile, Linux, and macOS Operating Systems', 12.4, 'macOS Features', 'macOS interface, System preferences, Time Machine, Boot Camp', 1);

-- Module 13: Security
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(13, 'Security', 13.1, 'Security Threats', 'Malware types, Social engineering, Network attacks, Physical security threats', 1),
(13, 'Security', 13.2, 'Security Procedures', 'Security policies, Access control, Authentication methods, Encryption', 1),
(13, 'Security', 13.3, 'Security Tools', 'Antivirus software, Firewalls, IDS/IPS, Vulnerability scanners', 1),
(13, 'Security', 13.4, 'Data Protection', 'Backup strategies, Data encryption, Secure disposal, Incident response', 1);

-- Module 14: The IT Professional
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(14, 'The IT Professional', 14.1, 'Communication Skills', 'Professional communication, Customer service, Technical documentation, Active listening', 1),
(14, 'The IT Professional', 14.2, 'Ethical and Legal Issues', 'Code of ethics, Data privacy, Intellectual property, Regulatory compliance', 1),
(14, 'The IT Professional', 14.3, 'Call Center Operations', 'Ticketing systems, SLA management, Escalation procedures, Remote support tools', 1),
(14, 'The IT Professional', 14.4, 'Career Planning', 'IT certifications, Resume building, Interview skills, Professional networking', 1);

-- ============================================
-- CLASSES SCHEDULED
-- ============================================
INSERT INTO classes_scheduled (class_type, stream, centre_id, date, start_time, end_time, module_number, module_name, topics, instructor_id, status, notes) VALUES
('cisco', 'Love', 1, '2024-03-20', '08:00', '12:00', 4, 'Preventive Maintenance and Troubleshooting', 'Troubleshooting methodology, Diagnostic tools', 5, 'completed', 'Good session'),
('cisco', 'Joy', 1, '2024-03-20', '13:00', '17:00', 4, 'Preventive Maintenance and Troubleshooting', 'Common hardware issues, Preventive maintenance schedule', 5, 'completed', ''),
('cisco', 'Love', 1, '2024-03-21', '08:00', '12:00', 5, 'Networking Concepts', 'Network fundamentals, OSI model', 5, 'scheduled', 'Prepare network cables for demo'),
('cisco', 'Joy', 1, '2024-03-21', '13:00', '17:00', 5, 'Networking Concepts', 'Network devices, IP addressing', 6, 'scheduled', ''),
('extra', 'All Streams', 1, '2024-03-22', '08:00', '12:00', NULL, 'Extra Practice', 'Hands-on lab session for struggling students', 5, 'scheduled', 'Focus on Module 4 practical'),
('cisco', 'Love', 2, '2024-03-20', '08:00', '12:00', 4, 'Preventive Maintenance and Troubleshooting', 'Troubleshooting methodology', 7, 'completed', ''),
('cisco', 'Love', 3, '2024-03-20', '08:00', '12:00', 4, 'Preventive Maintenance and Troubleshooting', 'Preventive maintenance procedures', 8, 'completed', '');

-- ============================================
-- CLASS EVIDENCE PHOTOS
-- ============================================
INSERT INTO class_evidence_photos (class_id, photo_type, photo_url, caption) VALUES
(1, 'before', '/uploads/evidence/before_class_20240320.jpg', 'Lab setup before Love stream class'),
(1, 'during', '/uploads/evidence/during_class_20240320.jpg', 'Students working on troubleshooting exercise'),
(1, 'after', '/uploads/evidence/after_class_20240320.jpg', 'Completed lab work and cleaned workstations');

-- ============================================
-- INTERVENTIONS
-- ============================================
INSERT INTO interventions (student_id, type, description, status, priority, created_by, date_initiated, date_resolved, resolution_notes) VALUES
(5, 'Academic Support', 'Student struggling with Module 3 and 4, scores below 50%', 'in-progress', 'high', 5, '2024-03-01', NULL, 'Scheduled extra tutoring sessions'),
(7, 'Mentorship', 'Student needs guidance on study techniques', 'open', 'medium', 5, '2024-03-15', NULL, NULL),
(9, 'Recognition', 'Outstanding performance across all modules', 'resolved', 'low', 5, '2024-02-20', '2024-03-01', 'Awarded certificate of excellence');

-- ============================================
-- STUDENT FEEDBACK
-- ============================================
INSERT INTO student_feedback (student_id, category, feedback_text, given_by, date_given) VALUES
(1, 'Progress', 'Alice is showing excellent progress in practical sessions', 5, '2024-02-15'),
(5, 'Concern', 'Emily needs additional support with hardware concepts', 5, '2024-02-28'),
(9, 'Achievement', 'Irene is the top performer in her stream, consistently scoring above 90%', 5, '2024-03-01'),
(3, 'Attendance', 'Carol has perfect attendance and always arrives on time', 5, '2024-03-10');

-- ============================================
-- DAILY REPORTS
-- ============================================
INSERT INTO daily_reports (date, centre_id, streams, topics_covered, engagement_level, challenges, next_steps, status, submitted_by) VALUES
('2024-03-19', 1, ARRAY['Love', 'Joy'], 'Module 4: Troubleshooting methodology and diagnostic tools', 4, 'Some students struggled with systematic approach to troubleshooting', 'Review troubleshooting steps with struggling students', 'submitted', 5),
('2024-03-20', 1, ARRAY['Love', 'Joy'], 'Module 4: Common hardware issues and preventive maintenance', 5, 'Power outage interrupted session for 30 minutes', 'Prepare for Module 5: Networking Concepts', 'draft', 5);

-- ============================================
-- WEEKLY REPORTS
-- ============================================
INSERT INTO weekly_reports (week_start_date, week_end_date, centre_id, netacad_update, lab_update, centre_update, challenges, recommendations, status, submitted_by) VALUES
('2024-03-11', '2024-03-17', 1, 'All students completed Module 3 online assessments', 'Lab equipment functioning well, 90% workstation availability', 'Centre operations running smoothly', 'Network instability on Wednesday affected online tests', 'Install backup internet connection', 'submitted', 5);

-- ============================================
-- NOTIFICATION PREFERENCES
-- ============================================
INSERT INTO notification_preferences (user_id, email_reminders, weekly_report_reminder, maintenance_alerts, uaf_expiry_reminders, student_at_risk_alerts) VALUES
(1, TRUE, TRUE, TRUE, TRUE, TRUE),
(2, TRUE, TRUE, TRUE, TRUE, TRUE),
(3, TRUE, TRUE, TRUE, TRUE, TRUE),
(4, TRUE, TRUE, TRUE, TRUE, TRUE),
(5, TRUE, TRUE, TRUE, TRUE, TRUE),
(6, TRUE, TRUE, TRUE, TRUE, TRUE),
(7, TRUE, TRUE, TRUE, TRUE, TRUE),
(8, TRUE, TRUE, TRUE, TRUE, TRUE);

-- ============================================
-- SYSTEM SETTINGS
-- ============================================
INSERT INTO system_settings (user_id, language, theme, timezone) VALUES
(1, 'en', 'light', 'Africa/Nairobi'),
(2, 'en', 'light', 'Africa/Nairobi'),
(3, 'en', 'light', 'Africa/Nairobi'),
(4, 'en', 'light', 'Africa/Nairobi'),
(5, 'en', 'light', 'Africa/Nairobi'),
(6, 'en', 'light', 'Africa/Nairobi'),
(7, 'en', 'light', 'Africa/Nairobi'),
(8, 'en', 'light', 'Africa/Nairobi');

-- ============================================
-- INNOVATION LOG
-- ============================================
INSERT INTO innovation_log (centre_id, term, methodology_name, description, documented_impact, performance_before, performance_after, shared_with_manager, endorsement_received, created_by) VALUES
(1, 1, 'Peer-to-Peer Learning Circles', 'Created small study groups where advanced students mentor struggling peers during Saturday intensives', 'Improved average scores by 15% in Module 3 compared to previous cohort', 65.50, 80.50, TRUE, TRUE, 5),
(1, 1, 'Gamified Lab Challenges', 'Introduced competitive lab exercises with points and rewards for fastest correct assembly and troubleshooting', 'Increased student engagement and practical skills completion rate from 70% to 95%', 70.00, 95.00, TRUE, FALSE, 6);
