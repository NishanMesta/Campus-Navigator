import React, { useState, useEffect, useMemo } from 'react';
import CampusMap from './components/Map/CampusMap';
import SearchBar from './components/Search/SearchBar';
import PlaceSidebar from './components/Navigation/PlaceSidebar';
import BuildingSidePanel from './components/Building/BuildingSidePanel';
import NavigationPanel from './components/Navigation/NavigationPanel';
import NodeInspector from './components/Admin/NodeInspector';
import { BUILDINGS as INITIAL_BUILDINGS, NAVIGATION_NODES as INITIAL_NODES, NAVIGATION_EDGES as INITIAL_EDGES } from './data/presidencyData';
import { findNearestNode, findShortestPath } from './utils/aStarPathfinder';
import { Locate, Crosshair } from 'lucide-react';
import logo from './assets/logo.png';

export default function App() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Buildings / Locations State with LocalStorage persistence
  const [buildings, setBuildings] = useState(() => {
    const saved = localStorage.getItem('presidency_buildings');
    return saved ? JSON.parse(saved) : INITIAL_BUILDINGS;
  });

  useEffect(() => {
    localStorage.setItem('presidency_buildings', JSON.stringify(buildings));
  }, [buildings]);

  // Custom Graph Nodes & Edges State with LocalStorage persistence
  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem('presidency_nodes');
    return saved ? JSON.parse(saved) : INITIAL_NODES;
  });

  const [edges, setEdges] = useState(() => {
    const saved = localStorage.getItem('presidency_edges');
    return saved ? JSON.parse(saved) : INITIAL_EDGES;
  });

  useEffect(() => {
    localStorage.setItem('presidency_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('presidency_edges', JSON.stringify(edges));
  }, [edges]);

  // Merge default/custom buildings with user-created graph nodes for complete location coverage
  const allPlaces = useMemo(() => {
    const customPlaces = nodes
      .filter(n => n.type !== 'WAYPOINT' && !buildings.some(b => b.nearestNodeId === n.id || b.id === n.id))
      .map(n => ({
        id: `custom-${n.id}`,
        name: n.name,
        code: `LOC-${n.id}`,
        category: n.type || 'LOCATION',
        latitude: n.latitude,
        longitude: n.longitude,
        description: `Campus location point at Lat: ${n.latitude.toFixed(6)}, Lng: ${n.longitude.toFixed(6)}.`,
        imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
        facilities: ['Campus Point', 'Walkway Connector'],
        nearestNodeId: n.id
      }));
    return [...buildings, ...customPlaces];
  }, [buildings, nodes]);

  // Path Connection Node Selection State
  const [selectedFromNode, setSelectedFromNode] = useState(null);
  const [selectedToNode, setSelectedToNode] = useState(null);

  // Inspector Mode State
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const [clickedLatLng, setClickedLatLng] = useState(null);

  // User GPS Location
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Navigation State
  const [isNavigating, setIsNavigating] = useState(false);
  const [originId, setOriginId] = useState('GPS');
  const [destinationId, setDestinationId] = useState(null);
  const [navOptions, setNavOptions] = useState({ avoidStairs: false, wheelchairOnly: false });
  const [routeResult, setRouteResult] = useState(null);

  useEffect(() => { handleLocateUser(); }, []);

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); setIsLocating(false); },
        () => { setUserLocation({ latitude: 13.166800, longitude: 77.534200 }); setIsLocating(false); },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleStartNavigationTo = (building) => {
    setDestinationId(building.id);
    setIsNavigating(true);
    setSelectedBuilding(null);
  };

  // Building / Location Handlers
  const handleMoveBuilding = (buildingId, newLat, newLng) => {
    setBuildings(prev => prev.map(b =>
      b.id === buildingId ? { ...b, latitude: newLat, longitude: newLng } : b
    ));

    // Update selected building if currently active
    if (selectedBuilding && selectedBuilding.id === buildingId) {
      setSelectedBuilding(prev => prev ? { ...prev, latitude: newLat, longitude: newLng } : null);
    }

    // Sync nearest node position if linked
    const targetBuilding = buildings.find(b => b.id === buildingId);
    if (targetBuilding && targetBuilding.nearestNodeId) {
      handleMoveNode(targetBuilding.nearestNodeId, newLat, newLng);
    } else if (typeof buildingId === 'string' && buildingId.startsWith('custom-')) {
      const nodeId = parseInt(buildingId.replace('custom-', ''));
      handleMoveNode(nodeId, newLat, newLng);
    }
  };

  const handleEditBuilding = (buildingId, updatedData) => {
    setBuildings(prev => prev.map(b =>
      b.id === buildingId ? { ...b, ...updatedData } : b
    ));

    if (selectedBuilding && selectedBuilding.id === buildingId) {
      setSelectedBuilding(prev => prev ? { ...prev, ...updatedData } : null);
    }

    if (updatedData.latitude && updatedData.longitude) {
      const targetBuilding = buildings.find(b => b.id === buildingId);
      if (targetBuilding && targetBuilding.nearestNodeId) {
        handleMoveNode(targetBuilding.nearestNodeId, updatedData.latitude, updatedData.longitude);
      }
    }
  };

  const handleDeleteBuilding = (buildingId) => {
    const targetBuilding = buildings.find(b => b.id === buildingId);
    setBuildings(prev => prev.filter(b => b.id !== buildingId));

    if (selectedBuilding && selectedBuilding.id === buildingId) {
      setSelectedBuilding(null);
    }

    if (targetBuilding && targetBuilding.nearestNodeId) {
      handleDeleteNode(targetBuilding.nearestNodeId);
    } else if (typeof buildingId === 'string' && buildingId.startsWith('custom-')) {
      const nodeId = parseInt(buildingId.replace('custom-', ''));
      handleDeleteNode(nodeId);
    }
  };

  // Node & Edge Handlers
  const handleAddNode = (newNode) => {
    setNodes(prev => [...prev, newNode]);

    // If node is an Entrance/Gate/Junction, auto-add as a Place building too
    if (newNode.type !== 'WAYPOINT') {
      const newBuilding = {
        id: `b-${newNode.id}`,
        name: newNode.name,
        code: `GATE-${newNode.id}`,
        category: newNode.type || 'ADMIN',
        latitude: newNode.latitude,
        longitude: newNode.longitude,
        description: `Campus location ${newNode.name} added at Lat: ${newNode.latitude.toFixed(6)}, Lng: ${newNode.longitude.toFixed(6)}.`,
        imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
        facilities: ['Entrance Access', 'Campus Checkpoint'],
        nearestNodeId: newNode.id
      };
      setBuildings(prev => [...prev, newBuilding]);
    }
  };

  const handleAddEdge = (newEdge) => setEdges(prev => [...prev, newEdge]);

  const handleMoveNode = (nodeId, newLat, newLng) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, latitude: newLat, longitude: newLng } : n
    ));
  };

  const handleDeleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
    if (selectedFromNode && selectedFromNode.id === nodeId) setSelectedFromNode(null);
    if (selectedToNode && selectedToNode.id === nodeId) setSelectedToNode(null);
  };

  const handleDeleteEdge = (edgeId) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
  };

  const handleClearAllData = () => {
    setNodes([]);
    setEdges([]);
    setBuildings([]);
    setSelectedBuilding(null);
    setSelectedFromNode(null);
    setSelectedToNode(null);
    localStorage.removeItem('presidency_nodes');
    localStorage.removeItem('presidency_edges');
    localStorage.removeItem('presidency_buildings');
  };

  const handleResetDefaultData = () => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setBuildings(INITIAL_BUILDINGS);
    localStorage.setItem('presidency_nodes', JSON.stringify(INITIAL_NODES));
    localStorage.setItem('presidency_edges', JSON.stringify(INITIAL_EDGES));
    localStorage.setItem('presidency_buildings', JSON.stringify(INITIAL_BUILDINGS));
  };

  const handleSelectGraphNode = (node, explicitType = null) => {
    if (explicitType === 'FROM') {
      setSelectedFromNode(node);
    } else if (explicitType === 'TO') {
      setSelectedToNode(node);
    } else {
      if (!selectedFromNode) { setSelectedFromNode(node); }
      else if (!selectedToNode && selectedFromNode.id !== node.id) { setSelectedToNode(node); }
      else { setSelectedFromNode(node); setSelectedToNode(null); }
    }
  };

  const handleResetSelectedNodes = () => {
    setSelectedFromNode(null);
    setSelectedToNode(null);
  };

  useEffect(() => {
    if (!isNavigating || !destinationId) { setRouteResult(null); return; }

    let startNodeId = 1;
    if (originId === 'GPS') {
      if (userLocation) {
        const nearest = findNearestNode(userLocation.latitude, userLocation.longitude, nodes);
        if (nearest.node) startNodeId = nearest.node.id;
      }
    } else {
      const origBuilding = allPlaces.find(b => b.id === originId);
      if (origBuilding) startNodeId = origBuilding.nearestNodeId || origBuilding.id;
    }

    const destBuilding = allPlaces.find(b => b.id === destinationId);
    if (!destBuilding) return;

    const targetNodeId = destBuilding.nearestNodeId || destBuilding.id;
    const pathResult = findShortestPath(startNodeId, targetNodeId, nodes, edges, navOptions);
    setRouteResult(pathResult);
  }, [isNavigating, originId, destinationId, navOptions, userLocation, nodes, edges, allPlaces]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', width: '100%' }}>
          {/* Brand Header with Presidency Logo */}
          <div className="glass-panel" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', borderRadius: '16px' }}>
            <img src={logo} alt="Presidency University Logo" style={{ height: '36px', objectFit: 'contain' }} />
          </div>

          {/* Search */}
          <div style={{ pointerEvents: 'auto', flex: 1, display: 'flex', justifyContent: 'center' }}>
            <SearchBar buildings={allPlaces} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelectBuilding={(b) => setSelectedBuilding(b)} />
          </div>

          {/* Buttons */}
          <div style={{ pointerEvents: 'auto', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setIsInspectorActive(!isInspectorActive); setClickedLatLng(null); handleResetSelectedNodes(); }}
              className="glass-panel"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '16px',
                color: isInspectorActive ? '#f59e0b' : '#94a3b8',
                border: isInspectorActive ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
                background: isInspectorActive ? 'rgba(245,158,11,0.2)' : 'rgba(30,41,59,0.85)',
                cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'
              }}
            >
              <Crosshair size={18} /> {isInspectorActive ? 'Inspector ON' : 'Inspect Coords'}
            </button>

            <button onClick={handleLocateUser} className="glass-panel"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '16px', color: userLocation ? '#38bdf8' : '#94a3b8', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              <Locate size={18} /> {isLocating ? 'Locating…' : 'My Location'}
            </button>
          </div>
        </div>
      </div>

      {/* Select Place Left Sidebar */}
      {!isNavigating && (
        <PlaceSidebar
          buildings={allPlaces}
          selectedBuilding={selectedBuilding}
          onSelectBuilding={(b) => setSelectedBuilding(b)}
          onStartNavigation={handleStartNavigationTo}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      )}

      {/* Map Viewport */}
      <CampusMap
        buildings={allPlaces}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={(b) => setSelectedBuilding(b)}
        onMoveBuilding={handleMoveBuilding}
        onDeleteBuilding={handleDeleteBuilding}
        userLocation={userLocation}
        routeCoordinates={routeResult ? routeResult.coordinates : []}
        routeSegments={routeResult ? routeResult.segments : []}
        onNavigateTo={handleStartNavigationTo}
        isInspectorActive={isInspectorActive}
        onMapClick={(latlng) => setClickedLatLng(latlng)}
        clickedLatLng={clickedLatLng}
        nodes={nodes}
        edges={edges}
        selectedFromNode={selectedFromNode}
        selectedToNode={selectedToNode}
        onSelectGraphNode={handleSelectGraphNode}
        onMoveNode={handleMoveNode}
        onDeleteNode={handleDeleteNode}
      />

      {/* Admin Node & Path Inspector */}
      {isInspectorActive && (
        <NodeInspector
          clickedLatLng={clickedLatLng}
          onClearClickedLatLng={() => setClickedLatLng(null)}
          nodes={nodes}
          edges={edges}
          buildings={allPlaces}
          onAddNode={handleAddNode}
          onAddEdge={handleAddEdge}
          selectedFromNode={selectedFromNode}
          selectedToNode={selectedToNode}
          onSetSelectedFromNode={setSelectedFromNode}
          onSetSelectedToNode={setSelectedToNode}
          onResetSelectedNodes={handleResetSelectedNodes}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={handleDeleteEdge}
          onClearAllData={handleClearAllData}
          onResetDefaultData={handleResetDefaultData}
        />
      )}

      {/* Building Side Panel (Pops up on the right when any location is clicked on map) */}
      {!isNavigating && selectedBuilding && (
        <BuildingSidePanel
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
          onStartNavigation={handleStartNavigationTo}
          onEditBuilding={handleEditBuilding}
          onDeleteBuilding={handleDeleteBuilding}
          userLocation={userLocation}
        />
      )}

      {/* Navigation Panel */}
      {isNavigating && (
        <NavigationPanel
          buildings={allPlaces}
          originId={originId} setOriginId={setOriginId}
          destinationId={destinationId} setDestinationId={setDestinationId}
          routeResult={routeResult}
          options={navOptions} setOptions={setNavOptions}
          onClearRoute={() => { setIsNavigating(false); setRouteResult(null); }}
        />
      )}
    </div>
  );
}
