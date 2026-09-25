import React, { useState, useEffect } from 'react';
import { Shield, Download, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mock data for audit logs since backend doesn't have an endpoint yet
const MOCK_AUDIT_LOGS = [
  { id: 101, timestamp: '2026-09-18T14:30:00', user: 'admin', role: 'ADMIN', action: 'BULK_IMPORT', entity: 'REEL', entityId: 'Batch-12', details: 'Imported 12 reels successfully' },
  { id: 100, timestamp: '2026-09-18T14:25:12', user: 'admin', role: 'ADMIN', action: 'UPDATE_UNIT', entity: 'UNIT', entityId: 'U2', details: 'Activated unit U2' },
  { id: 99, timestamp: '2026-09-18T10:15:30', user: 'operator1', role: 'USER', action: 'CUTTING_JOB', entity: 'JOB', entityId: 'J-8201', details: 'Consumed 340.5 kg from reel R-10203' },
  { id: 98, timestamp: '2026-09-17T16:45:00', user: 'admin', role: 'ADMIN', action: 'CREATE_PO', entity: 'PO', entityId: 'PO-2026-081', details: 'Created PO for 5000 kg from ABC Papers' },
  { id: 97, timestamp: '2026-09-17T11:20:00', user: 'admin', role: 'ADMIN', action: 'REEL_HOLD', entity: 'REEL', entityId: 'R-9921', details: 'Put reel on hold due to quality issues' },
  { id: 96, timestamp: '2026-09-16T09:10:00', user: 'operator2', role: 'USER', action: 'LOGIN', entity: 'AUTH', entityId: 'operator2', details: 'User logged in successfully' },
  { id: 95, timestamp: '2026-09-16T09:05:00', user: 'operator2', role: 'USER', action: 'LOGIN_FAILED', entity: 'AUTH', entityId: 'operator2', details: 'Invalid credentials' }
];

export default function AuditLogScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLogs(MOCK_AUDIT_LOGS);
      setLoading(false);
    }, 500);
  }, []);

  if (!isAdmin) {
    return <div className="empty">Unauthorized access</div>;
  }

  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-head between wrap">
        <div>
          <h1 className="page-title">System Audit Log</h1>
          <p className="page-sub">Chronological record of system actions</p>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => alert('Exporting to CSV...')}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>
      
      <div className="card card-pad mt14">
        <div className="grid-2">
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Search logs</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--muted)' }}><Search size={16} /></span>
              <input 
                className="input" 
                style={{ paddingLeft: '36px' }}
                placeholder="Search by user, action, or ID..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="card mt14">
        {loading ? (
          <div className="empty">Loading logs...</div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="dim small">{new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                      <span className="small" style={{ fontWeight: 600 }}>{log.user}</span>
                      <span className={`badge ${log.role === 'ADMIN' ? 'b-ok' : 'b-info'}`} style={{ marginLeft: '6px', fontSize: '10px' }}>
                        {log.role}
                      </span>
                    </td>
                    <td><span className="badge b-muted" style={{ fontFamily: 'monospace' }}>{log.action}</span></td>
                    <td>
                      <span className="small">{log.entity}: <strong>{log.entityId}</strong></span>
                    </td>
                    <td className="small dim">{log.details}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr><td colSpan="5" className="empty">No logs match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
