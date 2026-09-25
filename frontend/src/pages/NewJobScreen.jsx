import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  RotateCcw,
  Scissors,
  Search,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { reelsApi, jobsApi } from '../api/services';

export default function NewJobScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast, openSheet, closeSheet } = useApp();

  const openSheetCompat = (config) => {
    if (!config) return;
    openSheet?.(config.title, config.content, config.footer);
  };

  const [reelId, setReelId] = useState(
    searchParams.get('reelId') || ''
  );

  const [search, setSearch] = useState('');

  const [w, setW] = useState(80);
  const [l, setL] = useState(63);
  const [gsm, setGsm] = useState(120);
  const [sheets, setSheets] = useState(3000);

  const [corr, setCorr] = useState(true);
  const [f, setF] = useState(0.45);

  const [calc, setCalc] = useState(null);
  const [reel, setReel] = useState(null);
  const [reelsList, setReelsList] = useState([]);

  const [loadingReels, setLoadingReels] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [planningSplit, setPlanningSplit] = useState(false);

  const n0 = (value) =>
    Math.round(Number(value || 0)).toLocaleString('en-IN');

  const n2 = (value) =>
    Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const n3 = (value) =>
    Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

  useEffect(() => {
    let mounted = true;

    const loadReels = async () => {
      setLoadingReels(true);

      try {
        const response = await reelsApi.getAll();

        if (mounted) {
          setReelsList(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load reels:', error);

        if (mounted) {
          setReelsList([]);

          showToast?.(
            error.response?.data?.message ||
              'Unable to load reel inventory.',
            'error'
          );
        }
      } finally {
        if (mounted) {
          setLoadingReels(false);
        }
      }
    };

    loadReels();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  useEffect(() => {
    if (!reelId) {
      setReel(null);
      return;
    }

    const selected = reelsList.find(
      (item) =>
        String(item.id || '').toUpperCase() ===
        String(reelId || '').trim().toUpperCase()
    );

    setReel(selected || null);

    if (selected?.gsm) {
      setGsm(selected.gsm);
    }
  }, [reelId, reelsList]);

  const availableReels = useMemo(() => {
    return reelsList.filter((item) => {
      const remaining = Number(item.remaining ?? 0);

      return remaining > 0;
    });
  }, [reelsList]);

  const filteredReels = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return availableReels;
    }

    return availableReels.filter((item) => {
      return (
        String(item.id || '')
          .toLowerCase()
          .includes(query) ||
        String(item.unit || '')
          .toLowerCase()
          .includes(query) ||
        String(item.type || '')
          .toLowerCase()
          .includes(query) ||
        String(item.mill || '')
          .toLowerCase()
          .includes(query)
      );
    });
  }, [availableReels, search]);

  const buildPayload = () => ({
    reelId: reelId.trim(),
    w: Number(w),
    l: Number(l),
    gsm: Number(gsm),
    sheets: Number(sheets),
    corr,
    f: Number(f),
  });

  const validateInputs = ({
    requireReel = true,
  } = {}) => {
    if (requireReel && !reelId.trim()) {
      showToast?.('Please select a reel.', 'error');
      return false;
    }

    if (!w || Number(w) <= 0) {
      showToast?.('Please enter a valid cutting width.', 'error');
      return false;
    }

    if (!l || Number(l) <= 0) {
      showToast?.('Please enter a valid cutting length.', 'error');
      return false;
    }

    if (!gsm || Number(gsm) <= 0) {
      showToast?.('Please enter a valid GSM.', 'error');
      return false;
    }

    if (!sheets || Number(sheets) <= 0) {
      showToast?.('Please enter a valid number of sheets.', 'error');
      return false;
    }

    if (Number(f) < 0 || Number(f) > 1) {
      showToast?.(
        'Corrugation factor must be between 0 and 1.',
        'error'
      );
      return false;
    }

    return true;
  };

  const handleCalculate = async () => {
    if (!validateInputs()) {
      return;
    }

    setCalculating(true);

    try {
      const response = await jobsApi.calculate(
        buildPayload()
      );

      const result = response.data;

      setCalc(result);

      if (result?.isOk === false) {
        showToast?.(
          result?.message ||
            'The job cannot be completed with the selected reel.',
          'error'
        );

        return;
      }

      showToast?.(
        'Job calculation completed.',
        'success'
      );
    } catch (error) {
      console.error('Job calculation failed:', error);

      setCalc(null);

      showToast?.(
        error.response?.data?.message ||
          error.response?.data ||
          'Unable to calculate the job.',
        'error'
      );
    } finally {
      setCalculating(false);
    }
  };

  const handleRecommend = async () => {
    if (!validateInputs({ requireReel: false })) {
      return;
    }

    setRecommending(true);

    try {
      const payload = {
        reelId: '',
        w: Number(w),
        l: Number(l),
        gsm: Number(gsm),
        sheets: Number(sheets),
        corr,
        f: Number(f),
      };

      const calculationResponse = await jobsApi.calculate(payload);
      const recommendationCalc = calculationResponse.data || null;

      const response = await reelsApi.recommend({
        w: Number(w),
        l: Number(l),
        gsm: Number(gsm),
        sheets: Number(sheets),
        corr,
        f: Number(f),
      });

      const candidates = response.data || [];

      if (!candidates.length) {
        showToast?.(
          'No suitable single reel found. Try Split Plan.',
          '',
          true
        );
        return;
      }

      openRecommendationSheet(candidates, recommendationCalc);
    } catch (error) {
      console.error(
        'Reel recommendation failed:',
        error
      );

      showToast?.(
        error.response?.data?.message ||
          error.response?.data ||
          'Unable to recommend a reel.',
        '',
        true
      );
    } finally {
      setRecommending(false);
    }
  };

  const openRecommendationSheet = (candidates, recommendationCalc = null) => {
    const materialNeeded =
      recommendationCalc?.kg != null
        ? Number(recommendationCalc.kg)
        : calc?.kg != null
          ? Number(calc.kg)
          : 0;

    const effectiveGsm =
      recommendationCalc?.effGsm != null
        ? Number(recommendationCalc.effGsm)
        : calc?.effGsm != null
          ? Number(calc.effGsm)
          : Number(gsm) * (corr ? 1 + Number(f) : 1);

    openSheetCompat({
      title: 'Recommend a reel',
      content: (
        <div>
          <div
            className="card card-pad"
            style={{
              boxShadow: 'none',
              background: 'var(--surface-2)',
            }}
          >
            <div className="lines">
              <div>
                <span className="k">
                  Cutting size
                </span>

                <span className="v num">
                  {w} × {l} cm
                </span>
              </div>

              <div>
                <span className="k">
                  Effective GSM
                </span>

                <span className="v num">
                  {Math.round(effectiveGsm)}{' '}
                  GSM
                </span>
              </div>

              <div>
                <span className="k">
                  Sheets
                </span>

                <span className="v num">
                  {n0(sheets)}
                </span>
              </div>

              <div className="total">
                <span
                  className="k"
                  style={{
                    fontWeight: 640,
                  }}
                >
                  Material needed
                </span>

                <span className="v num">
                  {materialNeeded > 0
                    ? n3(materialNeeded)
                    : '—'}{' '}
                  kg
                </span>
              </div>
            </div>
          </div>

          <div className="sec">
            <span className="sec-title">
              {candidates.length} reels can run this job
            </span>
          </div>

          {candidates
            .slice(0, 8)
            .map((candidate, index) => {
              const candidateReel =
                candidate.reel || {};

              const id =
                candidateReel.id ||
                candidate.reelId ||
                candidate.id;

              const remaining =
                candidate.rem ??
                candidate.remaining ??
                candidateReel.remaining ??
                0;

              const required =
                candidate.req ??
                materialNeeded ??
                0;

              const leftover =
                candidate.leftover ??
                Math.max(
                  0,
                  Number(remaining) -
                    Number(required)
                );

              const trim =
                candidate.trim ??
                Math.max(
                  0,
                  Number(candidateReel.width || 0) -
                    Number(w)
                );

              const gsmMatch =
                candidate.gsmMatch ??
                Number(candidateReel.gsm) ===
                  Number(gsm);

              return (
                <button
                  key={id || index}
                  type="button"
                  className="item-card mt10"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    if (!id) {
                      return;
                    }

                    setReelId(id);
                    setCalc(null);

                    closeSheet?.();

                    showToast?.(
                      `Reel ${id} selected`,
                      `${n3(remaining)} kg available`
                    );
                  }}
                >
                  <div className="between">
                    <div>
                      <div
                        className="reel-no num"
                        style={{
                          fontSize: '16px',
                        }}
                      >
                        {id}
                      </div>

                      <div className="tiny muted">
                        {candidateReel.type ||
                          'Reel'}{' '}
                        ·{' '}
                        {candidateReel.width ||
                          candidate.width ||
                          '-'}{' '}
                        cm ·{' '}
                        {candidateReel.unit ||
                          candidate.unit ||
                          '-'}
                      </div>
                    </div>

                    <ChevronRight
                      size={18}
                      className="muted"
                    />
                  </div>

                  <div
                    className="row wrap mt8"
                    style={{ gap: 6 }}
                  >
                    {gsmMatch && (
                      <span className="badge b-ok">
                        GSM match
                      </span>
                    )}

                    {!gsmMatch && (
                      <span className="badge b-warn">
                        {candidateReel.gsm ||
                          candidate.gsm ||
                          '-'}{' '}
                        GSM
                      </span>
                    )}

                    {Number(trim) === 0 ? (
                      <span className="badge b-ok">
                        No trim
                      </span>
                    ) : (
                      <span className="badge b-muted">
                        {trim} cm trim
                      </span>
                    )}

                    {index === 0 && (
                      <span className="badge b-primary">
                        Best fit
                      </span>
                    )}
                  </div>

                  <div
                    className="wt-row"
                    style={{
                      marginTop: 10,
                    }}
                  >
                    <div className="wt">
                      <div className="k">
                        Available
                      </div>

                      <div className="v num">
                        {n2(remaining)}
                        <small>kg</small>
                      </div>
                    </div>

                    <div className="wt">
                      <div className="k">
                        Needed
                      </div>

                      <div className="v num">
                        {n2(required)}
                        <small>kg</small>
                      </div>
                    </div>

                    <div className="wt">
                      <div className="k">
                        Left after
                      </div>

                      <div
                        className="v num"
                        style={{
                          color: 'var(--ok)',
                        }}
                      >
                        {n2(leftover)}
                        <small>kg</small>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

          <div className="pill-note mt14">
            <Search size={16} />

            <span>
              Reels are considered across all units.
              The recommendation is based on stock,
              width and GSM suitability.
            </span>
          </div>
        </div>
      ),
      footer: (
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={closeSheet}
        >
          Close
        </button>
      ),
    });
  };

  const handleSplitPlan = async () => {
    if (!validateInputs({ requireReel: false })) {
      return;
    }

    setPlanningSplit(true);

    try {
      const payload = {
        w: Number(w),
        l: Number(l),
        gsm: Number(gsm),
        sheets: Number(sheets),
        corr,
        f: Number(f),
      };

      const response =
        await reelsApi.splitPlan(payload);

      const plan = response.data;

      if (!plan) {
        showToast?.(
          'Unable to create split plan.',
          'error'
        );

        return;
      }

      const materialNeeded =
        calc?.kg != null
          ? Number(calc.kg)
          : 0;

      openSheetCompat({
        title: 'Split across reels',
        content: (
          <div>
            <div
              className="card card-pad"
              style={{
                boxShadow: 'none',
                background: 'var(--surface-2)',
              }}
            >
              <div className="lines">
                <div>
                  <span className="k">
                    Cutting size
                  </span>

                  <span className="v num">
                    {w} × {l} cm
                  </span>
                </div>

                <div>
                  <span className="k">
                    Effective GSM
                  </span>

                  <span className="v num">
                    {Math.round(
                      calc?.effGsm ??
                        Number(gsm) *
                          (corr
                            ? 1 + Number(f)
                            : 1)
                    )}{' '}
                    GSM
                  </span>
                </div>

                <div>
                  <span className="k">
                    Sheets
                  </span>

                  <span className="v num">
                    {n0(sheets)}
                  </span>
                </div>

                <div className="total">
                  <span
                    className="k"
                    style={{
                      fontWeight: 640,
                    }}
                  >
                    Material needed
                  </span>

                  <span className="v num">
                    {materialNeeded > 0
                      ? n3(materialNeeded)
                      : '—'}{' '}
                    kg
                  </span>
                </div>
              </div>
            </div>

            <div className="sec">
              <span className="sec-title">
                {plan.feasible
                  ? `Split across ${
                      plan.legs?.length || 0
                    } reels`
                  : 'Stock short'}
              </span>
            </div>

            {Array.isArray(plan.legs) &&
            plan.legs.length > 0 ? (
              plan.legs.map((leg, index) => {
                const legReel =
                  leg.reel || {};

                const legReelId =
                  legReel.id ||
                  leg.reelId ||
                  leg.reel ||
                  '-';

                return (
                  <div
                    key={`${legReelId}-${index}`}
                    className="item-card mt10"
                  >
                    <div className="between">
                      <div>
                        <div
                          className="reel-no num"
                          style={{
                            fontSize: 16,
                          }}
                        >
                          {legReelId}
                        </div>

                        <div className="tiny muted">
                          {legReel.type ||
                            leg.type ||
                            'Reel'}{' '}
                          ·{' '}
                          {legReel.width ||
                            leg.width ||
                            '-'}{' '}
                          cm ·{' '}
                          {legReel.unit ||
                            leg.unit ||
                            '-'}
                        </div>
                      </div>

                      <span className="badge b-primary">
                        Reel {index + 1}
                      </span>
                    </div>

                    <div
                      className="wt-row"
                      style={{
                        marginTop: 10,
                      }}
                    >
                      <div className="wt">
                        <div className="k">
                          Cut here
                        </div>

                        <div className="v num">
                          {n0(
                            leg.sheets
                          )}

                          <small>
                            sheets
                          </small>
                        </div>
                      </div>

                      <div className="wt">
                        <div className="k">
                          Consumes
                        </div>

                        <div className="v num">
                          {n2(
                            leg.kg
                          )}

                          <small>
                            kg
                          </small>
                        </div>
                      </div>

                      <div className="wt">
                        <div className="k">
                          Left after
                        </div>

                        <div className="v num">
                          {n2(
                            leg.after
                          )}

                          <small>
                            kg
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="pill-note warn">
                <AlertTriangle size={16} />

                <span>
                  No feasible split plan was
                  returned for the current stock.
                </span>
              </div>
            )}

            {!plan.feasible && (
              <div className="pill-note warn mt10">
                <AlertTriangle size={16} />

                <span>
                  Current inventory is not enough
                  to complete this cutting requirement.
                </span>
              </div>
            )}
          </div>
        ),
        footer: plan.feasible ? (
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={closeSheet}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                executeSplitJob(payload)
              }
            >
              Run split job
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={closeSheet}
          >
            Close
          </button>
        ),
      });
    } catch (error) {
      console.error(
        'Split planning failed:',
        error
      );

      showToast?.(
        error.response?.data?.message ||
          error.response?.data ||
          'Unable to create split plan.',
        'error'
      );
    } finally {
      setPlanningSplit(false);
    }
  };

  const executeJob = async () => {
    if (!calc) {
      showToast?.('Please calculate the job first.', 'error');
      return;
    }

    if (calc.isOk !== true) {
      showToast?.(
        calc.message ||
          'This job cannot be completed with the selected reel.',
        'error'
      );
      return;
    }

    if (!validateInputs()) {
      return;
    }

    try {
      const response =
        await jobsApi.execute(buildPayload());

      const result = response.data;

      showToast?.(
        result?.message ||
          'Job completed successfully.',
        'success'
      );

      closeSheet?.();

      navigate('/jobs');
    } catch (error) {
      console.error(
        'Job execution failed:',
        error
      );

      showToast?.(
        error.response?.data?.message ||
          error.response?.data ||
          'Unable to complete the job.',
        'error'
      );
    }
  };

  const executeSplitJob = async (payload) => {
    try {
      const response =
        await jobsApi.executeSplit(payload);

      const result = response.data;

      const count = Array.isArray(result)
        ? result.length
        : result?.length || 0;

      closeSheet?.();

      showToast?.(
        'Split job completed',
        count
          ? `${count} job(s) created`
          : 'Cutting jobs created successfully'
      );

      navigate('/jobs');
    } catch (error) {
      console.error(
        'Split execution failed:',
        error
      );

      showToast?.(
        error.response?.data?.message ||
          error.response?.data ||
          'Unable to complete split job.',
        'error'
      );
    }
  };

  const handleConfirmJob = () => {
    if (!calc) {
      showToast?.(
        'Please calculate the job first.',
        'error'
      );

      return;
    }

    if (calc.isOk === false) {
      showToast?.(
        calc.message ||
          'This job cannot be completed.',
        'error'
      );

      return;
    }

    openSheetCompat({
      title: 'Confirm job',
      content: (
        <div>
          <div
            className="card card-pad"
            style={{
              boxShadow: 'none',
              background: 'var(--surface-2)',
            }}
          >
            <div className="between">
              <span className="small muted">
                Reel
              </span>

              <span
                className="num"
                style={{
                  fontWeight: 680,
                }}
              >
                {reelId}
              </span>
            </div>

            <div className="divider" />

            <div className="lines">
              <div>
                <span className="k">
                  Cutting size
                </span>

                <span className="v num">
                  {w} × {l} cm
                </span>
              </div>

              <div>
                <span className="k">
                  GSM
                </span>

                <span className="v num">
                  {gsm} GSM
                </span>
              </div>

              <div>
                <span className="k">
                  Sheets
                </span>

                <span className="v num">
                  {n0(sheets)}
                </span>
              </div>

              <div>
                <span className="k">
                  Corrugation
                </span>

                <span className="v num">
                  {corr
                    ? `On · × ${(
                        1 + Number(f)
                      ).toFixed(2)}`
                    : 'Off'}
                </span>
              </div>

              <div>
                <span className="k">
                  Effective GSM
                </span>

                <span className="v num">
                  {Math.round(
                    calc.effGsm || gsm
                  )}{' '}
                  GSM
                </span>
              </div>

              <div>
                <span className="k">
                  Previous balance
                </span>

                <span className="v num">
                  {n3(
                    calc.prevBalance
                  )}{' '}
                  kg
                </span>
              </div>
            </div>

            <div className="divider" />

            <div className="between">
              <span
                style={{
                  fontWeight: 640,
                }}
              >
                Consumption
              </span>

              <span
                className="num"
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--danger)',
                }}
              >
                {n3(calc.kg)} kg
              </span>
            </div>

            <div
              className="between mt8"
            >
              <span
                style={{
                  fontWeight: 640,
                }}
              >
                Remaining after job
              </span>

              <span
                className="num"
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--ok)',
                }}
              >
                {n3(
                  calc.afterBalance
                )}{' '}
                kg
              </span>
            </div>
          </div>

          <div className="pill-note mt10">
            <AlertTriangle size={16} />

            <span>
              Confirming will deduct the weight
              from the reel and create the
              cutting-job record.
            </span>
          </div>
        </div>
      ),
      footer: (
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={closeSheet}
          >
            Edit
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={executeJob}
            disabled={!calc || calc.isOk !== true}
          >
            Confirm job
          </button>
        </div>
      ),
    });
  };

  const handleReset = () => {
    setReelId('');
    setSearch('');
    setW(80);
    setL(63);
    setGsm(120);
    setSheets(3000);
    setCorr(true);
    setF(0.45);
    setCalc(null);
    setReel(null);

    showToast?.(
      'Job form reset.',
      'success'
    );
  };

  const remaining =
    Number(reel?.remaining ?? 0);

  const usagePercent = reel
    ? Math.min(
        100,
        Math.max(
          0,
          100 -
            (remaining /
              Math.max(
                Number(
                  reel?.orig ??
                    reel?.original ??
                    remaining
                ),
                1
              )) *
              100
        )
      )
    : 0;

  const widthTooWide =
    reel &&
    Number(w) >
      Number(
        reel.width ??
          reel.w ??
          0
      );

  return (
    <div className="new-job-page">
      <div className="page-head">
        <div className="between wrap">
          <div>
            <h1 className="page-title">
              New Job
            </h1>

            <p className="page-sub">
              Enter cutting details — consumption
              updates as you type
            </p>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
          >
            <RotateCcw size={17} />
            Reset
          </button>
        </div>
      </div>

      <div
        className="sec"
        style={{ marginTop: 0 }}
      >
        <span className="sec-title">
          Reel
        </span>
      </div>

      <div className="card card-pad">
        <div
          className="field"
          style={{ marginBottom: 10 }}
        >
          <label>
            Reel number
          </label>

          <div className="input-icon">
            <Search size={17} />

            <input
              className="input num"
              list="reelOptions"
              autoComplete="off"
              spellCheck="false"
              placeholder="e.g. R-21056"
              value={reelId}
              onChange={(event) => {
                setReelId(
                  event.target.value
                    .toUpperCase()
                );

                setCalc(null);
              }}
            />
          </div>

          <datalist id="reelOptions">
            {availableReels.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.unit || '-'} ·{' '}
                  {item.type || '-'}
                </option>
              )
            )}
          </datalist>
        </div>

        <div
          className="field"
          style={{ marginBottom: 10 }}
        >
          <label>
            Search available reels
          </label>

          <div className="input-icon">
            <Search size={17} />

            <input
              className="input"
              placeholder="Search reel, unit, mill or type..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        {search.trim() && (
          <div
            className="item-list"
            style={{
              maxHeight: 260,
              overflowY: 'auto',
            }}
          >
            {filteredReels.length === 0 ? (
              <div className="pill-note warn">
                <AlertTriangle size={16} />

                <span>
                  No available reel matches
                  your search.
                </span>
              </div>
            ) : (
              filteredReels
                .slice(0, 12)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="item-card mt10"
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                    }}
                    onClick={() => {
                      setReelId(
                        String(item.id)
                      );

                      setCalc(null);
                      setSearch('');

                      showToast?.(
                        `Reel ${item.id} selected`,
                        `${n3(
                          item.remaining
                        )} kg available`
                      );
                    }}
                  >
                    <div className="between">
                      <div>
                        <div
                          className="reel-no num"
                          style={{
                            fontSize: 16,
                          }}
                        >
                          {item.id}
                        </div>

                        <div className="tiny muted">
                          {item.type ||
                            '-'}{' '}
                          ·{' '}
                          {item.gsm ||
                            '-'} GSM ·{' '}
                          {item.width ||
                            item.w ||
                            '-'} cm · Unit{' '}
                          {item.unit ||
                            '-'}
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                      />
                    </div>

                    <div
                      className="between mt8"
                    >
                      <span className="small muted">
                        Remaining
                      </span>

                      <span className="num">
                        {n3(
                          item.remaining
                        )}{' '}
                        kg
                      </span>
                    </div>
                  </button>
                ))
            )}
          </div>
        )}

        {loadingReels && (
          <div className="pill-note">
            Loading reel inventory...
          </div>
        )}

        {!reelId && !loadingReels && (
          <div className="pill-note">
            <Search size={16} />

            <span>
              Type a reel number or search the
              available inventory.
            </span>
          </div>
        )}

        {reel && (
          <div
            className="item-card mt10"
            style={{
              cursor: 'default',
            }}
          >
            <div className="between">
              <div className="row">
                <span className="li-ico">
                  <Scissors size={18} />
                </span>

                <div>
                  <div
                    className="num"
                    style={{
                      fontSize: 15.5,
                      fontWeight: 660,
                    }}
                  >
                    {reel.id}
                  </div>

                  <div className="tiny muted">
                    {reel.type || '-'} ·{' '}
                    {reel.gsm || '-'} GSM ·{' '}
                    {reel.width ||
                      reel.w ||
                      '-'}{' '}
                    cm · Unit{' '}
                    {reel.unit || '-'}
                  </div>
                </div>
              </div>

              <span className="badge b-ok">
                Available
              </span>
            </div>

            <div className="divider" />

            <div className="between">
              <span className="small muted">
                Remaining weight
              </span>

              <span
                className="num"
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color:
                    remaining < 1
                      ? 'var(--danger)'
                      : 'var(--ok)',
                }}
              >
                {n3(remaining)} kg
              </span>
            </div>

            <div className="bar mt10">
              <i
                className="ok"
                style={{
                  width: `${Math.max(
                    0,
                    100 - usagePercent
                  )}%`,
                }}
              />
            </div>

            {remaining < 1 && (
              <div className="pill-note warn mt10">
                <AlertTriangle size={16} />

                <span>
                  This reel is exhausted.
                  Please select another reel.
                </span>
              </div>
            )}

            {widthTooWide && (
              <div className="pill-note warn mt10">
                <AlertTriangle size={16} />

                <span>
                  Cutting width {w} cm is wider
                  than this reel (
                  {reel.width ??
                    reel.w}
                  cm).
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="btn btn-soft btn-block mt10"
        onClick={handleRecommend}
        disabled={recommending}
      >
        <Search size={17} />

        {recommending
          ? 'Finding suitable reels...'
          : 'Recommend a reel for this job'}
      </button>

      <div className="sec">
        <span className="sec-title">
          Cutting Details
        </span>
      </div>

      <div className="card card-pad">
        <div className="grid-2">
          <div className="field">
            <label>
              Cutting width
            </label>

            <div className="input-suffix">
              <input
                className="input num"
                type="number"
                min="1"
                value={w}
                onChange={(event) => {
                  setW(event.target.value);
                  setCalc(null);
                }}
              />

              <span className="sfx">
                cm
              </span>
            </div>
          </div>

          <div className="field">
            <label>
              Cutting length
            </label>

            <div className="input-suffix">
              <input
                className="input num"
                type="number"
                min="1"
                value={l}
                onChange={(event) => {
                  setL(event.target.value);
                  setCalc(null);
                }}
              />

              <span className="sfx">
                cm
              </span>
            </div>
          </div>

          <div className="field">
            <label>
              GSM
            </label>

            <div className="input-suffix">
              <input
                className="input num"
                type="number"
                min="1"
                value={gsm}
                onChange={(event) => {
                  setGsm(event.target.value);
                  setCalc(null);
                }}
              />

              <span className="sfx">
                gsm
              </span>
            </div>
          </div>

          <div className="field">
            <label>
              Number of sheets
            </label>

            <div className="input-suffix">
              <input
                className="input num"
                type="number"
                min="1"
                value={sheets}
                onChange={(event) => {
                  setSheets(
                    event.target.value
                  );

                  setCalc(null);
                }}
              />

              <span className="sfx">
                nos
              </span>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="between">
          <div>
            <div
              style={{
                fontWeight: 640,
                fontSize: 14.5,
              }}
            >
              Corrugation
            </div>

            <div className="tiny muted">
              Adds flute take-up to the GSM
            </div>
          </div>

          <button
            type="button"
            className={`switch ${
              corr ? 'on' : ''
            }`}
            onClick={() => {
              setCorr(!corr);
              setCalc(null);
            }}
            aria-label="Corrugation"
            aria-pressed={corr}
          />
        </div>

        {corr && (
          <div
            style={{
              marginTop: 14,
            }}
          >
            <div className="divider" />

            <div
              className="field"
              style={{
                marginBottom: 0,
              }}
            >
              <label>
                Corrugation factor
              </label>

              <div
                className="chips"
                style={{
                  marginBottom: 8,
                }}
              >
                {[0.35, 0.4, 0.45, 0.5].map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      className={`chip ${
                        Math.abs(
                          Number(f) -
                            value
                        ) < 0.001
                          ? 'on'
                          : ''
                      }`}
                      onClick={() => {
                        setF(value);
                        setCalc(null);
                      }}
                    >
                      ×
                      {(1 + value).toFixed(
                        2
                      )}{' '}
                      ({value.toFixed(2)})
                    </button>
                  )
                )}
              </div>

              <input
                className="input num"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={f}
                onChange={(event) => {
                  setF(
                    event.target.value
                  );

                  setCalc(null);
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="sec">
        <span className="sec-title">
          Live Calculation
        </span>
      </div>

      <div
        className={`calc ${
          calc && calc.isOk === false
            ? 'calc-warn'
            : ''
        }`}
      >
        <div className="calc-top">
          <div className="stat-label">
            {calc?.kg != null
              ? 'Estimated consumption'
              : 'Material needed'}
          </div>

          <div
            className="calc-big"
            style={{
              marginTop: 6,
            }}
          >
            <b className="num">
              {calc?.kg != null
                ? n3(calc.kg)
                : '—'}
            </b>

            {calc?.kg != null && (
              <span>
                kg
              </span>
            )}
          </div>

          <div className="calc-eq num">
            {n0(sheets)} ×{' '}
            {Math.round(
              calc?.effGsm ??
                Number(gsm) *
                  (corr
                    ? 1 + Number(f)
                    : 1)
            )}{' '}
            GSM ×{' '}
            {(
              Number(w || 0) / 100
            ).toFixed(2)}
            m ×{' '}
            {(
              Number(l || 0) / 100
            ).toFixed(2)}
            m ÷ 1000
          </div>
        </div>

        <div
          className="card-pad"
          style={{
            padding: '12px 14px',
          }}
        >
          <div className="lines">
            <div>
              <span className="k">
                Entered GSM
              </span>

              <span className="v num">
                {gsm} GSM
              </span>
            </div>

            {corr && (
              <div>
                <span className="k">
                  Corrugation factor
                </span>

                <span className="v num">
                  ×{' '}
                  {(
                    1 + Number(f)
                  ).toFixed(2)}
                </span>
              </div>
            )}

            <div>
              <span className="k">
                Effective GSM
              </span>

              <span
                className="v num"
                style={{
                  color:
                    'var(--primary-700)',
                }}
              >
                {Math.round(
                  calc?.effGsm ??
                    Number(gsm) *
                      (corr
                        ? 1 + Number(f)
                        : 1)
                )}{' '}
                GSM
              </span>
            </div>

            <div>
              <span className="k">
                Sheet area
              </span>

              <span className="v num">
                {(
                  Number(w || 0) /
                  100
                ).toFixed(2)}{' '}
                ×{' '}
                {(
                  Number(l || 0) /
                  100
                ).toFixed(2)}{' '}
                m
              </span>
            </div>

            <div>
              <span className="k">
                Previous balance
              </span>

              <span className="v num">
                {calc?.prevBalance != null
                  ? `${n3(
                      calc.prevBalance
                    )} kg`
                  : reel
                    ? `${n3(
                        remaining
                      )} kg`
                    : '—'}
              </span>
            </div>

            <div>
              <span className="k">
                Remaining after job
              </span>

              <span
                className="v num"
                style={{
                  color:
                    calc?.isOk
                      ? 'var(--ok)'
                      : calc?.isOk === false
                        ? 'var(--danger)'
                        : undefined,
                }}
              >
                {calc?.afterBalance != null
                  ? `${n3(
                      calc.afterBalance
                    )} kg`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {calc &&
          calc.isWidthOk === false && (
            <div className="alert">
              <AlertTriangle size={18} />

              <div>
                <div className="t">
                  Cutting width too wide
                </div>

                <div className="s">
                  {reel?.id ||
                    reelId}{' '}
                  is{' '}
                  {reel?.width ??
                    reel?.w ??
                    '-'}{' '}
                  cm wide, but this job
                  requires {w} cm.
                </div>
              </div>
            </div>
          )}

        {calc &&
          calc.isOk === false &&
          calc.isWidthOk !== false && (
            <div className="alert">
              <AlertTriangle size={18} />

              <div>
                <div className="t">
                  Insufficient material
                </div>

                <div className="s num">
                  Required{' '}
                  {n2(calc.kg)} kg ·
                  Available{' '}
                  {n2(
                    calc.prevBalance
                  )}{' '}
                  kg
                  {calc.shortKg != null &&
                    ` · Short by ${n2(
                      calc.shortKg
                    )} kg`}
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  style={{
                    marginTop: 8,
                  }}
                  onClick={
                    handleSplitPlan
                  }
                  disabled={
                    planningSplit
                  }
                >
                  <Scissors size={15} />

                  {planningSplit
                    ? 'Planning...'
                    : 'Split across reels'}
                </button>
              </div>
            </div>
          )}
      </div>

      <div className="mt14">
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={
            calc
              ? handleConfirmJob
              : handleCalculate
          }
          disabled={
            calculating ||
            !reel ||
            remaining < 1 ||
            Boolean(widthTooWide) ||
            (Boolean(calc) && calc.isOk !== true)
          }
        >
          <Check size={18} />

          {calculating
            ? 'Calculating...'
            : calc
              ? 'Complete job'
              : 'Calculate'}
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-block mt10"
          onClick={() =>
            navigate('/jobs')
          }
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
