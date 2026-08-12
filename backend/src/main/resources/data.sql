-- Initial Seed Data for Presidency University Bengaluru Campus
INSERT IGNORE INTO buildings (id, name, code, category, latitude, longitude, description, image_url, facilities) VALUES
(1, 'Main Entrance Gate', 'GATE-1', 'ADMIN', 13.166800, 77.534200, 'Primary security checkpoint and visitor registration area for Presidency University.', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80', 'Visitor Registration, Security Post, ATM Point'),
(2, 'Administrative Block', 'ADMIN-BLK', 'ADMIN', 13.167500, 77.534800, 'Chancellery, Registrar Office, Admissions Desk, Student Accounts, and Placement Cell.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', 'Admissions Desk, Accounts Counter, Vice-Chancellor Office'),
(3, 'School of Engineering (Block A)', 'ENGG-BLK-A', 'ACADEMIC', 13.168500, 77.535200, 'Houses Computer Science (CSE), AI & Data Science labs, Robotics Hub, and Faculty Cabins.', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80', 'Computer Labs 1-8, AI Research Lab, Robotics Center'),
(4, 'School of Engineering (Block B)', 'ENGG-BLK-B', 'ACADEMIC', 13.169000, 77.535800, 'Mechanical, Civil, and Electronics & Communication Engineering departments and heavy workshops.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', 'Mechanical Workshop, VLSI Design Lab, CAD Studio'),
(5, 'School of Management & Commerce', 'SOM-BLK', 'ACADEMIC', 13.168000, 77.536200, 'MBA, BBA, Commerce classrooms, Incubation Center, and Corporate Training Rooms.', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', 'Bloomberg Lab, Incubation Cell, Seminar Room'),
(6, 'Central Library & Resource Center', 'LIB-CENTRAL', 'LIBRARY', 13.168800, 77.536600, 'Multi-floor central library with digital access terminals, silent study pods, and research archives.', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80', 'Digital Library, Silent Reading Zone, Archives'),
(7, 'Central Food Court & Canteen', 'FOOD-COURT', 'CANTEEN', 13.167800, 77.535500, 'Vibrant dining area serving multi-cuisine food, juice center, bakery, and outdoor courtyard seating.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', 'South Indian, North Indian, Juice Bar, Bakery'),
(8, 'Sports Complex & Athletics Arena', 'SPORTS-ARENA', 'SPORTS', 13.169500, 77.534500, 'Includes Football pitch, Cricket nets, Basketball court, Badminton courts, and indoor gym.', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', 'Synthetic Turf, Basketball Court, Fitness Gym'),
(9, 'Presidency Student Hostels', 'HOSTEL-BLOCKS', 'HOSTEL', 13.170000, 77.536000, 'Residential quarters for outstation students featuring high-speed Wi-Fi, laundry, and recreation lounge.', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80', 'Resident Warden, Wi-Fi Lounge, Laundry Service'),
(10, 'Campus Medical Center', 'HEALTH-CTR', 'MEDICAL', 13.167200, 77.535000, '24/7 First aid and emergency health post with resident medical nurse and ambulance access.', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80', '24/7 Doctor, Ambulance, Pharmacy');

INSERT IGNORE INTO navigation_nodes (id, name, latitude, longitude, node_type) VALUES
(1, 'Main Gate Entrance', 13.166800, 77.534200, 'GATE'),
(2, 'Admin Junction', 13.167500, 77.534800, 'JUNCTION'),
(3, 'Canteen Courtyard', 13.167800, 77.535500, 'JUNCTION'),
(4, 'Engineering Block A Entrance', 13.168500, 77.535200, 'ENTRANCE'),
(5, 'Engineering Block B Entrance', 13.169000, 77.535800, 'ENTRANCE'),
(6, 'Management Block Entrance', 13.168000, 77.536200, 'ENTRANCE'),
(7, 'Library Plaza', 13.168800, 77.536600, 'ENTRANCE'),
(8, 'Sports Complex Entrance', 13.169500, 77.534500, 'ENTRANCE'),
(9, 'Hostels Pathway', 13.170000, 77.536000, 'JUNCTION'),
(10, 'Medical Post', 13.167200, 77.535000, 'ENTRANCE');

INSERT IGNORE INTO navigation_edges (id, from_node_id, to_node_id, distance_meters, walkable, accessible, stairs, path_type) VALUES
(1, 1, 2, 100.0, true, true, false, 'MAIN_PAVED'),
(2, 2, 10, 40.0, true, true, false, 'PAVED'),
(3, 2, 3, 90.0, true, true, false, 'MAIN_PAVED'),
(4, 3, 4, 85.0, true, true, false, 'PAVED'),
(5, 3, 6, 75.0, true, true, false, 'PAVED'),
(6, 4, 5, 80.0, true, true, false, 'PAVED'),
(7, 4, 8, 120.0, true, true, false, 'PAVED'),
(8, 5, 7, 95.0, true, true, false, 'PAVED'),
(9, 6, 7, 90.0, true, false, true, 'STAIRS_SHORTCUT'),
(10, 5, 9, 110.0, true, true, false, 'PAVED'),
(11, 7, 9, 130.0, true, true, false, 'PAVED'),
(12, 8, 5, 140.0, true, true, false, 'PAVED');
