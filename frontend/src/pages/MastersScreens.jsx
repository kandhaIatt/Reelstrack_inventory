import React, { useState,useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
// Backend integration will be enabled later.
import { mastersApi } from '../api/services';

import { mills } from "./data/mockData";

import {
  Eye,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  Power,
  Truck,
  Building,
  Layers,
  Users as UsersIcon,
  LogOut,
  Lock,
} from 'lucide-react';

export function SuppliersScreen() {
  const { suppliers } = useApp();

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Suppliers</h1>
        <p className="page-sub">
          {suppliers.length} registered suppliers
        </p>
      </div>

      <div className="listcard">
        {suppliers.length === 0 ? (
          <div className="empty">
            No suppliers found
          </div>
        ) : (
          suppliers.map((supplier) => (
            <div key={supplier.id} className="li">
              <div className="li-ico">
                <Truck size={18} />
              </div>

              <div className="li-main">
                <div className="li-title">
                  {supplier.name}
                </div>

                <div className="li-sub">
                  {supplier.contact} · {supplier.phone} ·
                  Terms: {supplier.terms}
                </div>
              </div>

              <span className="badge b-muted">
                {supplier.mill}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export function MillsScreen() {
  const [mills, setMills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mastersApi
      .getMills()
      .then((res) => {
        setMills(res.data);
      })
      .catch((error) => {
        console.error("Failed to load mills:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Mills</h1>

        <p className="page-sub">
          {mills.length} paper mills supplying stock
        </p>
      </div>

      <div className="listcard">
        {loading ? (
          <div className="empty">
            Loading mills...
          </div>
        ) : mills.length === 0 ? (
          <div className="empty">
            No mills found
          </div>
        ) : (
          mills.map((mill) => (
            <div key={mill.id} className="li">
              <div className="li-ico">
                <Building size={18} />
              </div>

              <div className="li-main">
                <div className="li-title">
                  {mill.name}
                </div>

                <div className="li-sub">
                  {mill.place} · {mill.grades}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


export function ReelTypesScreen() {
  const { reelTypes } = useApp();

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Reel Types</h1>

        <p className="page-sub">
          Paper grades configured for manufacturing
        </p>
      </div>

      <div className="listcard">
        {reelTypes.length === 0 ? (
          <div className="empty">
            No reel types found
          </div>
        ) : (
          reelTypes.map((type) => (
            <div key={type.id} className="li">
              <div className="li-ico">
                <Layers size={18} />
              </div>

              <div className="li-main">
                <div className="li-title">
                  {type.name}
                </div>

                <div className="li-sub">
                  Standard corrugation &amp; cutting grade
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
   

export function UsersScreen() {
  const {
    user: currentUser,
    users,
    createUser,
    updateUser,
    setUserActive,
    deleteUser,
  } = useAuth();
  const { showToast } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'USER',
    unitId: 'U1',
    password: '',
  });

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      mobile: '',
      role: 'USER',
      unitId: 'U1',
      password: '',
    });
    setFormError('');
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      email: '',
      mobile: '',
      role: 'USER',
      unitId: 'U1',
      password: '',
    });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (target) => {
    setEditingId(target.id);
    setForm({
      name: target.name || '',
      email: target.email || '',
      mobile: target.mobile || '',
      role: target.role === 'ADMIN' ? 'ADMIN' : 'USER',
      unitId: target.unitId || 'U1',
      password: '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      name: form.name,
      email: form.email,
      mobile: form.mobile,
      role: form.role,
      unitId: form.unitId,
    };

    const result = editingId
      ? updateUser(editingId, payload)
      : createUser({ ...payload, password: form.password });

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    showToast(
      editingId ? 'User updated' : 'User created',
      result.message
    );
    resetForm();
  };

  const handleToggleActive = (target) => {
    const result = setUserActive(target.id, !target.active);
    if (!result.success) {
      showToast('Action blocked', result.message, true);
      return;
    }
    showToast(
      target.active ? 'User deactivated' : 'User activated',
      result.message
    );
  };

  const handleDelete = (target) => {
    if (!window.confirm(`Delete ${target.name}? This action cannot be undone.`)) {
      return;
    }

    const result = deleteUser(target.id);
    if (!result.success) {
      showToast('Delete failed', result.message, true);
      return;
    }
    showToast('User deleted', result.message);
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
                <label>Mobile *</label>
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

              {form.role === 'USER' && (
                <div className="field">
                  <label>Unit</label>
                  <input
                    className="input"
                    value={form.unitId}
                    onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                    placeholder="U1"
                  />
                </div>
              )}

              {!editingId && (
                <div className="field">
                  <label>Temporary Password *</label>
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
                    {target.email} · {target.mobile} · Unit: {target.unitId || '—'}
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
    </div>
  );
}

export function SettingsScreen() {
  const {
  user,
  logout,
  changePassword,
} = useAuth();
  const { showToast, settings, setSettings } = useApp();

  const isAdmin = user?.role === 'ADMIN';

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] =
  useState(false);

const [showNewPassword, setShowNewPassword] =
  useState(false);

const [showConfirmPassword, setShowConfirmPassword] =
  useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = () => {
  setPasswordError("");

  if (
    !passwords.currentPassword ||
    !passwords.newPassword ||
    !passwords.confirmPassword
  ) {
    setPasswordError(
      "Please fill in all password fields."
    );
    return;
  }

  if (passwords.newPassword.length < 8) {
    setPasswordError(
      "Password must contain at least 8 characters."
    );
    return;
  }

  if (!/[A-Z]/.test(passwords.newPassword)) {
    setPasswordError(
      "Password must contain at least one uppercase letter."
    );
    return;
  }

  if (
    !/[!@#$%^&*(),.?":{}|<>]/.test(
      passwords.newPassword
    )
  ) {
    setPasswordError(
      "Password must contain at least one special character."
    );
    return;
  }

  if (
    passwords.newPassword !==
    passwords.confirmPassword
  ) {
    setPasswordError(
      "New password and confirmation do not match."
    );
    return;
  }

  // Call AuthContext password change function
  const result = changePassword(
    passwords.currentPassword,
    passwords.newPassword
  );

  if (!result.success) {
    setPasswordError(result.message);
    return;
  }

  showToast(
    "Password changed",
    result.message
  );

  setPasswords({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  setShowPasswordForm(false);
};

  

    

   
  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Settings</h1>

        <p className="page-sub">
          Application preferences and account settings
        </p>
      </div>

      {/* User Profile */}
      <div className="card card-pad">
        <div className="row">
          <div
            className="li-ico"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
            }}
          >
            <UsersIcon size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '15.5px',
                fontWeight: 660,
              }}
            >
              {user?.name || 'User'}
            </div>

            <div className="tiny muted">
              {isAdmin
                ? 'Head Office Admin'
                : `User (${user?.unitId || 'U1'})`}
            </div>
          </div>

          <span
            className={`badge ${
              isAdmin ? 'b-primary' : 'b-ok'
            }`}
          >
            {user?.role}
          </span>
        </div>
      </div>

      {/* Change Password */}
      <div className="sec">
        <span className="sec-title">
          Security
        </span>
      </div>

      <div className="card card-pad">
        <div
          className="row"
          style={{ justifyContent: 'space-between' }}
        >
          <div className="row">
            <div className="li-ico">
              <Lock size={18} />
            </div>

            <div>
              <div style={{ fontWeight: 650 }}>
                Change Password
              </div>

              <div className="tiny muted">
                Update your account password
              </div>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setShowPasswordForm(!showPasswordForm)
            }
          >
            {showPasswordForm ? 'Cancel' : 'Change'}
          </button>
        </div>

        {showPasswordForm && (
          <div style={{ marginTop: '20px' }}>
            {passwordError && (
              <div
                className="pill-note warn"
                style={{
                  marginBottom: '16px',
                  background: 'var(--danger-soft)',
                  color: 'var(--danger)',
                }}
              >
                {passwordError}
              </div>
            )}

            <div className="field">
  <label>Current Password</label>

  <div className="password-wrapper">
    <input
      className="input"
      type={showCurrentPassword ? "text" : "password"}
      value={passwords.currentPassword}
      onChange={(e) =>
        setPasswords({
          ...passwords,
          currentPassword: e.target.value,
        })
      }
    />

    <button
      type="button"
      className="password-eye"
      onClick={() =>
        setShowCurrentPassword(!showCurrentPassword)
      }
    >
      {showCurrentPassword ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  </div>
</div>


<div className="field">
  <label>New Password</label>

  <div className="password-wrapper">
    <input
      className="input"
      type={showNewPassword ? "text" : "password"}
      value={passwords.newPassword}
      onChange={(e) =>
        setPasswords({
          ...passwords,
          newPassword: e.target.value,
        })
      }
    />

    <button
      type="button"
      className="password-eye"
      onClick={() =>
        setShowNewPassword(!showNewPassword)
      }
    >
      {showNewPassword ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  </div>
</div>


<div className="field">
  <label>Confirm New Password</label>

  <div className="password-wrapper">
    <input
      className="input"
      type={showConfirmPassword ? "text" : "password"}
      value={passwords.confirmPassword}
      onChange={(e) =>
        setPasswords({
          ...passwords,
          confirmPassword: e.target.value,
        })
      }
    />

    <button
      type="button"
      className="password-eye"
      onClick={() =>
        setShowConfirmPassword(!showConfirmPassword)
      }
    >
      {showConfirmPassword ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  </div>
</div>


           

           

            <button
              className="btn btn-primary"
              onClick={handlePasswordChange}
            >
              Update Password
            </button>
          </div>
        )}
      </div>

      {/* Calculation Settings */}
      <div className="sec">
        <span className="sec-title">
          Calculation Settings
        </span>
      </div>

      <div className="card card-pad">
        <div className="field">
          <label>Corrugation factor</label>

          <div className="chips">
            {[0.35, 0.4, 0.45, 0.5].map((value) => (
              <button
                key={value}
                className={`chip ${
                  settings.corrugationFactor === value
                    ? 'on'
                    : ''
                }`}
                onClick={() =>
                  setSettings({
                    ...settings,
                    corrugationFactor: value,
                  })
                }
              >
                ×{(1 + value).toFixed(2)} ({value.toFixed(2)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="sec">
        <span className="sec-title">
          Account
        </span>
      </div>

      <button
        className="btn btn-danger btn-block"
        onClick={logout}
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}

     
