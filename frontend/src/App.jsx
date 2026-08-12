import React, { useState, useEffect } from 'react';
import CampusMap from './components/Map/CampusMap';
import SearchBar from './components/Search/SearchBar';
import CategoryFilter from './components/Search/CategoryFilter';
import BuildingSidePanel from './components/Building/BuildingSidePanel';
import NavigationPanel from './components/Navigation/NavigationPanel';
import NodeInspector from './components/Admin/NodeInspector';
import { BUILDINGS, NAVIGATION_NODES as INITIAL_NODES, NAVIGATION_EDGES as INITIAL_EDGES } from './data/presidencyData';
import { findNearestNode, findShortestPath } from './utils/aStarPathfinder';
import { Locate, Crosshair } from 'lucide-react';

export default function App() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Custom Graph State
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState(INITIAL_EDGES);

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

  const filteredBuildings = activeCategory === 'ALL'
    ? BUILDINGS
    : BUILDINGS.filter(b => b.category === activeCategory);

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

  const handleAddNode = (newNode) => setNodes(prev => [...prev, newNode]);
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
      const origBuilding = BUILDINGS.find(b => b.id === originId);
      if (origBuilding) startNodeId = origBuilding.nearestNodeId;
    }

    const destBuilding = BUILDINGS.find(b => b.id === destinationId);
    if (!destBuilding) return;

    const pathResult = findShortestPath(startNodeId, destBuilding.nearestNodeId, nodes, edges, navOptions);
    setRouteResult(pathResult);
  }, [isNavigating, originId, destinationId, navOptions, userLocation, nodes, edges]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%' }}>
          {/* Logo */}
          <div className="glass-panel" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', borderRadius: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: '800', fontSize: '18px' }}>P</div>
            <div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Presidency Navigator</h1>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Bengaluru Campus Map & Custom Paths</div>
            </div>
          </div>

          {/* Search */}
          <div style={{ pointerEvents: 'auto', flex: 1, display: 'flex', justifyContent: 'center' }}>
            <SearchBar buildings={BUILDINGS} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelectBuilding={(b) => setSelectedBuilding(b)} />
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
              <Crosshair size={18} /> {isInspectorActive ? 'Inspector ON 🎯' : 'Inspect Coords 🛠️'}
            </button>

            <button onClick={handleLocateUser} className="glass-panel"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '16px', color: userLocation ? '#38bdf8' : '#94a3b8', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              <Locate size={18} /> {isLocating ? 'Locating…' : 'My Location'}
            </button>
          </div>
        </div>

        {!isNavigating && (
          <div style={{ pointerEvents: 'auto', maxWidth: '800px' }}>
            <CategoryFilter activeCategory={activeCategory} onSelectCategory={(catId) => setActiveCategory(catId)} />
          </div>
        )}
      </div>

      {/* Map */}
      <CampusMap
        buildings={filteredBuildings}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={(b) => setSelectedBuilding(b)}
        userLocation={userLocation}
        routeCoordinates={routeResult ? routeResult.coordinates : []}
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

      {/* Inspector */}
      {isInspectorActive && (
        <NodeInspector
          clickedLatLng={clickedLatLng}
          onClearClickedLatLng={() => setClickedLatLng(null)}
          nodes={nodes}
          edges={edges}
          onAddNode={handleAddNode}
          onAddEdge={handleAddEdge}
          selectedFromNode={selectedFromNode}
          selectedToNode={selectedToNode}
          onSetSelectedFromNode={setSelectedFromNode}
          onSetSelectedToNode={setSelectedToNode}
          onResetSelectedNodes={handleResetSelectedNodes}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={handleDeleteEdge}
        />
      )}

      {/* Building Side Panel */}
      {!isNavigating && selectedBuilding && (
        <BuildingSidePanel
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
          onStartNavigation={handleStartNavigationTo}
          userLocation={userLocation}
        />
      )}

      {/* Navigation Panel */}
      {isNavigating && (
        <NavigationPanel
          buildings={BUILDINGS}
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
