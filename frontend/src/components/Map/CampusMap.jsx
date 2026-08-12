import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CAMPUS_CENTER, CAMPUS_ZOOM } from '../../data/presidencyData';

// Custom Building Marker Generator
const createCustomIcon = (category, isSelected) => {
  let color = '#38bdf8';
  let iconSymbol = '📍';

  switch (category) {
    case 'ACADEMIC': color = '#818cf8'; iconSymbol = '🎓'; break;
    case 'LIBRARY': color = '#f59e0b'; iconSymbol = '📚'; break;
    case 'CANTEEN': color = '#ec4899'; iconSymbol = '🍔'; break;
    case 'SPORTS': color = '#10b981'; iconSymbol = '⚽'; break;
    case 'ADMIN': color = '#3b82f6'; iconSymbol = '🏛️'; break;
    case 'HOSTEL': color = '#a855f7'; iconSymbol = '🏠'; break;
    case 'MEDICAL': color = '#ef4444'; iconSymbol = '🏥'; break;
    default: break;
  }

  const scale = isSelected ? 'scale(1.25)' : 'scale(1)';
  const shadow = isSelected ? `0 0 20px ${color}` : '0 4px 10px rgba(0,0,0,0.5)';

  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 38px; height: 38px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: ${shadow}; border: 3px solid #0f172a;
        transform: ${scale}; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-size: 18px; cursor: pointer;
      ">${iconSymbol}</div>
    `,
    className: 'custom-div-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

// Node Icon for graph overlay with selection state
const createGraphNodeIcon = (node, selectedFromNode, selectedToNode, isWaypoint) => {
  let color = isWaypoint ? '#a855f7' : '#f59e0b';
  let size = isWaypoint ? 10 : 16;
  let border = '#ffffff';
  let shadow = `0 0 8px ${color}`;

  if (selectedFromNode && selectedFromNode.id === node.id) {
    color = '#38bdf8';
    shadow = '0 0 18px #38bdf8';
    size = 18;
  } else if (selectedToNode && selectedToNode.id === node.id) {
    color = '#10b981';
    shadow = '0 0 18px #10b981';
    size = 18;
  }

  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: ${size}px; height: ${size}px; border-radius: 50%;
        border: 2px solid ${border}; box-shadow: ${shadow};
        cursor: grab;
      "></div>
    `,
    className: 'graph-node-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// User Location Icon
const userLocationIcon = L.divIcon({
  html: `
    <div style="
      background: #06b6d4; width: 22px; height: 22px; border-radius: 50%;
      border: 3px solid #ffffff; box-shadow: 0 0 15px #06b6d4;
    "></div>
  `,
  className: 'user-location-icon',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Map Click Handler
function MapClickHandler({ isInspectorActive, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isInspectorActive) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

// Map Controller
const MapController = ({ selectedBuilding, routeCoordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedBuilding) {
      map.flyTo([selectedBuilding.latitude, selectedBuilding.longitude], 18, {
        duration: 1.2, easeLinearity: 0.25
      });
    }
  }, [selectedBuilding, map]);

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [routeCoordinates, map]);

  return null;
};

// Draggable Graph Node Marker component
function DraggableNodeMarker({
  node,
  selectedFromNode,
  selectedToNode,
  onSelectGraphNode,
  onMoveNode,
  onDeleteNode,
  isWaypoint
}) {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const pos = marker.getLatLng();
        onMoveNode(node.id, pos.lat, pos.lng);
      }
    }
  };

  return (
    <Marker
      ref={markerRef}
      position={[node.latitude, node.longitude]}
      icon={createGraphNodeIcon(node, selectedFromNode, selectedToNode, isWaypoint)}
      draggable={true}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <div style={{ fontSize: '0.85rem', padding: '4px', minWidth: '200px' }}>
          <div style={{ fontWeight: '700', marginBottom: '6px', color: '#0f172a' }}>
            {isWaypoint ? '🟣' : '🟠'} Node {node.id}: {node.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
            Lat: {node.latitude.toFixed(6)}<br/>
            Lng: {node.longitude.toFixed(6)}<br/>
            Type: {node.type}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '8px', fontStyle: 'italic' }}>
            💡 Drag this dot to move it!
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              style={{
                padding: '4px 8px', background: '#38bdf8', border: 'none',
                borderRadius: '4px', color: '#0f172a', fontWeight: '700',
                fontSize: '0.72rem', cursor: 'pointer'
              }}
              onClick={() => onSelectGraphNode(node, 'FROM')}
            >
              Set as Start A
            </button>
            <button
              style={{
                padding: '4px 8px', background: '#f59e0b', border: 'none',
                borderRadius: '4px', color: '#0f172a', fontWeight: '700',
                fontSize: '0.72rem', cursor: 'pointer'
              }}
              onClick={() => onSelectGraphNode(node, 'TO')}
            >
              Set as End B
            </button>
            <button
              style={{
                padding: '4px 8px', background: '#ef4444', border: 'none',
                borderRadius: '4px', color: '#ffffff', fontWeight: '700',
                fontSize: '0.72rem', cursor: 'pointer'
              }}
              onClick={() => {
                if (window.confirm(`Delete node "${node.name}"? All connected paths will also be removed.`)) {
                  onDeleteNode(node.id);
                }
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function CampusMap({
  buildings = [],
  selectedBuilding,
  onSelectBuilding,
  userLocation,
  routeCoordinates = [],
  onNavigateTo,
  isInspectorActive,
  onMapClick,
  clickedLatLng,
  nodes = [],
  edges = [],
  selectedFromNode,
  selectedToNode,
  onSelectGraphNode,
  onMoveNode,
  onDeleteNode
}) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return (
    <div className="map-viewport" style={{ cursor: isInspectorActive ? 'crosshair' : 'grab' }}>
      <MapContainer
        center={CAMPUS_CENTER}
        zoom={CAMPUS_ZOOM}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Presidency University'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController selectedBuilding={selectedBuilding} routeCoordinates={routeCoordinates} />
        <MapClickHandler isInspectorActive={isInspectorActive} onMapClick={onMapClick} />

        {/* User GPS Marker */}
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userLocationIcon}>
            <Popup>📍 Your Location</Popup>
          </Marker>
        )}

        {/* Clicked Location Pin */}
        {clickedLatLng && (
          <Marker position={[clickedLatLng.lat, clickedLatLng.lng]}>
            <Popup>
              <div style={{ fontSize: '0.85rem' }}>
                📍 <strong>Clicked:</strong><br/>
                Lat: {clickedLatLng.lat.toFixed(6)}<br/>
                Lng: {clickedLatLng.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Graph Overlay Edges */}
        {isInspectorActive && edges.map((edge) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          return (
            <Polyline
              key={`edge-${edge.id}`}
              positions={[
                [fromNode.latitude, fromNode.longitude],
                [toNode.latitude, toNode.longitude]
              ]}
              pathOptions={{
                color: edge.stairs ? '#f59e0b' : '#38bdf8',
                weight: 3, opacity: 0.6, dashArray: '5, 5'
              }}
            />
          );
        })}

        {/* Graph Overlay Nodes (Draggable + Deletable) */}
        {isInspectorActive && nodes.map((node) => (
          <DraggableNodeMarker
            key={`node-${node.id}`}
            node={node}
            selectedFromNode={selectedFromNode}
            selectedToNode={selectedToNode}
            onSelectGraphNode={onSelectGraphNode}
            onMoveNode={onMoveNode}
            onDeleteNode={onDeleteNode}
            isWaypoint={node.type === 'WAYPOINT'}
          />
        ))}

        {/* Campus Building Markers */}
        {buildings.map((building) => {
          const isSelected = selectedBuilding && selectedBuilding.id === building.id;
          const icon = createCustomIcon(building.category, isSelected);

          return (
            <Marker
              key={building.id}
              position={[building.latitude, building.longitude]}
              icon={icon}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <div className="custom-popup-title">{building.name}</div>
                  <div className="custom-popup-desc">{building.code} • {building.category}</div>
                  <button
                    className="custom-popup-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBuilding(building);
                      if (onNavigateTo) onNavigateTo(building);
                    }}
                  >
                    View & Navigate ➔
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* A* Route Visualization */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#38bdf8', weight: 6, opacity: 0.95, dashArray: '10, 10'
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
