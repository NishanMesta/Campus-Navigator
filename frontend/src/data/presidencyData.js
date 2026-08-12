// Campus data for Presidency University Bengaluru (Rajanakunte)
// Coordinates center: [13.1682, 77.5354]

export const CAMPUS_CENTER = [13.1682, 77.5354];
export const CAMPUS_ZOOM = 17;

export const CATEGORIES = [
  { id: 'ALL', label: 'All Places', icon: 'Compass' },
  { id: 'ACADEMIC', label: 'Academic Blocks', icon: 'GraduationCap' },
  { id: 'LIBRARY', label: 'Library', icon: 'BookOpen' },
  { id: 'CANTEEN', label: 'Food & Dining', icon: 'Utensils' },
  { id: 'SPORTS', label: 'Sports Complex', icon: 'Trophy' },
  { id: 'ADMIN', label: 'Administration', icon: 'Building2' },
  { id: 'HOSTEL', label: 'Hostels', icon: 'Home' },
  { id: 'MEDICAL', label: 'Medical & First Aid', icon: 'Cross' }
];

export const BUILDINGS = [
  {
    id: 1,
    name: 'Main Entrance Gate',
    code: 'GATE-1',
    category: 'ADMIN',
    latitude: 13.166800,
    longitude: 77.534200,
    description: 'Primary security checkpoint and visitor registration area for Presidency University.',
    imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
    facilities: ['Visitor Registration', 'Security Post', 'Auto/Taxi Stand', 'ATM Point'],
    nearestNodeId: 1
  },
  {
    id: 2,
    name: 'Administrative Block',
    code: 'ADMIN-BLK',
    category: 'ADMIN',
    latitude: 13.167500,
    longitude: 77.534800,
    description: 'Chancellery, Registrar Office, Admissions Desk, Student Accounts, and Placement Cell.',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    facilities: ['Admissions Desk', 'Accounts Counter', 'Vice-Chancellor Office', 'Conference Hall'],
    nearestNodeId: 2
  },
  {
    id: 3,
    name: 'School of Engineering (Block A)',
    code: 'ENGG-BLK-A',
    category: 'ACADEMIC',
    latitude: 13.168500,
    longitude: 77.535200,
    description: 'Houses Computer Science (CSE), AI & Data Science labs, Robotics Hub, and Faculty Cabins.',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    facilities: ['Computer Labs 1-8', 'AI Research Lab', 'Robotics Center', 'Smart Classrooms'],
    nearestNodeId: 4
  },
  {
    id: 4,
    name: 'School of Engineering (Block B)',
    code: 'ENGG-BLK-B',
    category: 'ACADEMIC',
    latitude: 13.169000,
    longitude: 77.535800,
    description: 'Mechanical, Civil, and Electronics & Communication Engineering departments and heavy workshops.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    facilities: ['Mechanical Workshop', 'VLSI Design Lab', 'CAD/CAM Studio', 'Department Auditorium'],
    nearestNodeId: 5
  },
  {
    id: 5,
    name: 'School of Management & Commerce',
    code: 'SOM-BLK',
    category: 'ACADEMIC',
    latitude: 13.168000,
    longitude: 77.536200,
    description: 'MBA, BBA, Commerce classrooms, Incubation Center, and Corporate Training Rooms.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    facilities: ['Bloomberg Lab', 'Incubation Cell', 'Executive Seminar Room', 'Group Discussion Pods'],
    nearestNodeId: 6
  },
  {
    id: 6,
    name: 'Central Library & Resource Center',
    code: 'LIB-CENTRAL',
    category: 'LIBRARY',
    latitude: 13.168800,
    longitude: 77.536600,
    description: 'Multi-floor central library with digital access terminals, silent study pods, and research archives.',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    facilities: ['Digital Library', 'Silent Reading Zone', 'Journal Archives', 'Photocopy & Printing Center'],
    nearestNodeId: 7
  },
  {
    id: 7,
    name: 'Central Food Court & Canteen',
    code: 'FOOD-COURT',
    category: 'CANTEEN',
    latitude: 13.167800,
    longitude: 77.535500,
    description: 'Vibrant dining area serving multi-cuisine food, juice center, bakery, and outdoor courtyard seating.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    facilities: ['South Indian Counter', 'North Indian Thali', 'Juice Bar', 'Nescafe Booth'],
    nearestNodeId: 3
  },
  {
    id: 8,
    name: 'Sports Complex & Athletics Arena',
    code: 'SPORTS-ARENA',
    category: 'SPORTS',
    latitude: 13.169500,
    longitude: 77.534500,
    description: 'Includes Football pitch, Cricket nets, Basketball court, Badminton courts, and indoor gym.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    facilities: ['Synthetic Turf', 'Basketball Court', 'Fitness Gym', 'Table Tennis Room'],
    nearestNodeId: 8
  },
  {
    id: 9,
    name: 'Presidency Student Hostels',
    code: 'HOSTEL-BLOCKS',
    category: 'HOSTEL',
    latitude: 13.170000,
    longitude: 77.536000,
    description: 'Residential quarters for outstation students featuring high-speed Wi-Fi, laundry, and recreation lounge.',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    facilities: ['Resident Warden', 'Wi-Fi Lounge', 'Laundry Service', 'Study Room'],
    nearestNodeId: 9
  },
  {
    id: 10,
    name: 'Campus Medical Center',
    code: 'HEALTH-CTR',
    category: 'MEDICAL',
    latitude: 13.167200,
    longitude: 77.535000,
    description: '24/7 First aid and emergency health post with resident medical nurse and ambulance access.',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    facilities: ['24/7 Doctor on Call', 'Emergency Ambulance', 'Pharmacy Supply', 'Observation Bed'],
    nearestNodeId: 10
  }
];

// Graph Nodes for Pathfinding
export const NAVIGATION_NODES = [
  { id: 1, name: 'Main Gate Entrance', latitude: 13.166800, longitude: 77.534200, type: 'GATE' },
  { id: 2, name: 'Admin Junction', latitude: 13.167500, longitude: 77.534800, type: 'JUNCTION' },
  { id: 3, name: 'Canteen Courtyard', latitude: 13.167800, longitude: 77.535500, type: 'JUNCTION' },
  { id: 4, name: 'Engineering Block A Entrance', latitude: 13.168500, longitude: 77.535200, type: 'ENTRANCE' },
  { id: 5, name: 'Engineering Block B Entrance', latitude: 13.169000, longitude: 77.535800, type: 'ENTRANCE' },
  { id: 6, name: 'Management Block Entrance', latitude: 13.168000, longitude: 77.536200, type: 'ENTRANCE' },
  { id: 7, name: 'Library Plaza', latitude: 13.168800, longitude: 77.536600, type: 'ENTRANCE' },
  { id: 8, name: 'Sports Complex Entrance', latitude: 13.169500, longitude: 77.534500, type: 'ENTRANCE' },
  { id: 9, name: 'Hostels Pathway', latitude: 13.170000, longitude: 77.536000, type: 'JUNCTION' },
  { id: 10, name: 'Medical Post', latitude: 13.167200, longitude: 77.535000, type: 'ENTRANCE' }
];

// Graph Edges (Connections between nodes with weights)
export const NAVIGATION_EDGES = [
  { id: 1, from: 1, to: 2, distance: 100, walkable: true, accessible: true, stairs: false, pathType: 'MAIN_PAVED' },
  { id: 2, from: 2, to: 10, distance: 40, walkable: true, accessible: true, stairs: false, pathType: 'PAVED' },
  { id: 3, from: 2, to: 3, distance: 90, walkable: true, accessible: true, stairs: false, pathType: 'MAIN_PAVED' },
  { id: 4, from: 3, to: 4, distance: 85, walkable: true, accessible: true, stairs: false, pathType: 'PAVED' },
  { id: 5, from: 3, to: 6, distance: 75, walkable: true, accessible: true, stairs: false, pathType: 'PAVED' },
  { id: 6, from: 4, to: 5, distance: 80, walkable: true, accessible: true, stairs: false, pathType: 'PAVED' },
  { id: 7, from: 4, to: 8, distance: 120, walkable: true, accessible: true, stairs: false, pathType: 'PAVED' },
  { id: 8, from: 5, to: 7, distance: 95, walkable: true, accessible: true, stairs: false, pathType: 'PAVED' },
  { id: 9, from: 6, to: 7, distance: 90, walkable: true, accessible: false, stairs: true, pathType: 'STAIRS_SHORTCUT' },
  { id: 10, from: 5, to: 9, distance: 110, walkable: true, accessible: true, stairs: false, pathType: 'PAVED' },
  { id: 11, from: 7, to: 9, distance: 130, walkable: true, accessible: true, stairs: false, pathType: 'PAVED' },
  { id: 12, from: 8, to: 5, distance: 140, walkable: true, accessible: true, stairs: false, pathType: 'PAVED' }
];
