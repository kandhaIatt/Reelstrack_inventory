import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reelsApi, jobsApi } from '../api/services';

import {
  Search,
  Filter,
  Rows,
  Grid,
  Download,
  Scissors,
  ChevronRight,
  Disc,
  X,
  Plus,
} from 'lucide-react';

export default function ReelsScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // =========================================================
  // STATE
  // =========================================================

  const [reels, setReels] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [viewMode, setViewMode] = useState('table');

  const [search, setSearch] = useState(
    searchParams.get('q') || ''
  );

  // Applied filters
  const [filters, setFilters] = useState({
    unit: searchParams.get('unit') || '',
    mill: searchParams.get('mill') || '',
    type: searchParams.get('type') || '',
    width: searchParams.get('width') || '',
    status:
      searchParams.get('filterStatus') ||
      searchParams.get('status') ||
      '',
  });

  // Filter modal
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Temporary filters used inside modal
  const [tempFilters, setTempFilters] = useState({
    unit: '',
    mill: '',
    type: '',
    width: '',
    status: '',
  });

  // =========================================================
  // UNIT DISPLAY NAMES
  // Backend values remain U1, U2, etc.
  // =========================================================

  const UNIT_NAMES = {
    HO: 'Head Office',
    U1: 'Chennai Unit',
    U2: 'Bangalore Unit',
    U3: 'Hyderabad Unit',
    U4: 'Coimbatore Unit',
    U5: 'Pondicherry Unit',
    U6: 'Madurai Unit',
    U7: 'Unit 7',
  };

  const UNIT_ORDER = [
    'HO',
    'U1',
    'U2',
    'U3',
    'U4',
    'U5',
    'U6',
    'U7',
  ];

  const getUnitName = (unitId) => {
    if (!unitId) {
      return '—';
    }

    const key = String(unitId).toUpperCase();

    return UNIT_NAMES[key] || unitId;
  };

  // =========================================================
  // LOAD REELS + JOBS
  // User can see reels/jobs from all units.
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setLoadingJobs(true);

      try {
        const [reelsResponse, jobsResponse] =
          await Promise.all([
            reelsApi.getAll(),
            jobsApi.getAll(),
          ]);

        if (!mounted) {
          return;
        }

        setReels(
          Array.isArray(reelsResponse.data)
            ? reelsResponse.data
            : []
        );

        setJobs(
          Array.isArray(jobsResponse.data)
            ? jobsResponse.data
            : []
        );
      } catch (error) {
        console.error(
          'Failed to load reel inventory:',
          error
        );

        if (mounted) {
          setReels([]);
          setJobs([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingJobs(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // FORMATTERS
  // =========================================================

  const n0 = (value) =>
    Math.round(Number(value || 0)).toLocaleString(
      'en-IN'
    );

  const n2 = (value) =>
    Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // =========================================================
  // JOB HELPERS
  // =========================================================

  const jobsForReel = (reelId) => {
    return jobs.filter(
      (job) =>
        String(job.reel || '').toUpperCase() ===
        String(reelId || '').toUpperCase()
    );
  };

  const jobCountForReel = (reelId) => {
    return jobsForReel(reelId).length;
  };

  const completedJobsForReel = (reelId) => {
    return jobsForReel(reelId).filter(
      (job) => job.status === 'Completed'
    );
  };

  const consumedFromJobs = (reelId) => {
    return completedJobsForReel(reelId).reduce(
      (sum, job) => sum + Number(job.kg || 0),
      0
    );
  };

  // =========================================================
  // REMAINING WEIGHT
  // =========================================================

  const getRemaining = (reel) => {
    if (
      reel?.remaining !== undefined &&
      reel?.remaining !== null &&
      reel?.remaining !== ''
    ) {
      return Math.max(
        0,
        Number(reel.remaining)
      );
    }

    const original = Number(
      reel?.orig || 0
    );

    return Math.max(
      0,
      original -
        consumedFromJobs(reel?.id)
    );
  };

  // =========================================================
  // STATUS
  // Exhausted / Low Stock / In Use / Available
  // =========================================================

  const getStatus = (reel) => {
    if (reel?.status === 'WRITTEN_OFF') return 'Written Off';
    if (reel?.status === 'ON_HOLD') return 'On Hold';
    if (reel?.status === 'IN_TRANSIT') return 'In Transit';

    const remaining = getRemaining(reel);
    const jobCount = jobCountForReel(reel?.id);

    if (remaining <= 0) {
      return 'Exhausted';
    }

    if (remaining < 40) {
      return 'Low Stock';
    }

    if (jobCount > 0) {
      return 'In Use';
    }

    return 'Available';
  };

  // =========================================================
  // FILTER OPTIONS
  // =========================================================

  const units = useMemo(() => {
    const availableUnits = new Set(
      reels
        .map((reel) => reel?.unit)
        .filter(Boolean)
        .map((unit) =>
          String(unit).toUpperCase()
        )
    );

    return UNIT_ORDER.filter((unit) =>
      availableUnits.has(unit)
    );
  }, [reels]);

  const mills = useMemo(() => {
    const values = Array.from(
      new Set(
        reels
          .map((reel) => reel?.mill)
          .filter(Boolean)
      )
    );

    const preferredOrder = [
      'Suvarna Durga',
      'ABC Papers',
      'Sri Lakshmi Papers',
      'Tamil Nadu Kraft',
      'South India Paper Mills',
      'Gold Mill',
      'Karnan',
      'Kattabomman',
    ];

    return values.sort((a, b) => {
      const ai = preferredOrder.indexOf(a);
      const bi = preferredOrder.indexOf(b);

      if (ai !== -1 && bi !== -1) {
        return ai - bi;
      }

      if (ai !== -1) {
        return -1;
      }

      if (bi !== -1) {
        return 1;
      }

      return String(a).localeCompare(
        String(b)
      );
    });
  }, [reels]);

  const reelTypes = useMemo(() => {
    const values = Array.from(
      new Set(
        reels
          .map((reel) => reel?.type)
          .filter(Boolean)
      )
    );

    const preferredOrder = [
      'Kraft',
      'Semi-Kraft',
      'Duplex Board',
      'Test Liner',
      'Golden Kraft',
      'Duplex',
    ];

    return values.sort((a, b) => {
      const ai = preferredOrder.indexOf(a);
      const bi = preferredOrder.indexOf(b);

      if (ai !== -1 && bi !== -1) {
        return ai - bi;
      }

      if (ai !== -1) {
        return -1;
      }

      if (bi !== -1) {
        return 1;
      }

      return String(a).localeCompare(
        String(b)
      );
    });
  }, [reels]);

  const widths = useMemo(() => {
    return Array.from(
      new Set(
        reels
          .map((reel) =>
            Number(reel?.width)
          )
          .filter((width) =>
            Number.isFinite(width)
          )
      )
    ).sort((a, b) => a - b);
  }, [reels]);

  // =========================================================
  // ACTIVE FILTER COUNT
  // =========================================================

  const activeFilterCount = [
    filters.unit,
    filters.mill,
    filters.type,
    filters.width,
    filters.status,
  ].filter(Boolean).length;

  // =========================================================
  // FILTER REELS
  // =========================================================

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return reels.filter((reel) => {
      if (
        q &&
        !(
          String(reel?.id || '')
            .toLowerCase()
            .includes(q) ||
          String(reel?.mill || '')
            .toLowerCase()
            .includes(q) ||
          String(reel?.type || '')
            .toLowerCase()
            .includes(q)
        )
      ) {
        return false;
      }

      if (
        filters.unit &&
        String(reel?.unit).toUpperCase() !==
          String(filters.unit).toUpperCase()
      ) {
        return false;
      }

      if (
        filters.mill &&
        String(reel?.mill) !==
          String(filters.mill)
      ) {
        return false;
      }

      if (
        filters.type &&
        String(reel?.type) !==
          String(filters.type)
      ) {
        return false;
      }

      if (
        filters.width &&
        Number(reel?.width) !==
          Number(filters.width)
      ) {
        return false;
      }

      const status = getStatus(reel);

      if (
        filters.status &&
        status !== filters.status
      ) {
        return false;
      }

      return true;
    });
  }, [
    reels,
    jobs,
    search,
    filters,
  ]);

  // =========================================================
  // TOTAL AVAILABLE KG
  // =========================================================

  const totalAvailKg = filtered.reduce(
    (sum, reel) =>
      sum + getRemaining(reel),
    0
  );

  // =========================================================
  // URL SYNC
  // =========================================================

  const syncUrl = (
    nextFilters = filters,
    nextSearch = search
  ) => {
    const params = new URLSearchParams();

    if (nextSearch) {
      params.set('q', nextSearch);
    }

    if (nextFilters.unit) {
      params.set(
        'unit',
        nextFilters.unit
      );
    }

    if (nextFilters.mill) {
      params.set(
        'mill',
        nextFilters.mill
      );
    }

    if (nextFilters.type) {
      params.set(
        'type',
        nextFilters.type
      );
    }

    if (nextFilters.width) {
      params.set(
        'width',
        nextFilters.width
      );
    }

    if (nextFilters.status) {
      params.set(
        'filterStatus',
        nextFilters.status
      );
    }

    setSearchParams(params);
  };

  const handleSearchChange = (value) => {
    setSearch(value);

    syncUrl(
      filters,
      value
    );
  };

  const handleStatusChange = (status) => {
    const nextFilters = {
      ...filters,
      status,
    };

    setFilters(nextFilters);

    syncUrl(
      nextFilters,
      search
    );
  };

  const openFilters = () => {
    setTempFilters({
      ...filters,
    });

    setShowFilterModal(true);
  };

  const closeFilters = () => {
    setShowFilterModal(false);

    setTempFilters({
      ...filters,
    });
  };

  const applyFilters = () => {
    const nextFilters = {
      ...tempFilters,
    };

    setFilters(nextFilters);

    syncUrl(
      nextFilters,
      search
    );

    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const cleared = {
      unit: '',
      mill: '',
      type: '',
      width: '',
      status: '',
    };

    setFilters(cleared);
    setTempFilters(cleared);

    syncUrl(
      cleared,
      search
    );

    setShowFilterModal(false);
  };

  const getBadgeClass = (status) => {
    if (status === 'Low Stock') {
      return 'b-warn';
    }

    if (status === 'Exhausted') {
      return 'b-muted';
    }

    if (status === 'In Use') {
      return 'b-info';
    }

    return 'b-ok';
  };

  const getBarClass = (status) => {
    if (status === 'Low Stock') {
      return 'warn';
    }

    if (status === 'Exhausted') {
      return 'danger';
    }

    return 'ok';
  };

  const getRemainingColor = (status) => {
    if (status === 'Low Stock') {
      return 'var(--warn)';
    }

    if (status === 'Exhausted') {
      return 'var(--danger)';
    }

    return 'var(--ok)';
  };

  const FilterChip = ({
    label,
    selected,
    onClick,
  }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        border:
          '1px solid var(--border, #dbe5ea)',
        background: selected
          ? '#0d3038'
          : '#ffffff',
        color: selected
          ? '#ffffff'
          : '#405968',
        borderRadius: '999px',
        padding: '8px 14px',
        minHeight: '38px',
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: 1,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition:
          'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="page-head">
        <div className="between wrap">
          <div>
            <h1 className="page-title">
              Reel Inventory
            </h1>

            <p className="page-sub">
              {filtered.length} reels ·{' '}
              {n0(totalAvailKg)} kg available
            </p>
          </div>

          <div className="btn-row">
            <button
              className="btn btn-sm btn-ghost"
            >
              <Download size={15} />
              Export
            </button>

            {user?.role === 'ADMIN' && (
              <>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => navigate('/reels/add')}
                >
                  <Plus size={15} /> Add Reel
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => navigate('/reels/bulk-add')}
                >
                  <Plus size={15} /> Bulk Add
                </button>
              </>
            )}

            <button
              className="btn btn-sm btn-primary"
              onClick={() =>
                navigate('/jobs/new')
              }
            >
              <Scissors size={15} />
              New job
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="searchbar">
          <span className="ico">
            <Search size={17} />
          </span>

          <input
            className="input"
            placeholder="Search reel, mill or type"
            value={search}
            onChange={(e) =>
              handleSearchChange(
                e.target.value
              )
            }
          />
        </div>

        <button
          className="icon-btn"
          aria-label="Filter"
          onClick={openFilters}
          style={{
            position: 'relative',
          }}
        >
          <Filter size={18} />

          {activeFilterCount > 0 && (
            <span className="count">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="seg-view">
          <button
            className={
              viewMode === 'table'
                ? 'on'
                : ''
            }
            onClick={() =>
              setViewMode('table')
            }
          >
            <Rows size={14} />
            Table
          </button>

          <button
            className={
              viewMode === 'cards'
                ? 'on'
                : ''
            }
            onClick={() =>
              setViewMode('cards')
            }
          >
            <Grid size={14} />
            Cards
          </button>
        </div>
      </div>

      <div className="chip-scroll mt14">
        {[
          'All',
          'Available',
          'In Use',
          'Low Stock',
          'Exhausted',
        ].map((status) => {
          const selected =
            status === 'All'
              ? !filters.status
              : filters.status === status;

          return (
            <button
              key={status}
              className={`chip ${
                selected ? 'on' : ''
              }`}
              onClick={() =>
                handleStatusChange(
                  status === 'All'
                    ? ''
                    : status
                )
              }
            >
              {status}
            </button>
          );
        })}
      </div>

      {activeFilterCount > 0 && (
        <div
          className="mt10"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span className="tiny muted">
            Filters:
          </span>

          {filters.unit && (
            <span className="chip on">
              Unit: {getUnitName(filters.unit)}
            </span>
          )}

          {filters.mill && (
            <span className="chip on">
              Mill: {filters.mill}
            </span>
          )}

          {filters.type && (
            <span className="chip on">
              Type: {filters.type}
            </span>
          )}

          {filters.width && (
            <span className="chip on">
              Width: {filters.width} cm
            </span>
          )}

          {filters.status && (
            <span className="chip on">
              Status: {filters.status}
            </span>
          )}

          <button
            className="btn btn-sm btn-ghost"
            onClick={clearFilters}
          >
            Clear all
          </button>
        </div>
      )}

      <div className="mt14">
        {loading || loadingJobs ? (
          <div className="empty">
            Loading inventory...
          </div>
        ) : !filtered.length ? (
          <div className="empty">
            <div className="ei">
              <Disc size={24} />
            </div>

            <div className="et">
              No reels match
            </div>

            <div className="es">
              Try clearing search or filters
            </div>

            {(activeFilterCount > 0 ||
              search) && (
              <button
                className="btn btn-sm btn-ghost mt10"
                onClick={() => {
                  setSearch('');

                  const cleared = {
                    unit: '',
                    mill: '',
                    type: '',
                    width: '',
                    status: '',
                  };

                  setFilters(cleared);
                  setTempFilters(cleared);

                  syncUrl(
                    cleared,
                    ''
                  );
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Reel No</th>
                  <th>Type</th>
                  <th>GSM/BF</th>
                  <th>Width</th>
                  <th>Mill</th>
                  <th>Unit</th>
                  <th className="r">
                    Original
                  </th>
                  <th className="r">
                    Remaining
                  </th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th className="r">
                    Jobs
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((reel) => {
                  const status =
                    getStatus(reel);

                  const remaining =
                    getRemaining(reel);

                  const original =
                    Number(
                      reel?.orig || 0
                    );

                  const consumed =
                    Math.max(
                      0,
                      original -
                        remaining
                    );

                  const jobCount =
                    jobCountForReel(
                      reel?.id
                    );

                  const percentage =
                    original > 0
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            (consumed /
                              original) *
                              100
                          )
                        )
                      : 0;

                  return (
                    <tr
                      key={reel.id}
                      onClick={() =>
                        navigate(
                          `/reels/${reel.id}`
                        )
                      }
                    >
                      <td className="id num">
                        {reel.id}
                      </td>

                      <td>
                        {reel.type}
                      </td>

                      <td>
                        {reel.gsm} GSM{' '}
                        {reel.bf
                          ? `· BF ${reel.bf}`
                          : ''}
                      </td>

                      <td className="num">
                        {reel.width} cm
                      </td>

                      <td>
                        {reel.mill}
                      </td>

                      <td>
                        {getUnitName(
                          reel.unit
                        )}
                      </td>

                      <td className="r num">
                        {n0(reel.orig)}
                      </td>

                      <td
                        className="r num"
                        style={{
                          fontWeight: 660,
                          color:
                            getRemainingColor(
                              status
                            ),
                        }}
                      >
                        {n2(remaining)}
                      </td>

                      <td>
                        <span className="bar">
                          <i
                            className={getBarClass(
                              status
                            )}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </span>

                        <div className="dim">
                          {Math.round(
                            percentage
                          )}
                          % used ·{' '}
                          {n0(consumed)} kg
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${getBadgeClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="r num">
                        {jobCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="tbl-foot">
              <span>
                {filtered.length} reels
              </span>

              <span className="num">
                {n0(totalAvailKg)} kg
                available
              </span>
            </div>
          </div>
        ) : (
          <div className="list-grid">
            {filtered.map((reel) => {
              const status =
                getStatus(reel);

              const remaining =
                getRemaining(reel);

              const original =
                Number(
                  reel?.orig || 0
                );

              const consumed =
                Math.max(
                  0,
                  original -
                    remaining
                );

              const jobCount =
                jobCountForReel(
                  reel?.id
                );

              const percentage =
                original > 0
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        (consumed /
                          original) *
                          100
                      )
                    )
                  : 0;

              return (
                <div
                  key={reel.id}
                  className="card tap"
                  onClick={() =>
                    navigate(
                      `/reels/${reel.id}`
                    )
                  }
                >
                  <div className="card-pad">
                    <div className="reel-head">
                      <div>
                        <div className="reel-no num">
                          {reel.id}
                        </div>

                        <div className="reel-meta">
                          {reel.type} ·{' '}
                          {reel.gsm} GSM ·{' '}
                          {reel.width} cm
                        </div>

                        <div className="reel-meta">
                          {reel.mill}
                        </div>
                      </div>

                      <span
                        className={`badge ${getBadgeClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="wt-row">
                      <div className="wt">
                        <div className="k">
                          Original
                        </div>

                        <div className="v num">
                          {n0(original)}
                          <small>
                            kg
                          </small>
                        </div>
                      </div>

                      <div className="wt">
                        <div className="k">
                          Remaining
                        </div>

                        <div
                          className="v num"
                          style={{
                            color:
                              getRemainingColor(
                                status
                              ),
                          }}
                        >
                          {n2(remaining)}
                          <small>
                            kg
                          </small>
                        </div>
                      </div>

                      <div className="wt">
                        <div className="k">
                          Unit
                        </div>

                        <div className="v">
                          {getUnitName(
                            reel.unit
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bar mt10">
                      <i
                        className={getBarClass(
                          status
                        )}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className="between mt8 tiny muted">
                      <span>
                        Consumed{' '}
                        {n2(consumed)} kg
                      </span>

                      <span>
                        {jobCount}{' '}
                        {jobCount === 1
                          ? 'job'
                          : 'jobs'}
                      </span>
                    </div>
                  </div>

                  <div className="card-foot">
                    <span>
                      Received{' '}
                      {reel.rec || '—'}
                    </span>

                    <span className="link">
                      View details
                      <ChevronRight
                        size={13}
                      />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showFilterModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-reels-title"
          onClick={closeFilters}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background:
              'rgba(15, 32, 40, 0.52)',
            backdropFilter:
              'blur(3px)',
            WebkitBackdropFilter:
              'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: '100%',
              maxWidth: '670px',
              maxHeight:
                'calc(100vh - 48px)',
              background: '#ffffff',
              borderRadius: '18px',
              boxShadow:
                '0 24px 70px rgba(0, 0, 0, 0.24)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding:
                  '22px 24px',
                borderBottom:
                  '1px solid #e7edf0',
                flexShrink: 0,
              }}
            >
              <h2
                id="filter-reels-title"
                style={{
                  margin: 0,
                  color: '#12232e',
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Filter reels
              </h2>

              <button
                type="button"
                aria-label="Close filter"
                onClick={closeFilters}
                style={{
                  width: '42px',
                  height: '42px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#f7fafb',
                  color: '#3e5663',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding:
                  '24px 24px 22px',
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
              }}
            >
              <div
                style={{
                  marginBottom: '22px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing:
                      '1.4px',
                    color: '#738b98',
                    marginBottom:
                      '11px',
                  }}
                >
                  UNIT
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '9px',
                  }}
                >
                  <FilterChip
                    label="Any"
                    selected={
                      !tempFilters.unit
                    }
                    onClick={() =>
                      setTempFilters(
                        (prev) => ({
                          ...prev,
                          unit: '',
                        })
                      )
                    }
                  />

                  {units.map((unit) => (
                    <FilterChip
                      key={unit}
                      label={getUnitName(
                        unit
                      )}
                      selected={
                        tempFilters.unit ===
                        unit
                      }
                      onClick={() =>
                        setTempFilters(
                          (prev) => ({
                            ...prev,
                            unit,
                          })
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginBottom: '22px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing:
                      '1.4px',
                    color: '#738b98',
                    marginBottom:
                      '11px',
                  }}
                >
                  MILL
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '9px',
                  }}
                >
                  <FilterChip
                    label="Any"
                    selected={
                      !tempFilters.mill
                    }
                    onClick={() =>
                      setTempFilters(
                        (prev) => ({
                          ...prev,
                          mill: '',
                        })
                      )
                    }
                  />

                  {mills.map((mill) => (
                    <FilterChip
                      key={mill}
                      label={mill}
                      selected={
                        tempFilters.mill ===
                        mill
                      }
                      onClick={() =>
                        setTempFilters(
                          (prev) => ({
                            ...prev,
                            mill,
                          })
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginBottom: '22px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing:
                      '1.4px',
                    color: '#738b98',
                    marginBottom:
                      '11px',
                  }}
                >
                  REEL TYPE
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '9px',
                  }}
                >
                  <FilterChip
                    label="Any"
                    selected={
                      !tempFilters.type
                    }
                    onClick={() =>
                      setTempFilters(
                        (prev) => ({
                          ...prev,
                          type: '',
                        })
                      )
                    }
                  />

                  {reelTypes.map((type) => (
                    <FilterChip
                      key={type}
                      label={type}
                      selected={
                        tempFilters.type ===
                        type
                      }
                      onClick={() =>
                        setTempFilters(
                          (prev) => ({
                            ...prev,
                            type,
                          })
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginBottom: '22px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing:
                      '1.4px',
                    color: '#738b98',
                    marginBottom:
                      '11px',
                  }}
                >
                  REEL WIDTH
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '9px',
                  }}
                >
                  <FilterChip
                    label="Any"
                    selected={
                      !tempFilters.width
                    }
                    onClick={() =>
                      setTempFilters(
                        (prev) => ({
                          ...prev,
                          width: '',
                        })
                      )
                    }
                  />

                  {widths.map((width) => (
                    <FilterChip
                      key={width}
                      label={`${width} cm`}
                      selected={
                        String(
                          tempFilters.width
                        ) ===
                        String(width)
                      }
                      onClick={() =>
                        setTempFilters(
                          (prev) => ({
                            ...prev,
                            width:
                              String(width),
                          })
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing:
                      '1.4px',
                    color: '#738b98',
                    marginBottom:
                      '11px',
                  }}
                >
                  STATUS
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '9px',
                  }}
                >
                  <FilterChip
                    label="Any"
                    selected={
                      !tempFilters.status
                    }
                    onClick={() =>
                      setTempFilters(
                        (prev) => ({
                          ...prev,
                          status: '',
                        })
                      )
                    }
                  />

                  {[
                    'Available',
                    'In Use',
                    'Low Stock',
                    'Exhausted',
                  ].map((status) => (
                    <FilterChip
                      key={status}
                      label={status}
                      selected={
                        tempFilters.status ===
                        status
                      }
                      onClick={() =>
                        setTempFilters(
                          (prev) => ({
                            ...prev,
                            status,
                          })
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding:
                  '16px 24px 20px',
                borderTop:
                  '1px solid #e7edf0',
                background:
                  '#f8fafb',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  flex: 1,
                  height: '50px',
                  border:
                    '1px solid #dbe5ea',
                  borderRadius: '12px',
                  background:
                    '#ffffff',
                  color: '#405968',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={applyFilters}
                style={{
                  flex: 1,
                  height: '50px',
                  border: 'none',
                  borderRadius: '12px',
                  background:
                    '#12899b',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow:
                    '0 5px 12px rgba(18, 137, 155, 0.20)',
                }}
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
