import React, { useEffect, useMemo, useState } from 'react';
import {
  Factory,
  Search,
  Eye,
  Plus,
  Pencil,
  Power,
} from 'lucide-react';

import { mastersApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function UnitsScreen() {
  const { user } = useAuth();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    name: '',
    code: '',
    city: '',
    stateCode: '',
    incharge: '',
    targetJobs: '',
    targetReels: '',
    targetWeight: '',
  });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await mastersApi.getUnits();

      setUnits(response.data || []);
    } catch (err) {
      console.error('Failed to load units:', err);

      setError(
        err.response?.data?.message ||
        'Unable to load manufacturing units.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      code: '',
      city: '',
      stateCode: '',
      incharge: '',
      targetJobs: '',
      targetReels: '',
      targetWeight: '',
    });

    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  const openCreate = () => {
    setEditingId(null);

    setForm({
      name: '',
      code: '',
      city: '',
      stateCode: '',
      incharge: '',
      targetJobs: '',
      targetReels: '',
      targetWeight: '',
    });

    setFormError('');
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const openEdit = (unit) => {
    setEditingId(unit.id);

    setForm({
      name: unit.name || '',
      code: unit.code || unit.id || '',
      city: unit.city || '',
      stateCode: unit.stateCode || '',
      incharge: unit.incharge || '',
      targetJobs: unit.targetJobs ?? '',
      targetReels: unit.targetReels ?? '',
      targetWeight: unit.targetWeight ?? '',
    });

    setFormError('');
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError('');

    if (!form.name.trim()) {
      setFormError('Unit name is required.');
      return;
    }

    if (!form.code.trim()) {
      setFormError('Unit code is required.');
      return;
    }

    if (!form.city.trim()) {
      setFormError('City is required.');
      return;
    }

    if (!form.stateCode.trim()) {
      setFormError('State code is required.');
      return;
    }

    const targetJobs =
      form.targetJobs === ''
        ? null
        : Number(form.targetJobs);

    const targetReels =
      form.targetReels === ''
        ? null
        : Number(form.targetReels);

    const targetWeight =
      form.targetWeight === ''
        ? null
        : Number(form.targetWeight);

    if (
      targetJobs !== null &&
      (Number.isNaN(targetJobs) || targetJobs < 0)
    ) {
      setFormError('Target jobs cannot be negative.');
      return;
    }

    if (
      targetReels !== null &&
      (Number.isNaN(targetReels) || targetReels < 0)
    ) {
      setFormError('Target reels cannot be negative.');
      return;
    }

    if (
      targetWeight !== null &&
      (Number.isNaN(targetWeight) || targetWeight < 0)
    ) {
      setFormError('Target weight cannot be negative.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      city: form.city.trim(),
      stateCode: form.stateCode.trim().toUpperCase(),
      incharge: form.incharge.trim(),
      targetJobs,
      targetReels,
      targetWeight,
    };

    try {
      if (editingId) {
        const response = await mastersApi.updateUnit(
          editingId,
          payload
        );

        setUnits((current) =>
          current.map((unit) =>
            unit.id === editingId
              ? response.data
              : unit
          )
        );
      } else {
        const response = await mastersApi.createUnit(
          payload
        );

        setUnits((current) => [
          ...current,
          response.data,
        ]);
      }

      resetForm();
    } catch (err) {
      console.error('Unit save failed:', err);

      setFormError(
        err.response?.data?.message ||
        'Unable to save unit. Please try again.'
      );
    }
  };

  const handleToggleActive = async (unit) => {
    try {
      const response =
        await mastersApi.setUnitActive(
          unit.id,
          !unit.active
        );

      setUnits((current) =>
        current.map((item) =>
          item.id === unit.id
            ? response.data
            : item
        )
      );
    } catch (err) {
      console.error(
        'Unit status update failed:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Unable to change unit status.'
      );
    }
  };

  const filteredUnits = useMemo(() => {
    const q = search.trim().toLowerCase();

    return units.filter((unit) => {
      const matchesSearch =
        !q ||
        String(unit.id || '')
          .toLowerCase()
          .includes(q) ||
        String(unit.name || '')
          .toLowerCase()
          .includes(q) ||
        String(unit.code || '')
          .toLowerCase()
          .includes(q) ||
        String(unit.city || '')
          .toLowerCase()
          .includes(q) ||
        String(unit.stateCode || '')
          .toLowerCase()
          .includes(q) ||
        String(unit.incharge || '')
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        !status ||
        (status === 'active' &&
          unit.active === true) ||
        (status === 'inactive' &&
          unit.active === false);

      return matchesSearch && matchesStatus;
    });
  }, [units, search, status]);

  const activeCount = units.filter(
    (unit) => unit.active === true
  ).length;

  const inactiveCount = units.filter(
    (unit) => unit.active === false
  ).length;

  const handleView = (unit) => {
    window.location.href = `/units/${unit.id}`;
  };

  return (
    <div className="units-page">

      {/* Page Header */}
      <div className="page-head between">
        <div>
          <h1 className="page-title">
            Manufacturing Units
          </h1>

          <p className="page-sub">
            {units.length} manufacturing units
            {' · '}
            {activeCount} active
            {inactiveCount > 0 &&
              ` · ${inactiveCount} inactive`}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreate}
          >
            <Plus size={17} />
            Add Unit
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="units-alert">
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
      {isAdmin && showForm && (
        <div
          className="card card-pad"
          style={{ marginBottom: '14px' }}
        >
          <div
            className="between"
            style={{ marginBottom: '16px' }}
          >
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                {editingId
                  ? 'Edit Unit'
                  : 'Add New Unit'}
              </div>

              <div className="tiny muted">
                {editingId
                  ? 'Update unit information.'
                  : 'Add a new manufacturing unit.'}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={resetForm}
            >
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
                <label>Unit Name *</label>

                <input
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Example: Chennai Unit"
                  required
                />
              </div>

              <div className="field">
                <label>Unit Code *</label>

                <input
                  className="input"
                  value={form.code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      code: e.target.value
                        .toUpperCase(),
                    })
                  }
                  placeholder="Example: U7"
                  required
                />
              </div>

              <div className="field">
                <label>City *</label>

                <input
                  className="input"
                  value={form.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      city: e.target.value,
                    })
                  }
                  placeholder="Example: Chennai"
                  required
                />
              </div>

              <div className="field">
                <label>State Code *</label>

                <input
                  className="input"
                  value={form.stateCode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stateCode: e.target.value
                        .toUpperCase(),
                    })
                  }
                  placeholder="Example: TN"
                  maxLength={10}
                  required
                />
              </div>

              <div className="field">
                <label>In-Charge</label>

                <input
                  className="input"
                  value={form.incharge}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      incharge: e.target.value,
                    })
                  }
                  placeholder="Enter in-charge name"
                />
              </div>

              <div className="field">
                <label>Target Jobs</label>

                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.targetJobs}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetJobs: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="field">
                <label>Target Reels</label>

                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.targetReels}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetReels: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="field">
                <label>Target Weight (kg)</label>

                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.targetWeight}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetWeight: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

            </div>

            <div
              className="btn-row"
              style={{ marginTop: '8px' }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingId
                  ? 'Save Changes'
                  : 'Create Unit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search / Filter */}
      <div
        className="card card-pad"
        style={{ marginBottom: '14px' }}
      >
        <div className="grid-2">

          <div className="field">
            <label>Search Units</label>

            <input
              className="input"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by unit, code, city or state"
            />
          </div>

          <div className="field">
            <label>Status</label>

            <select
              className="select"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="">
                All status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

        </div>
      </div>

      {/* Unit List */}
      <div className="units-card">

        {loading ? (
          <div className="units-empty">
            Loading manufacturing units...
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="units-empty">
            <Factory size={28} />

            <div>
              {units.length === 0
                ? 'No manufacturing units found.'
                : 'No units match your search or filter.'}
            </div>
          </div>
        ) : (
          <div className="units-table-wrap">

            <table className="tbl" style={{ tableLayout: 'fixed', width: '100%' }}>

              <thead>
                <tr>
                  <th style={{ width: '15%' }}>UNIT</th>
                  <th style={{ width: '10%' }}>CODE</th>
                  <th style={{ width: '10%' }}>CITY</th>
                  <th style={{ width: '10%' }}>STATE</th>
                  <th style={{ width: '15%' }}>IN-CHARGE</th>
                  <th style={{ width: '10%' }} className="r">TARGET JOBS</th>
                  <th style={{ width: '10%' }} className="r">TARGET REELS</th>
                  <th style={{ width: '10%' }} className="r">TARGET WEIGHT</th>
                  <th style={{ width: '5%' }}>STATUS</th>
                  <th style={{ width: '5%' }}>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {filteredUnits.map((unit) => (

                  <tr key={unit.id}>

                    <td>
                      <div className="unit-main">

                        <div className="unit-icon">
                          <Factory size={17} />
                        </div>

                        <div>
                          <div className="unit-name">
                            {unit.name ||
                              unit.id}
                          </div>

                          <div className="unit-id">
                            {unit.id}
                          </div>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="unit-code">
                        {unit.code || '-'}
                      </span>
                    </td>

                    <td>
                      {unit.city || '-'}
                    </td>

                    <td>
                      {unit.stateCode || '-'}
                    </td>

                    <td>
                      {unit.incharge || '-'}
                    </td>

                    <td className="r">
                      {unit.targetJobs ?? '-'}
                    </td>

                    <td className="r">
                      {unit.targetReels ?? '-'}
                    </td>

                    <td className="r">
                      {unit.targetWeight != null
                        ? `${Number(
                            unit.targetWeight
                          ).toLocaleString(
                            'en-IN'
                          )} kg`
                        : '-'}
                    </td>

                    <td>

                      <span
                        className={
                          unit.active
                            ? 'unit-status active'
                            : 'unit-status inactive'
                        }
                      >
                        {unit.active
                          ? 'Active'
                          : 'Inactive'}
                      </span>

                    </td>

                    <td>

                      <div
                        className="row"
                        style={{
                          gap: '6px',
                        }}
                      >

                        <button
                          type="button"
                          className="icon-btn"
                          title="View unit"
                          onClick={() =>
                            handleView(unit)
                          }
                        >
                          <Eye size={16} />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Edit unit"
                              onClick={() =>
                                openEdit(unit)
                              }
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              className="icon-btn"
                              title={
                                unit.active
                                  ? 'Deactivate unit'
                                  : 'Activate unit'
                              }
                              onClick={() =>
                                handleToggleActive(
                                  unit
                                )
                              }
                            >
                              <Power size={16} />
                            </button>
                          </>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}
