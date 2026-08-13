import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CAMPUS_CENTER, CAMPUS_ZOOM } from '../../data/presidencyData';

// Custom Building Marker Generator - Google Maps style clean text label without fixed black box
const createCustomIcon = (buildingName, category, isSelected) => {
  let color = '#38bdf8';

  switch (category) {
    case 'ACADEMIC': color = '#818cf8'; break;
    case 'LIBRARY': color = '#f59e0b'; break;
    case 'CANTEEN': color = '#ec4899'; break;
    case 'SPORTS': color = '#10b981'; break;
    case 'ADMIN': color = '#3b82f6'; break;
    case 'HOSTEL': color = '#a855f7'; break;
    case 'MEDICAL': color = '#ef4444'; break;
    default: color = '#38bdf8'; break;
  }

  const scale = isSelected ? 'scale(1.15)' : 'scale(1)';
  const shadow = isSelected ? `0 0 15px ${color}` : `0 0 8px ${color}`;

  return L.divIcon({
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        cursor: grab;
        transform: ${scale};
        transition: transform 0.2s ease;
      ">
        <div style="
          width: 10px; height: 10px; border-radius: 50%;
          background: ${color};
          border: 2px solid #ffffff;
          box-shadow: ${shadow};
          flex-shrink: 0;
        "></div>
        <span style="
          color: #ffffff;
          font-family: 'Outfit', 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-shadow: 
            -1px -1px 2px #0f172a, 
             1px -1px 2px #0f172a, 
            -1px  1px 2px #0f172a, 
             1px  1px 2px #0f172a,
             0px  2px 6px rgba(0, 0, 0, 0.9);
          background: rgba(15, 23, 42, 0.85);
          padding: 3px 9px;
          border-radius: 12px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        ">${buildingName}</span>
      </div>
    `,
    className: 'gmaps-style-icon',
    iconSize: null,
    iconAnchor: [5, 12],
    popupAnchor: [0, -14]
  });
};

// Node Icon for graph overlay with selection state (No emojis)
const createGraphNodeIcon = (node, selectedFromNode, selectedToNode, isWaypoint) => {
  let color = isWaypoint ? '#a855f7' : '#f59e0b';
  let size = isWaypoint ? 12 : 16;
  let border = '#ffffff';
  let shadow = `0 0 8px ${color}`;

  if (selectedFromNode && selectedFromNode.id === node.id) {
    color = '#38bdf8';
    shadow = '0 0 18px #38bdf8';
    size = 20;
  } else if (selectedToNode && selectedToNode.id === node.id) {
    color = '#10b981';
    shadow = '0 0 18px #10b981';
    size = 20;
  }

  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: ${size}px; height: ${size}px; border-radius: 50%;
        border: 2px solid ${border}; box-shadow: ${shadow};
        cursor: grab;
        display: flex; align-items: center; justify-content: center;
        color: #0f172a; font-size: 9px; font-weight: 800;
      ">
        ${!isWaypoint ? node.id : ''}
      </div>
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
      background: #06b6d4; width: 20px; height: 20px; border-radius: 50%;
      border: 3px solid #ffffff; box-shadow: 0 0 15px #06b6d4;
    "></div>
  `,
  className: 'user-location-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
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

// Draggable Building / Location Marker
function DraggableBuildingMarker({
  building,
  isSelected,
  onSelectBuilding,
  onMoveBuilding,
  onDeleteBuilding,
  onNavigateTo,
  isInspectorActive
}) {
  const markerRef = useRef(null);
  const icon = createCustomIcon(building.name, building.category, isSelected);

  const eventHandlers = {
    click() {
      onSelectBuilding(building);
    },
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const pos = marker.getLatLng();
        if (onMoveBuilding) {
          onMoveBuilding(building.id, pos.lat, pos.lng);
        }
      }
    }
  };

  return (
    <Marker
      ref={markerRef}
      position={[building.latitude, building.longitude]}
      icon={icon}
      draggable={!!isInspectorActive}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <div style={{ minWidth: '200px', padding: '4px' }}>
          <div className="custom-popup-title" style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
            {building.name}
          </div>
          <div className="custom-popup-desc" style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0' }}>
            {building.code || ''} • {building.category}<br/>
            Lat: {building.latitude.toFixed(6)} | Lng: {building.longitude.toFixed(6)}
          </div>
          {isInspectorActive && (
            <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontStyle: 'italic', marginBottom: '8px' }}>
              💡 Drag this badge to reposition on map!
            </div>
          )}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              className="custom-popup-btn"
              style={{ flex: 1, padding: '5px 8px', fontSize: '0.75rem' }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBuilding(building);
                if (onNavigateTo) onNavigateTo(building);
              }}
            >
              View & Navigate
            </button>
            {onDeleteBuilding && (
              <button
                style={{
                  padding: '5px 8px', background: '#ef4444', border: 'none',
                  borderRadius: '6px', color: '#ffffff', fontWeight: '700',
                  fontSize: '0.72rem', cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete location "${building.name}"?`)) {
                    onDeleteBuilding(building.id);
                  }
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

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
            Node #{node.id}: {node.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
            Lat: {node.latitude.toFixed(6)}<br/>
            Lng: {node.longitude.toFixed(6)}<br/>
            Type: {node.type}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '8px', fontStyle: 'italic' }}>
            Drag dot on map to adjust position
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
              Start A
            </button>
            <button
              style={{
                padding: '4px 8px', background: '#f59e0b', border: 'none',
                borderRadius: '4px', color: '#0f172a', fontWeight: '700',
                fontSize: '0.72rem', cursor: 'pointer'
              }}
              onClick={() => onSelectGraphNode(node, 'TO')}
            >
              End B
            </button>
            <button
              style={{
                padding: '4px 8px', background: '#ef4444', border: 'none',
                borderRadius: '4px', color: '#ffffff', fontWeight: '700',
                fontSize: '0.72rem', cursor: 'pointer'
              }}
              onClick={() => {
                if (window.confirm(`Delete node "${node.name}"? Connected paths will also be removed.`)) {
                  onDeleteNode(node.id);
                }
              }}
            >
              Delete
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
  onMoveBuilding,
  onDeleteBuilding,
  userLocation,
  routeCoordinates = [],
  routeSegments = [],
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
          attribution='&copy; OpenStreetMap contributors | Presidency University'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController selectedBuilding={selectedBuilding} routeCoordinates={routeCoordinates} />
        <MapClickHandler isInspectorActive={isInspectorActive} onMapClick={onMapClick} />

        {/* User GPS Marker */}
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userLocationIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Clicked Location Pin */}
        {clickedLatLng && (
          <Marker position={[clickedLatLng.lat, clickedLatLng.lng]}>
            <Popup>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Clicked Location:</strong><br/>
                Lat: {clickedLatLng.lat.toFixed(6)}<br/>
                Lng: {clickedLatLng.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Graph Overlay Edges (Admin / Inspector Mode) */}
        {isInspectorActive && edges.map((edge) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          const isFootpath = edge.hasFootpath ?? true;

          return (
            <Polyline
              key={`edge-${edge.id}`}
              positions={[
                [fromNode.latitude, fromNode.longitude],
                [toNode.latitude, toNode.longitude]
              ]}
              pathOptions={{
                color: isFootpath ? '#38bdf8' : '#ef4444',
                weight: isFootpath ? 4 : 3,
                opacity: 0.85,
                dashArray: isFootpath ? undefined : '6, 6'
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

        {/* Campus Building & Location Markers (Draggable + Deletable + Clickable) */}
        {buildings.map((building) => {
          const isSelected = selectedBuilding && selectedBuilding.id === building.id;

          return (
            <DraggableBuildingMarker
              key={building.id}
              building={building}
              isSelected={isSelected}
              onSelectBuilding={onSelectBuilding}
              onMoveBuilding={onMoveBuilding}
              onDeleteBuilding={onDeleteBuilding}
              onNavigateTo={onNavigateTo}
              isInspectorActive={isInspectorActive}
            />
          );
        })}

        {/* A* Route Visualization with Footpath Distinction (Solid = Footpath, Dotted = No Footpath) */}
        {routeSegments && routeSegments.length > 0 ? (
          routeSegments.map((segment, idx) => (
            <Polyline
              key={`route-seg-${idx}`}
              positions={segment.coordinates}
              pathOptions={{
                color: segment.hasFootpath ? '#38bdf8' : '#ef4444',
                weight: 6,
                opacity: 0.95,
                dashArray: segment.hasFootpath ? undefined : '8, 8'
              }}
            />
          ))
        ) : (
          routeCoordinates && routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#38bdf8', weight: 6, opacity: 0.95
              }}
            />
          )
        )}
      </MapContainer>
    </div>
  );
}
