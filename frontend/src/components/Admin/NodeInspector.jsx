import React, { useState, useMemo } from 'react';
import { Crosshair, Copy, Check, Plus, Code, Link2, Waypoints, Trash2, Footprints } from 'lucide-react';
import { haversineDistance } from '../../utils/aStarPathfinder';

export default function NodeInspector({
  clickedLatLng,
  onClearClickedLatLng,
  nodes = [],
  edges = [],
  buildings = [],
  onAddNode,
  onAddEdge,
  selectedFromNode,
  selectedToNode,
  onSetSelectedFromNode,
  onSetSelectedToNode,
  onResetSelectedNodes,
  onDeleteNode,
  onDeleteEdge,
  onClearAllData,
  onResetDefaultData
}) {
  const [activeTab, setActiveTab] = useState('WAYPOINT');
  const [copied, setCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Manual Node / Location Form State
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState('ENTRANCE');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  // Path Creation Options (Footpath vs Dotted Road)
  const [hasFootpath, setHasFootpath] = useState(true);
  const [isAccessible, setIsAccessible] = useState(true);

  // Waypoint chaining state
  const [isWaypointMode, setIsWaypointMode] = useState(false);
  const [waypointFrom, setWaypointFrom] = useState(null);

  const lat = clickedLatLng ? clickedLatLng.lat.toFixed(6) : manualLat;
  const lng = clickedLatLng ? clickedLatLng.lng.toFixed(6) : manualLng;

  // Combine graph nodes and building locations so dropdown is NEVER empty
  const availableNodes = useMemo(() => {
    const list = [];
    const idSet = new Set();

    (nodes || []).forEach(n => {
      list.push({ id: n.id, name: n.name, latitude: n.latitude, longitude: n.longitude, type: n.type });
      idSet.add(String(n.id));
    });

    (buildings || []).forEach(b => {
      const targetId = b.nearestNodeId || b.id;
      if (!idSet.has(String(targetId))) {
        list.push({ id: targetId, name: b.name, latitude: b.latitude, longitude: b.longitude, type: b.category || 'LOCATION' });
        idSet.add(String(targetId));
      }
    });

    return list;
  }, [nodes, buildings]);

  const handleCopy = () => {
    if (!lat || !lng) return;
    navigator.clipboard.writeText(`latitude: ${lat}, longitude: ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNode = (e) => {
    if (e) e.preventDefault();
    const finalLat = parseFloat(lat);
    const finalLng = parseFloat(lng);

    if (isNaN(finalLat) || isNaN(finalLng)) {
      alert('Please click on the map to set coordinates first!');
      return;
    }

    const newId = Math.max(0, ...nodes.map(n => typeof n.id === 'number' ? n.id : 0)) + 1;
    const finalName = nodeName.trim() || `WP-${newId}`;

    const newNode = {
      id: newId,
      name: finalName,
      latitude: finalLat,
      longitude: finalLng,
      type: nodeType
    };

    onAddNode(newNode);

    // If chaining waypoints, auto-connect from previous node
    const currentFrom = waypointFrom || selectedFromNode;
    if (currentFrom) {
      const dist = Math.round(haversineDistance(
        currentFrom.latitude, currentFrom.longitude,
        newNode.latitude, newNode.longitude
      ));
      onAddEdge({
        id: Math.max(0, ...edges.map(e => typeof e.id === 'number' ? e.id : 0)) + 1,
        from: currentFrom.id,
        to: newNode.id,
        distance: dist,
        walkable: true,
        accessible: isAccessible,
        stairs: false,
        hasFootpath: hasFootpath,
        pathType: hasFootpath ? 'FOOTPATH' : 'ROAD_NO_FOOTPATH'
      });
    }

    setWaypointFrom(newNode); // auto-advance chain
    setIsWaypointMode(true);
    setNodeName('');
    setManualLat('');
    setManualLng('');
    onClearClickedLatLng();
  };

  const handleCreateEdge = (e) => {
    e.preventDefault();
    if (!selectedFromNode || !selectedToNode || String(selectedFromNode.id) === String(selectedToNode.id)) {
      alert('Select two different nodes to connect!');
      return;
    }

    const dist = Math.round(haversineDistance(
      selectedFromNode.latitude, selectedFromNode.longitude,
      selectedToNode.latitude, selectedToNode.longitude
    ));

    onAddEdge({
      id: Math.max(0, ...edges.map(e => typeof e.id === 'number' ? e.id : 0)) + 1,
      from: selectedFromNode.id,
      to: selectedToNode.id,
      distance: dist,
      walkable: true,
      accessible: isAccessible,
      stairs: false,
      hasFootpath: hasFootpath,
      pathType: hasFootpath ? 'FOOTPATH' : 'ROAD_NO_FOOTPATH'
    });
    onResetSelectedNodes();
  };

  const startWaypointModeWithFirstAvailable = () => {
    if (availableNodes.length > 0) {
      setWaypointFrom(availableNodes[0]);
    }
    setIsWaypointMode(true);
  };

  const stopWaypointChain = () => {
    setIsWaypointMode(false);
    setWaypointFrom(null);
  };

  // Code Export
  const exportJsNodes = JSON.stringify(nodes, null, 2);
  const exportJsEdges = JSON.stringify(edges, null, 2);

  const activeStartNode = waypointFrom || selectedFromNode;

  return (
    <>
      <div
        className="glass-panel animate-fade-in"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '580px',
          borderRadius: '20px',
          zIndex: 40,
          padding: '16px',
          border: '1px solid #f59e0b',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Navigation / Mode Tabs & Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'WAYPOINT', label: 'Draw Path', icon: <Waypoints size={13} />, color: '#a855f7' },
              { id: 'PATH', label: 'Connect 2 Nodes', icon: <Link2 size={13} />, color: '#f59e0b' },
              { id: 'NODE', label: 'Add Location', icon: <Crosshair size={13} />, color: '#38bdf8' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'WAYPOINT') stopWaypointChain();
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: activeTab === tab.id ? `1px solid ${tab.color}` : '1px solid transparent',
                  background: activeTab === tab.id ? `${tab.color}22` : 'transparent',
                  color: activeTab === tab.id ? tab.color : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {onClearAllData && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all nodes, locations, and paths to start completely fresh?')) {
                    onClearAllData();
                  }
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  color: '#ef4444',
                  padding: '5px 8px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Wipe map and build custom nodes/paths"
              >
                <Trash2 size={12} /> Clear All
              </button>
            )}

            <button
              onClick={() => setShowExportModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#818cf8',
                padding: '5px 8px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Code size={12} /> Export
            </button>
          </div>
        </div>

        {/* ============== FOOTPATH / ROAD TYPE TOGGLE BAR ============== */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '10px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Footprints size={14} color="#38bdf8" /> Path Style:
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: hasFootpath ? '#38bdf8' : '#64748b', fontWeight: '700', cursor: 'pointer' }}>
              <input
                type="radio"
                name="footpathToggle"
                checked={hasFootpath}
                onChange={() => setHasFootpath(true)}
              />
              Solid Line (Footpath)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: !hasFootpath ? '#ef4444' : '#64748b', fontWeight: '700', cursor: 'pointer' }}>
              <input
                type="radio"
                name="footpathToggle"
                checked={!hasFootpath}
                onChange={() => setHasFootpath(false)}
              />
              Dotted Line (No Footpath)
            </label>
          </div>
        </div>

        {/* ============== TAB: DRAW MANUAL PATH (CLICK & CHAIN WAYPOINTS) ============== */}
        {activeTab === 'WAYPOINT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!isWaypointMode && !activeStartNode ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: '700' }}>START DRAWING PATH FROM</label>
                  <select
                    value={waypointFrom ? String(waypointFrom.id) : ''}
                    onChange={(e) => {
                      const found = availableNodes.find(n => String(n.id) === e.target.value);
                      setWaypointFrom(found || null);
                    }}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid #a855f7', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.82rem', outline: 'none', marginTop: '2px' }}
                  >
                    <option value="">Choose place/node OR click map…</option>
                    {availableNodes.map(n => (
                      <option key={`opt-${n.id}`} value={String(n.id)}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={startWaypointModeWithFirstAvailable}
                  style={{
                    padding: '8px 14px',
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    border: 'none', borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: '700', fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Start Path Drawer
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid #a855f7',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                    Chaining from: <strong style={{ color: '#a855f7' }}>{activeStartNode ? activeStartNode.name : 'New Map Point'}</strong>
                  </div>
                  <button onClick={stopWaypointChain}
                    style={{ background: '#ef4444', border: 'none', borderRadius: '6px', color: '#fff', padding: '4px 8px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Done
                  </button>
                </div>

                {clickedLatLng ? (
                  <form onSubmit={handleCreateNode} style={{ display: 'flex', gap: '6px' }}>
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      color: '#a855f7',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {lat}, {lng}
                    </div>
                    <input
                      type="text"
                      placeholder="Waypoint name (e.g. Turn 1)"
                      value={nodeName}
                      onChange={(e) => setNodeName(e.target.value)}
                      onFocus={() => { if (!nodeName) setNodeName(`WP-${nodes.length + 1}`); }}
                      style={{
                        flex: 1, background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                        padding: '8px 10px', color: '#fff', fontSize: '0.82rem', outline: 'none'
                      }}
                    />
                    <button type="submit" onClick={() => setNodeType('WAYPOINT')}
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        border: 'none', borderRadius: '8px', color: '#fff',
                        fontWeight: '700', padding: '8px 12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Plus size={14} /> Add & Connect Point
                    </button>
                  </form>
                ) : (
                  <div style={{
                    textAlign: 'center', padding: '10px',
                    background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px',
                    border: '1px dashed rgba(168, 85, 247, 0.4)',
                    color: '#a855f7', fontSize: '0.82rem'
                  }}>
                    👉 Click anywhere on the map to add the next path node!
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ============== TAB: CONNECT 2 EXISTING NODES ============== */}
        {activeTab === 'PATH' && (
          <form onSubmit={handleCreateEdge} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '700' }}>START NODE (A)</label>
                <select
                  value={selectedFromNode ? String(selectedFromNode.id) : ''}
                  onChange={(e) => onSetSelectedFromNode(availableNodes.find(n => String(n.id) === e.target.value) || null)}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '8px', padding: '6px', color: '#fff', fontSize: '0.8rem', outline: 'none', marginTop: '2px' }}
                >
                  <option value="">Select node A or click map…</option>
                  {availableNodes.map(n => (
                    <option key={`a-${n.id}`} value={String(n.id)}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: '700' }}>END NODE (B)</label>
                <select
                  value={selectedToNode ? String(selectedToNode.id) : ''}
                  onChange={(e) => onSetSelectedToNode(availableNodes.find(n => String(n.id) === e.target.value) || null)}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #f59e0b', borderRadius: '8px', padding: '6px', color: '#fff', fontSize: '0.8rem', outline: 'none', marginTop: '2px' }}
                >
                  <option value="">Select node B or click map…</option>
                  {availableNodes.map(n => (
                    <option key={`b-${n.id}`} value={String(n.id)}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={!selectedFromNode || !selectedToNode}
              style={{
                width: '100%', padding: '9px',
                background: selectedFromNode && selectedToNode ? 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)' : 'rgba(255,255,255,0.08)',
                border: 'none', borderRadius: '10px',
                color: selectedFromNode && selectedToNode ? '#0f172a' : '#64748b',
                fontWeight: '700', fontSize: '0.85rem',
                cursor: selectedFromNode && selectedToNode ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <Link2 size={16} /> Connect Nodes with {hasFootpath ? 'Solid Line (Footpath)' : 'Dotted Line'}
            </button>
          </form>
        )}

        {/* ============== TAB: ADD LOCATION (MANUAL OR MAP CLICK) ============== */}
        {activeTab === 'NODE' && (
          <form onSubmit={handleCreateNode} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>LATITUDE</label>
                <input
                  type="text"
                  placeholder="e.g. 13.168500"
                  value={lat}
                  onChange={(e) => setManualLat(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 8px', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>LONGITUDE</label>
                <input
                  type="text"
                  placeholder="e.g. 77.535200"
                  value={lng}
                  onChange={(e) => setManualLng(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 8px', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Location Name (e.g. Engineering Block A)"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                style={{ flex: 1, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
              <select
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value)}
                style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
              >
                <option value="ENTRANCE">Entrance</option>
                <option value="JUNCTION">Junction</option>
                <option value="GATE">Gate</option>
                <option value="WAYPOINT">Waypoint</option>
              </select>
              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: '700', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Save Location
              </button>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              💡 Tip: Click anywhere on the map to automatically fill coordinates!
            </div>
          </form>
        )}

        {/* Node & Edge count status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span>Nodes: <strong>{nodes.length}</strong></span>
          <span>Paths: <strong>{edges.length}</strong></span>
          <span>Drag dots on map to reposition</span>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '650px', maxHeight: '85vh', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#fff', margin: 0 }}>Export Campus Graph Data</h3>
              <button onClick={() => setShowExportModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#38bdf8', marginBottom: '6px' }}>JavaScript / JSON Code</h4>
              <pre style={{ background: '#090d16', padding: '12px', borderRadius: '10px', fontSize: '0.75rem', color: '#a7f3d0', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {`export const NAVIGATION_NODES = ${exportJsNodes};\n\nexport const NAVIGATION_EDGES = ${exportJsEdges};`}
              </pre>
            </div>
            <button onClick={() => setShowExportModal(false)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
