import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { mastersApi } from '../api/services';
import { Users as UsersIcon, Plus, Key, Pencil, Power, Trash2, LogOut } from 'lucide-react';

export default function UsersScreen() {
  const { user: currentUser } = useAuth();
  const { showToast } = useApp();

  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    mobile: '',
    role: 'USER',
    unitId: 'U1',
    password: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, unitsRes] = await Promise.all([
        mastersApi.getUsers(),
        mastersApi.getUnits({ activeOnly: true }),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast('Error', err.response?.data?.message || 'Unable to load users from backend', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [pwdModalUser, setPwdModalUser] = useState(null);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdModalError, setPwdModalError] = useState('');
  const [pwdModalLoading, setPwdModalLoading] = useState(false);

  const resetForm = () => {
    setForm({
      username: '',
      name: '',
      email: '',
      mobile: '',
      role: 'USER',
      unitId: units[0]?.id || 'U1',
      password: '',
    });
    setFormError('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleAdminChangePassword = async (e) => {
    e.preventDefault();
    setPwdModalError('');
    if (!newPwd || !confirmPwd) {
      setPwdModalError('Please fill in both password fields');
      return;
    }
    if (newPwd.length < 8) {
      setPwdModalError('Password must contain at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(newPwd)) {
      setPwdModalError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPwd)) {
      setPwdModalError('Password must contain at least one special character');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdModalError('Passwords do not match');
      return;
    }

    setPwdModalLoading(true);
    try {
      await mastersApi.changeUserPassword(pwdModalUser.id, newPwd);
      showToast('Password updated', `Password updated for @${pwdModalUser.username}`);
      setPwdModalUser(null);
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      console.error(err);
      setPwdModalError(err.response?.data?.message || 'Failed to update user password');
    } finally {
      setPwdModalLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      username: '',
      name: '',
      email: '',
      mobile: '',
      role: 'USER',
      unitId: units[0]?.id || 'U1',
      password: '',
    });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (target) => {
    setEditingId(target.id);
    setForm({
      username: target.username || '',
      name: target.name || '',
      email: target.email || '',
      mobile: target.mobile || '',
      role: target.role || 'USER',
      unitId: target.unitId || 'U1',
      password: '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Full name is required');
      return;
    }

    if (!editingId && !form.username.trim()) {
      setFormError('Username is required');
      return;
    }

    if (!editingId && (!form.password || form.password.length < 8)) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    const payload = {
      username: form.username.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      role: form.role,
      unitId: form.unitId,
    };

    if (form.password && form.password.trim()) {
      payload.password = form.password;
    }

    try {
      if (editingId) {
        await mastersApi.updateUser(editingId, payload);
        showToast('User updated', `Updated account for ${payload.name}`);
      } else {
        await mastersApi.createUser(payload);
        showToast('User created', `Created account ${payload.username}`);
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error('Failed to save user:', err);
      setFormError(err.response?.data?.message || 'Unable to save user to backend');
    }
  };

  const handleToggleActive = async (target) => {
    if (target.username === currentUser?.username) {
      showToast('Action blocked', 'You cannot deactivate your own account', true);
      return;
    }

    try {
      await mastersApi.setUserActive(target.id);
      showToast(
        target.active ? 'User deactivated' : 'User activated',
        `${target.name} is now ${target.active ? 'inactive' : 'active'}`
      );
      await loadData();
    } catch (err) {
      console.error('Failed to toggle user:', err);
      showToast('Action blocked', err.response?.data?.message || 'Unable to toggle user active status', true);
    }
  };

  const handleDelete = async (target) => {
    if (target.username === currentUser?.username) {
      showToast('Action blocked', 'You cannot delete your own account', true);
      return;
    }

    if (!window.confirm(`Delete account "${target.name}" (${target.username})? This action cannot be undone.`)) {
      return;
    }

    try {
      await mastersApi.deleteUser(target.id);
      showToast('User deleted', `Removed account ${target.username}`);
      await loadData();
    } catch (err) {
      console.error('Failed to delete user:', err);
      showToast('Delete failed', err.response?.data?.message || 'Unable to delete user', true);
    }
  };

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-sub">
            {users.length} accounts · Admins manage access and roles
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={17} />
          Create User
        </button>
      </div>

      {showForm && (
        <div className="card card-pad" style={{ marginBottom: '14px' }}>
          <div className="between" style={{ marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                {editingId ? 'Edit User' : 'Create New User'}
              </div>
              <div className="tiny muted">
                {editingId
                  ? 'Update account details and role.'
                  : 'Create an account and assign Admin or User access.'}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>

          {formError && (
            <div
              className="pill-note warn"
              style={{
                marginBottom: '14px',
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
              }}
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="field">
                <label>Username *</label>
                <input
                  className="input"
                  value={form.username}
                  disabled={!!editingId}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. karthik_blr"
                />
              </div>

              <div className="field">
                <label>Full Name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div className="field">
                <label>Email *</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                />
              </div>

              <div className="field">
                <label>Mobile</label>
                <input
                  className="input"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="field">
                <label>Role *</label>
                <select
                  className="select"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {!editingId && (
                <div className="field">
                  <label>Manufacturing Unit</label>
                  <select
                    className="select"
                    value={form.unitId}
                    onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                    {units.length === 0 && <option value="U1">Chennai Unit (U1)</option>}
                  </select>
                </div>
              )}

              {!editingId && (
                <div className="field">
                  <label>Password *</label>
                  <input
                    className="input"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 chars, uppercase + special"
                  />
                </div>
              )}
            </div>

            <div className="btn-row" style={{ marginTop: '8px' }}>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="listcard">
        {users.length === 0 ? (
          <div className="empty">No users found</div>
        ) : (
          users.map((target) => {
            const isSelf = target.id === currentUser?.id;

            return (
              <div key={target.id} className="li" style={{ alignItems: 'flex-start' }}>
                <div className="li-ico">
                  <UsersIcon size={18} />
                </div>

                <div className="li-main">
                  <div className="li-title">
                    {target.name}
                    {isSelf && (
                      <span className="tiny muted" style={{ marginLeft: '7px' }}>
                        (You)
                      </span>
                    )}
                  </div>
                  <div className="li-sub">
                    @{target.username} · {target.email || 'No email'} · {target.mobile || 'No mobile'} · Unit: {target.unitId || '—'}
                  </div>
                  <div className="row" style={{ marginTop: '7px', gap: '6px' }}>
                    <span className={`badge ${target.role === 'ADMIN' ? 'b-primary' : 'b-ok'}`}>
                      {target.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                    <span className={`badge ${target.active ? 'b-ok' : 'b-danger'}`}>
                      {target.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="row" style={{ alignSelf: 'center' }}>
                  <button
                    className="icon-btn"
                    title="Change user password"
                    onClick={() => {
                      setPwdModalUser(target);
                      setNewPwd('');
                      setConfirmPwd('');
                      setPwdModalError('');
                    }}
                  >
                    <Key size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    title="Edit user"
                    onClick={() => openEdit(target)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    title={target.active ? 'Deactivate user' : 'Activate user'}
                    onClick={() => handleToggleActive(target)}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    title="Delete user"
                    onClick={() => handleDelete(target)}
                    disabled={isSelf}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {pwdModalUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)'
        }}>
          <div className="card card-pad" style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-surface, #ffffff)', borderRadius: '16px' }}>
            <div className="between" style={{ marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>Reset User Password</div>
                <div className="tiny muted">Changing password for <strong>{pwdModalUser.name}</strong> (@{pwdModalUser.username})</div>
              </div>
              <button className="icon-btn" onClick={() => setPwdModalUser(null)}>
                <LogOut size={16} />
              </button>
            </div>

            {pwdModalError && (
              <div className="pill-note warn" style={{ marginBottom: '14px', background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                {pwdModalError}
              </div>
            )}

            <form onSubmit={handleAdminChangePassword}>
              <div className="field" style={{ marginBottom: '12px' }}>
                <label>New Password *</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 special char"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
              </div>

              <div className="field" style={{ marginBottom: '16px' }}>
                <label>Confirm New Password *</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                />
              </div>

              <div className="row" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setPwdModalUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={pwdModalLoading}>
                  {pwdModalLoading ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
