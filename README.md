# Student Campus Navigator - Presidency University Bengaluru

A full-stack campus navigation system built for **Presidency University, Bengaluru (Rajanakunte)** (`13.1682° N, 77.5354° E`).

The platform allows students, faculty, and visitors to interactively explore campus buildings, search locations, view photos & specifications, locate their current GPS position, and calculate the shortest walking routes using a custom **A\* pathfinding algorithm**.

---

## 🏗 Architecture & Technologies

### Frontend
- **Framework:** React 18 + Vite
- **Interactive Map Engine:** Leaflet + React-Leaflet
- **Base Tile Layer:** OpenStreetMap
- **Icons & Styling:** Lucide-React + Glassmorphism Dark CSS Design System
- **Client Pathfinder:** A* Pathfinder Engine with Haversine Heuristic (`src/utils/aStarPathfinder.js`)

### Backend
- **Framework:** Java 17 + Spring Boot 3.2.4
- **Database Persistence:** Spring Data JPA + Hibernate
- **Database Engine:** MySQL 8.4 LTS (configured in `application.properties`)
- **Routing Engine:** Graph-based Java A* Pathfinder (`com.campusnavigator.navigation.AStarPathfinder`)

---

## 📁 Project Structure

```text
D:\PresidencyMAP\
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/             # Leaflet Map Container & Custom DivIcon Markers
│   │   │   ├── Search/          # Autocomplete Search Bar & Category Filter Pills
│   │   │   ├── Building/        # Building Details Side Panel
│   │   │   └── Navigation/      # Route Pathfinder Panel & Turn-by-Turn Steps
│   │   ├── data/
│   │   │   └── presidencyData.js# Presidency University Campus Buildings, Nodes & Edges
│   │   ├── utils/
│   │   │   └── aStarPathfinder.js # Client-side A* Shortest Path & Distance Utilities
│   │   ├── App.jsx
│   │   └── index.css            # Glassmorphism & Leaflet Map Theme
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/main/java/com/campusnavigator/
│   │   ├── controller/          # REST Controllers (/api/buildings, /api/navigation)
│   │   ├── entity/              # JPA Entities (Building, NavigationNode, NavigationEdge)
│   │   ├── repository/          # Spring Data JPA Repositories
│   │   ├── navigation/          # Java A* Pathfinder Engine
│   │   └── config/              # CORS Configuration
│   ├── src/main/resources/
│   │   ├── application.properties # MySQL & Hibernate Configuration
│   │   └── data.sql             # SQL Seed Script for Presidency University Campus
│   └── pom.xml
│
├── run-frontend.bat             # Batch launcher for Frontend
└── run-backend.bat              # Batch launcher for Backend
```

---

## 🚀 Running the Project

### 1. Launching the Frontend
Double-click `run-frontend.bat` or run:
```bash
cd D:\PresidencyMAP\frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. Launching the Backend (Spring Boot + MySQL)
1. Ensure MySQL Server is running locally. Create database `presidency_campus_db` (or allow Spring Boot to create it automatically).
2. Double-click `run-backend.bat` or run:
```bash
cd D:\PresidencyMAP\backend
mvn spring-boot:run
```
The REST API will start at `http://localhost:8080`.

---

## 🏛 Pre-Configured Campus Buildings

1. **Main Entrance Gate** (`GATE-1`) - Security Checkpoint & Visitor Registration
2. **Administrative Block** (`ADMIN-BLK`) - Chancellery, Admissions Desk, Student Accounts
3. **School of Engineering (Block A)** (`ENGG-BLK-A`) - Computer Science (CSE), AI & Data Science
4. **School of Engineering (Block B)** (`ENGG-BLK-B`) - Mechanical, Civil, ECE & Workshops
5. **School of Management & Commerce** (`SOM-BLK`) - MBA, BBA & Incubation Center
6. **Central Library & Resource Center** (`LIB-CENTRAL`) - Multi-floor Digital Library & Study Pods
7. **Central Food Court & Canteen** (`FOOD-COURT`) - Multi-cuisine Dining & Outdoor Courtyard
8. **Sports Complex & Athletics Arena** (`SPORTS-ARENA`) - Synthetic Turf, Basketball & Indoor Gym
9. **Presidency Student Hostels** (`HOSTEL-BLOCKS`) - Student Living Quarters & Wi-Fi Lounge
10. **Campus Medical Center** (`HEALTH-CTR`) - 24/7 First Aid Post & Emergency Ambulance

---

## 🗺 A* Pathfinding Logic

The A* pathfinding algorithm evaluates graph nodes using:
$$f(n) = g(n) + h(n)$$
* $g(n)$: Actual walking cost from start node to current node $n$ (incorporating distance penalties for stairs or non-accessible paths).
* $h(n)$: Haversine straight-line distance heuristic from node $n$ to target destination.

Features included:
- **Avoid Stairs:** Filters out stair pathways for step-free walking routes.
- **Wheelchair Accessible:** Restricts pathfinding exclusively to accessible ramps/paved roads.
