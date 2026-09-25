import React, { useState,useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
// Backend integration will be enabled later.
import { mastersApi } from '../api/services';
import MasterActions from '../components/MasterActions';



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
  Key,
} from 'lucide-react';

export function SuppliersScreen() {
  const { user } = useAuth();
  const { showToast } = useApp();
  const isAdmin = user?.role === 'ADMIN';

  const [suppliers, setSuppliers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await mastersApi.getSuppliers();
      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
      setError(err.response?.data?.message || 'Unable to load suppliers from backend');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const blank = {
    id: '',
    name: '',
    mill: '',
    gst: '',
    contact: '',
    phone: '',
    terms: '30 Days',
  };

  const save = async () => {
    if (!editing || !editing.name || !editing.name.trim()) {
      alert('Supplier name is required');
      return;
    }

    try {
      await mastersApi.saveSupplier(editing.id || null, {
        id: editing.id || undefined,
        name: editing.name.trim(),
        mill: editing.mill || '',
        gst: editing.gst || '',
        contact: editing.contact || '',
        phone: editing.phone || '',
        terms: editing.terms || '30 Days',
      });
      showToast('Supplier saved', `Successfully saved ${editing.name}`);
      setEditing(null);
      await load();
    } catch (err) {
      console.error('Failed to save supplier:', err);
      alert(err.response?.data?.message || 'Unable to save supplier');
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete supplier "${name}"?`)) return;
    try {
      await mastersApi.deleteSupplier(id);
      showToast('Supplier deleted', `Removed ${name}`);
      await load();
    } catch (err) {
      console.error('Failed to delete supplier:', err);
      alert(err.response?.data?.message || 'Unable to delete supplier');
    }
  };

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-sub">
            {loading ? 'Loading...' : `${suppliers.length} registered suppliers in MySQL`}
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setEditing({ ...blank })}
          >
            <Plus size={16} />
            Add supplier
          </button>
        )}
      </div>

      {isAdmin && editing && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="between" style={{ marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 650 }}>
                {editing.id ? `Edit Supplier (${editing.id})` : 'New Supplier'}
              </h3>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Supplier ID</label>
                <input
                  className="input"
                  placeholder="Auto-generated if blank (e.g. S1)"
                  value={editing.id}
                  disabled={!!suppliers.find((s) => s.id === editing.id)}
                  onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Supplier Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Suvarna Durga Paper Mill"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Associated Mill</label>
                <input
                  className="input"
                  placeholder="e.g. Suvarna Durga"
                  value={editing.mill || ''}
                  onChange={(e) => setEditing({ ...editing, mill: e.target.value })}
                />
              </div>

              <div className="field">
                <label>GSTIN</label>
                <input
                  className="input"
                  placeholder="e.g. 37AAAAA0000A1Z5"
                  value={editing.gst || ''}
                  onChange={(e) => setEditing({ ...editing, gst: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="field">
                <label>Contact Person</label>
                <input
                  className="input"
                  placeholder="e.g. Venkatesh Rao"
                  value={editing.contact || ''}
                  onChange={(e) => setEditing({ ...editing, contact: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input
                  className="input"
                  placeholder="e.g. +91 98490 12345"
                  value={editing.phone || ''}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Payment Terms</label>
                <input
                  className="input"
                  placeholder="e.g. 30 Days Credit"
                  value={editing.terms || ''}
                  onChange={(e) => setEditing({ ...editing, terms: e.target.value })}
                />
              </div>
            </div>

            <div className="btn-row mt10">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save}>
                Save supplier
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="listcard mt14">
        {loading && <div className="empty">Loading suppliers from database...</div>}
        {!loading && error && <div className="empty">{error}</div>}
        {!loading && !error && suppliers.length === 0 && (
          <div className="empty">No suppliers found in database.</div>
        )}

        {!loading &&
          !error &&
          suppliers.map((supplier) => (
            <div key={supplier.id} className="li">
              <div className="li-ico">
                <Truck size={18} />
              </div>

              <div className="li-main">
                <div className="li-title">
                  {supplier.name}
                  {supplier.gst && (
                    <span className="badge b-muted" style={{ marginLeft: '8px' }}>
                      GST: {supplier.gst}
                    </span>
                  )}
                </div>

                <div className="li-sub">
                  {supplier.contact ? `Contact: ${supplier.contact} · ` : ''}
                  {supplier.phone ? `${supplier.phone} · ` : ''}
                  Terms: {supplier.terms || '30 Days'}
                  {supplier.mill ? ` · Mill: ${supplier.mill}` : ''}
                </div>
              </div>

              {isAdmin && (
                <div className="row" style={{ gap: '8px' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Edit supplier"
                    onClick={() => setEditing({ ...supplier })}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Delete supplier"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => remove(supplier.id, supplier.name)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
export function MillsScreen() {
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  const [mills, setMills] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const response = isAdmin
        ? await mastersApi.getAllMills()
        : await mastersApi.getMills();

      setMills(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load mills:', error);

      setError(
        error.response?.data?.message ||
        'Unable to load mills from the backend.'
      );

      setMills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const blank = {
    id: '',
    name: '',
    place: '',
    grades: '',
    active: true,
  };

  const save = async () => {
    if (!editing) {
      return;
    }

    try {
      await mastersApi.saveMill(
        editing.id || null,
        {
          id: editing.id,
          name: editing.name,
          place: editing.place || '',
          grades: editing.grades || '',
          active: editing.active !== false,
        }
      );

      setEditing(null);
      await load();
    } catch (error) {
      console.error('Failed to save mill:', error);

      alert(
        error.response?.data?.message ||
        'Unable to save mill'
      );
    }
  };

  const toggleMill = async (id) => {
    try {
      await mastersApi.setMillActive(id);
      await load();
    } catch (error) {
      console.error('Failed to toggle mill:', error);

      alert(
        error.response?.data?.message ||
        'Unable to change mill status'
      );
    }
  };

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1 className="page-title">Mills</h1>
          <p className="page-sub">
            Controlled paper-mill master values
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setEditing({ ...blank })}
          >
            <Plus size={16} />
            Add mill
          </button>
        )}
      </div>

      {isAdmin && editing && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>{editing.id ? 'Edit Mill' : 'New Mill'}</h3>
            <div className="grid-2">
              <div className="field">
                <label>ID</label>
                <input
                  className="input"
                  value={editing.id}
                  disabled={!!mills.find((item) => item.id === editing.id)}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      id: event.target.value,
                    })
                  }
                />
              </div>
              <div className="field">
                <label>Name</label>
                <input
                  className="input"
                  value={editing.name}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      name: event.target.value,
                    })
                  }
                />
              </div>
              <div className="field">
                <label>Place</label>
                <input
                  className="input"
                  value={editing.place || ''}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      place: event.target.value,
                    })
                  }
                />
              </div>
              <div className="field">
                <label>Grades</label>
                <input
                  className="input"
                  value={editing.grades || ''}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      grades: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="btn-row mt10">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save}>
                Save mill
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="listcard mt14">
        {loading && (
          <div className="empty">
            Loading mills...
          </div>
        )}

        {!loading && error && (
          <div className="empty">
            {error}
          </div>
        )}

        {!loading && !error && mills.length === 0 && (
          <div className="empty">
            No mills found.
          </div>
        )}

        {!loading &&
          !error &&
          mills.map((mill) => (
            <div
              key={mill.id}
              className="li"
            >
              <div className="li-ico">
                <Building size={18} />
              </div>

              <div className="li-main">
                <div className="li-title">
                  {mill.name}

                  <span
                    className={`badge ${
                      mill.active
                        ? 'b-ok'
                        : 'b-muted'
                    }`}
                  >
                    {mill.active
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>

                <div className="li-sub">
                  {mill.place || '—'}
                  {' · '}
                  {mill.grades || '—'}
                </div>
              </div>

              {isAdmin && (
                <MasterActions
                  active={mill.active}
                  onEdit={() =>
                    setEditing({ ...mill })
                  }
                  onToggle={() =>
                    toggleMill(mill.id)
                  }
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}


export function ReelTypesScreen() {
  const { user }=useAuth(); const isAdmin=user?.role==='ADMIN';
  const [types,setTypes]=useState([]); const [editing,setEditing]=useState(null); const [loading,setLoading]=useState(true);
  const load=()=>{setLoading(true);(isAdmin?mastersApi.getAllReelTypes():mastersApi.getReelTypes()).then(r=>setTypes(r.data)).finally(()=>setLoading(false));}; useEffect(load,[isAdmin]);
  const blank={id:'',name:'',defaultGsm:120,bf:18,active:true};
  const save=async()=>{try{await mastersApi.saveReelType(editing.id||null,{...editing,defaultGsm:Number(editing.defaultGsm),bf:Number(editing.bf)});setEditing(null);load();}catch(e){alert(e.response?.data?.message||'Unable to save reel type');}};
  return (
    <div>
      <div className="page-head between">
        <div>
          <h1 className="page-title">Reel Types</h1>
          <p className="page-sub">Controlled grades with default GSM and BF</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setEditing(blank)}>
            <Plus size={16} /> Add type
          </button>
        )}
      </div>
      
      {isAdmin && editing && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>{editing.id ? 'Edit Reel Type' : 'New Reel Type'}</h3>
            <div className="grid-2">
              <div className="field">
                <label>ID</label>
                <input className="input" value={editing.id} disabled={!!types.find(x => x.id === editing.id)} onChange={e => setEditing({ ...editing, id: e.target.value })} />
              </div>
              <div className="field">
                <label>Name</label>
                <input className="input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Default GSM</label>
                <input className="input num" type="number" value={editing.defaultGsm} onChange={e => setEditing({ ...editing, defaultGsm: e.target.value })} />
              </div>
              <div className="field">
                <label>BF</label>
                <input className="input num" type="number" value={editing.bf} onChange={e => setEditing({ ...editing, bf: e.target.value })} />
              </div>
            </div>
            <div className="btn-row mt10">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save type</button>
            </div>
          </div>
        </div>
      )}

      <div className="listcard mt14">
        {loading ? (
          <div className="empty">Loading reel types...</div>
        ) : (
          types.map(t => (
            <div key={t.id} className="li">
              <div className="li-ico"><Layers size={18} /></div>
              <div className="li-main">
                <div className="li-title">
                  {t.name} <span className={`badge ${t.active ? 'b-ok' : 'b-muted'}`}>{t.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="li-sub">Default {t.defaultGsm} GSM · BF {t.bf}</div>
              </div>
              {isAdmin && (
                <MasterActions 
                  active={t.active} 
                  onEdit={() => setEditing({ ...t })} 
                  onToggle={async () => { await mastersApi.setReelTypeActive(t.id, !t.active); load(); }} 
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export function UnitsMasterScreen() {
  const { user } = useAuth();
  const { showToast } = useApp();
  const isAdmin = user?.role === 'ADMIN';
  const [units, setUnits] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    (isAdmin ? mastersApi.getAllUnits() : mastersApi.getUnits())
      .then((r) => setUnits(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        console.error('Failed to load units:', err);
        setUnits([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [isAdmin]);

  const blank = {
    id: '',
    name: '',
    code: '',
    city: '',
    stateCode: '33',
    incharge: '',
    targetReels: 0,
    targetWeight: 0,
    targetJobs: 0,
    active: true,
  };

  const save = async () => {
    if (!editing.name || !editing.name.trim()) {
      alert('Unit name is required');
      return;
    }
    if (!editing.code || !editing.code.trim()) {
      alert('Unit code is required');
      return;
    }
    if (!editing.stateCode || editing.stateCode.trim().length !== 2) {
      alert('GST state code must be 2 characters (e.g. 33 or TN)');
      return;
    }

    try {
      await mastersApi.saveUnit(editing.id || null, {
        ...editing,
        name: editing.name.trim(),
        code: editing.code.trim().toUpperCase(),
        stateCode: editing.stateCode.trim().toUpperCase(),
        targetReels: Number(editing.targetReels || 0),
        targetWeight: Number(editing.targetWeight || 0),
        targetJobs: Number(editing.targetJobs || 0),
      });
      showToast('Unit saved', `Saved unit ${editing.name}`);
      setEditing(null);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Unable to save unit');
    }
  };

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1 className="page-title">Manufacturing Units</h1>
          <p className="page-sub">Unit code, city and GST state code</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setEditing(blank)}>
            <Plus size={16} /> Add unit
          </button>
        )}
      </div>
      {isAdmin && editing && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 className="h3">{editing.id ? 'Edit Unit' : 'Add Unit'}</h3>
            <div className="grid-2 mt14">
              <div className="field">
                <label>ID</label>
                <input
                  className="input"
                  value={editing.id}
                  disabled={!!units.find((x) => x.id === editing.id)}
                  onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Name *</label>
                <input
                  className="input"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Code *</label>
                <input
                  className="input"
                  value={editing.code}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="field">
                <label>City</label>
                <input
                  className="input"
                  value={editing.city}
                  onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                />
              </div>
              <div className="field">
                <label>GST state code *</label>
                <input
                  className="input num"
                  maxLength={2}
                  value={editing.stateCode}
                  onChange={(e) => setEditing({ ...editing, stateCode: e.target.value.toUpperCase() })}
                  placeholder="33 or TN"
                />
              </div>
              <div className="field">
                <label>In-charge</label>
                <input
                  className="input"
                  value={editing.incharge || ''}
                  onChange={(e) => setEditing({ ...editing, incharge: e.target.value })}
                />
              </div>
            </div>
            <div className="btn-row mt14">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save}>
                Save unit
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="listcard mt14">
        {loading ? (
          <div className="empty">Loading units...</div>
        ) : (
          units.map((u) => (
            <div key={u.id} className="li">
              <div className="li-ico">
                <Building size={18} />
              </div>
              <div className="li-main">
                <div className="li-title">
                  {u.name} <span className={`badge ${u.active ? 'b-ok' : 'b-muted'}`}>{u.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="li-sub">
                  {u.code} · {u.city} · GST state {u.stateCode}
                </div>
              </div>
              {isAdmin && (
                <MasterActions
                  active={u.active}
                  onEdit={() => setEditing({ ...u })}
                  onToggle={async () => {
                    await mastersApi.setUnitActive(u.id);
                    showToast('Unit updated', `Toggled status for ${u.name}`);
                    load();
                  }}
                />
              )}
            </div>
          ))
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

  const handlePasswordChange = async () => {
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
  const result = await changePassword(
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

      {/* System Configuration */}
      {isAdmin && (
        <>
          <div className="sec">
            <span className="sec-title">
              System Configuration
            </span>
          </div>

          <div className="card card-pad">
            <div className="field">
              <label>Low Stock Threshold (%)</label>
              <input type="number" className="input num" defaultValue="25" />
              <div className="tiny dim">Alert when reel remaining weight drops below this percentage of original.</div>
            </div>
            
            <div className="field mt14">
              <label>Exhaustion Tolerance (kg)</label>
              <input type="number" className="input num" defaultValue="1" />
              <div className="tiny dim">Reel is considered exhausted if remaining weight is below this.</div>
            </div>

            <div className="field mt14">
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

            <div className="field mt14">
              <label>Default GST (%)</label>
              <input type="number" className="input num" defaultValue="12" />
            </div>

            <div className="field mt14">
              <label>Over-receipt Tolerance (%)</label>
              <input type="number" className="input num" defaultValue="5" />
              <div className="tiny dim">Allow goods receipt weight to exceed PO line weight by this margin.</div>
            </div>

            <div className="field mt14">
              <label>Reversal Window (hours)</label>
              <input type="number" className="input num" defaultValue="24" />
              <div className="tiny dim">Time limit for reversing a cutting job.</div>
            </div>

            <div className="field mt14">
              <label>Session Timeout (minutes)</label>
              <input type="number" className="input num" defaultValue="120" />
            </div>

            <div className="field mt14">
              <label>Decimal Precision</label>
              <div className="chips">
                <button className="chip on">3 Digits</button>
                <button className="chip">2 Digits</button>
              </div>
            </div>

            <div className="mt14 btn-row">
              <button className="btn btn-primary" onClick={() => showToast('Success', 'System configuration saved')}>
                Save Configuration
              </button>
            </div>
          </div>
        </>
      )}

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

     
