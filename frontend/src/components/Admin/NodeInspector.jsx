import React, { useState } from 'react';
import { Crosshair, Copy, Check, Plus, Code, Route, Link2, Waypoints, Trash2 } from 'lucide-react';
import { haversineDistance } from '../../utils/aStarPathfinder';

export default function NodeInspector({
  clickedLatLng,
  onClearClickedLatLng,
  nodes,
  edges,
  onAddNode,
  onAddEdge,
  selectedFromNode,
  selectedToNode,
  onSetSelectedFromNode,
  onSetSelectedToNode,
  onResetSelectedNodes,
  onDeleteNode,
  onDeleteEdge
}) {
  const [activeTab, setActiveTab] = useState('PATH');
  const [copied, setCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // New Node Form
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState('ENTRANCE');

  // New Edge Form
  const [isAccessible, setIsAccessible] = useState(true);
  const [hasStairs, setHasStairs] = useState(false);

  // Waypoint mode
  const [isWaypointMode, setIsWaypointMode] = useState(false);
  const [waypointFrom, setWaypointFrom] = useState(null);

  const lat = clickedLatLng ? clickedLatLng.lat.toFixed(6) : '';
  const lng = clickedLatLng ? clickedLatLng.lng.toFixed(6) : '';

  const handleCopy = () => {
    if (!clickedLatLng) return;
    navigator.clipboard.writeText(`latitude: ${lat}, longitude: ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNode = (e) => {
    e.preventDefault();
    if (!nodeName.trim() || !clickedLatLng) return;

    const newNode = {
      id: Math.max(0, ...nodes.map(n => n.id)) + 1,
      name: nodeName.trim(),
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      type: nodeType
    };

    onAddNode(newNode);

    // If in waypoint mode, auto-connect from the previous node
    if (isWaypointMode && waypointFrom) {
      const dist = Math.round(haversineDistance(
        waypointFrom.latitude, waypointFrom.longitude,
        newNode.latitude, newNode.longitude
      ));
      onAddEdge({
        id: Math.max(0, ...edges.map(e => e.id)) + 1,
        from: waypointFrom.id,
        to: newNode.id,
        distance: dist,
        walkable: true,
        accessible: isAccessible,
        stairs: hasStairs,
        pathType: 'PAVED'
      });
      setWaypointFrom(newNode); // chain to this new node
    }

    setNodeName('');
    onClearClickedLatLng();
  };

  const handleCreateEdge = (e) => {
    e.preventDefault();
    if (!selectedFromNode || !selectedToNode || selectedFromNode.id === selectedToNode.id) {
      alert('Select two different nodes to connect!');
      return;
    }

    const dist = Math.round(haversineDistance(
      selectedFromNode.latitude, selectedFromNode.longitude,
      selectedToNode.latitude, selectedToNode.longitude
    ));

    onAddEdge({
      id: Math.max(0, ...edges.map(e => e.id)) + 1,
      from: selectedFromNode.id,
      to: selectedToNode.id,
      distance: dist,
      walkable: true,
      accessible: isAccessible,
      stairs: hasStairs,
      pathType: 'PAVED'
    });
    onResetSelectedNodes();
  };

  const startWaypointChain = () => {
    setIsWaypointMode(true);
    setActiveTab('WAYPOINT');
    setWaypointFrom(null);
  };

  const stopWaypointChain = () => {
    setIsWaypointMode(false);
    setWaypointFrom(null);
    setActiveTab('PATH');
  };

  // Export helpers
  const exportJsNodes = JSON.stringify(nodes, null, 2);
  const exportJsEdges = JSON.stringify(edges, null, 2);

  const exportSqlNodes = nodes.map(n =>
    `INSERT INTO navigation_nodes (id, name, latitude, longitude, node_type) VALUES (${n.id}, '${n.name.replace(/'/g, "''")}', ${n.latitude}, ${n.longitude}, '${n.type}');`
  ).join('\n');

  const exportSqlEdges = edges.map(e =>
    `INSERT INTO navigation_edges (id, from_node_id, to_node_id, distance_meters, walkable, accessible, stairs, path_type) VALUES (${e.id}, ${e.from}, ${e.to}, ${e.distance}, ${e.walkable}, ${e.accessible}, ${e.stairs}, '${e.pathType}');`
  ).join('\n');

  return (
    <>
      <div
        className="glass-panel animate-fade-in"
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '540px',
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
        {/* Tab Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'PATH', label: 'Connect', icon: <Link2 size={13} />, color: '#f59e0b' },
              { id: 'WAYPOINT', label: 'Waypoint Path', icon: <Waypoints size={13} />, color: '#a855f7' },
              { id: 'NODE', label: 'Add Node', icon: <Crosshair size={13} />, color: '#38bdf8' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'WAYPOINT') stopWaypointChain();
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: activeTab === tab.id ? `1px solid ${tab.color}` : '1px solid transparent',
                  background: activeTab === tab.id ? `${tab.color}22` : 'transparent',
                  color: activeTab === tab.id ? tab.color : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#818cf8',
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Code size={13} /> Export
          </button>
        </div>

        {/* ============== TAB: CONNECT TWO NODES ============== */}
        {activeTab === 'PATH' && (
          <form onSubmit={handleCreateEdge} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                <span>Click 2 orange dots on the map OR select below:</span>
                {(selectedFromNode || selectedToNode) && (
                  <button type="button" onClick={onResetSelectedNodes}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.72rem' }}>
                    Reset
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '700' }}>START (A)</label>
                  <select
                    value={selectedFromNode ? selectedFromNode.id : ''}
                    onChange={(e) => onSetSelectedFromNode(nodes.find(n => n.id === parseInt(e.target.value)) || null)}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '8px', padding: '6px', color: '#fff', fontSize: '0.8rem', outline: 'none', marginTop: '2px' }}
                  >
                    <option value="">Select…</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>#{n.id} {n.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: '700' }}>END (B)</label>
                  <select
                    value={selectedToNode ? selectedToNode.id : ''}
                    onChange={(e) => onSetSelectedToNode(nodes.find(n => n.id === parseInt(e.target.value)) || null)}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid #f59e0b', borderRadius: '8px', padding: '6px', color: '#fff', fontSize: '0.8rem', outline: 'none', marginTop: '2px' }}
                  >
                    <option value="">Select…</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>#{n.id} {n.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', paddingLeft: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input type="checkbox" checked={hasStairs} onChange={(e) => setHasStairs(e.target.checked)} /> Stairs
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input type="checkbox" checked={isAccessible} onChange={(e) => setIsAccessible(e.target.checked)} /> Accessible
              </label>
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
              <Link2 size={16} />
              {selectedFromNode && selectedToNode
                ? `Connect #${selectedFromNode.id} ➔ #${selectedToNode.id}`
                : 'Select 2 Nodes'}
            </button>
          </form>
        )}

        {/* ============== TAB: WAYPOINT PATH (curved roads) ============== */}
        {activeTab === 'WAYPOINT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Explanation Box */}
            <div style={{
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.82rem',
              color: '#e2e8f0',
              lineHeight: '1.5'
            }}>
              <strong style={{ color: '#a855f7' }}>🛣️ How Curved Paths Work:</strong><br/>
              Roads are not straight! To draw a path that follows a <strong>curved road</strong>:<br/>
              <span style={{ color: '#f59e0b' }}>1.</span> Pick a start node below ↓<br/>
              <span style={{ color: '#f59e0b' }}>2.</span> Click along the road curve to place small <strong style={{ color: '#a855f7' }}>waypoints</strong><br/>
              <span style={{ color: '#f59e0b' }}>3.</span> Each waypoint auto-connects to the previous one!
            </div>

            {/* Start Chain From */}
            {!isWaypointMode ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: '700' }}>START CHAIN FROM NODE</label>
                  <select
                    value={waypointFrom ? waypointFrom.id : ''}
                    onChange={(e) => setWaypointFrom(nodes.find(n => n.id === parseInt(e.target.value)) || null)}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid #a855f7', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.82rem', outline: 'none', marginTop: '2px' }}
                  >
                    <option value="">Pick starting node…</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>#{n.id} {n.name}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => {
                    if (!waypointFrom) { alert('Pick a starting node first!'); return; }
                    setIsWaypointMode(true);
                  }}
                  disabled={!waypointFrom}
                  style={{
                    padding: '8px 14px',
                    background: waypointFrom ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.08)',
                    border: 'none', borderRadius: '8px',
                    color: waypointFrom ? '#0f172a' : '#64748b',
                    fontWeight: '700', fontSize: '0.82rem',
                    cursor: waypointFrom ? 'pointer' : 'not-allowed'
                  }}
                >
                  Start Chain ⛓️
                </button>
              </div>
            ) : (
              <>
                {/* Active chaining mode */}
                <div style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid #a855f7',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                    ⛓️ Chaining from: <strong style={{ color: '#a855f7' }}>#{waypointFrom.id} {waypointFrom.name}</strong>
                  </div>
                  <button onClick={stopWaypointChain}
                    style={{ background: '#ef4444', border: 'none', borderRadius: '6px', color: '#fff', padding: '4px 8px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Stop Chain
                  </button>
                </div>

                {clickedLatLng ? (
                  <form onSubmit={handleCreateNode} style={{ display: 'flex', gap: '6px' }}>
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      color: '#a855f7',
                      display: 'flex',
                      alignItems: 'center',
                      minWidth: '190px'
                    }}>
                      {lat}, {lng}
                    </div>
                    <input
                      type="text"
                      placeholder="WP name (auto: Waypoint)"
                      value={nodeName}
                      onChange={(e) => setNodeName(e.target.value)}
                      onFocus={() => { if (!nodeName) setNodeName(`WP-${nodes.length + 1}`); }}
                      style={{
                        flex: 1, background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                        padding: '8px 10px', color: '#fff', fontSize: '0.82rem', outline: 'none'
                      }}
                    />
                    <input type="hidden" value="WAYPOINT" />
                    <button type="submit" onClick={() => setNodeType('WAYPOINT')}
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        border: 'none', borderRadius: '8px', color: '#0f172a',
                        fontWeight: '700', padding: '8px 12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Plus size={14} /> Add WP
                    </button>
                  </form>
                ) : (
                  <div style={{
                    textAlign: 'center', padding: '10px',
                    background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px',
                    border: '1px dashed rgba(168, 85, 247, 0.4)',
                    color: '#a855f7', fontSize: '0.85rem'
                  }}>
                    👈 <strong>Click along the road curve</strong> to place the next waypoint!
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ============== TAB: ADD STANDALONE NODE ============== */}
        {activeTab === 'NODE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {clickedLatLng ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(15, 23, 42, 0.7)', padding: '8px 12px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '0.85rem', color: '#38bdf8'
                }}>
                  <div>Lat: <strong>{lat}</strong> <span style={{ marginLeft: '10px' }}>Lng: <strong>{lng}</strong></span></div>
                  <button onClick={handleCopy}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: copied ? '#10b981' : 'rgba(56,189,248,0.2)',
                      color: copied ? '#0f172a' : '#38bdf8',
                      border: 'none', padding: '4px 8px', borderRadius: '6px',
                      fontSize: '0.73rem', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <form onSubmit={handleCreateNode} style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" placeholder="e.g. CSE Back Gate..." value={nodeName}
                    onChange={(e) => setNodeName(e.target.value)}
                    style={{ flex: 1, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
                  <select value={nodeType} onChange={(e) => setNodeType(e.target.value)}
                    style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.8rem', outline: 'none' }}>
                    <option value="ENTRANCE">Entrance</option>
                    <option value="JUNCTION">Junction</option>
                    <option value="GATE">Gate</option>
                    <option value="WAYPOINT">Waypoint</option>
                  </select>
                  <button type="submit"
                    style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: '700', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} /> Add
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(15,23,42,0.4)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.15)', color: '#94a3b8', fontSize: '0.85rem' }}>
                👈 <strong>Click on the map</strong> to pick a location and create a node!
              </div>
            )}
          </div>
        )}

        {/* Node & Edge count status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span>🟠 {nodes.filter(n => n.type !== 'WAYPOINT').length} nodes + 🟣 {nodes.filter(n => n.type === 'WAYPOINT').length} waypoints</span>
          <span>🔗 {edges.length} path connections</span>
          <span>💡 Drag dots to move • Click popup to delete</span>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '650px', maxHeight: '85vh', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#fff' }}>Export Graph Code</h3>
              <button onClick={() => setShowExportModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#38bdf8', marginBottom: '6px' }}>JavaScript (presidencyData.js)</h4>
                <pre style={{ background: '#090d16', padding: '12px', borderRadius: '10px', fontSize: '0.75rem', color: '#a7f3d0', maxHeight: '160px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {`export const NAVIGATION_NODES = ${exportJsNodes};\n\nexport const NAVIGATION_EDGES = ${exportJsEdges};`}
                </pre>
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#818cf8', marginBottom: '6px' }}>SQL (data.sql)</h4>
                <pre style={{ background: '#090d16', padding: '12px', borderRadius: '10px', fontSize: '0.75rem', color: '#bae6fd', maxHeight: '160px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {`${exportSqlNodes}\n\n${exportSqlEdges}`}
                </pre>
              </div>
            </div>
            <button onClick={() => setShowExportModal(false)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
