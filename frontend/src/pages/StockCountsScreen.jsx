import React, { useEffect, useMemo, useState } from "react";
import { stockCountsApi } from "../api/services";
import { useSearchParams } from "react-router-dom";

export default function StockCountsScreen() {
  const [counts, setCounts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCountId = searchParams.get('countId');
  const selectedCount = counts.find(c => c.id === selectedCountId) || null;

  const setSelectedCount = (count) => {
    setSearchParams(prev => {
      if (count) prev.set('countId', count.id || count);
      else prev.delete('countId');
      return prev;
    }, { replace: true });
  };
  const [lines, setLines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [linesLoading, setLinesLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD STOCK COUNTS
  // =========================================================

  const loadCounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await stockCountsApi.getByUnit("U1");

      setCounts(response.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to load stock counts."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD STOCK COUNT LINES
  // =========================================================

  const loadLines = async (count) => {
    try {
      setLinesLoading(true);
      setError("");

      setSelectedCount(count);

      const response =
        await stockCountsApi.getLines(count.id);

      setLines(response.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to load stock count lines."
      );

      setLines([]);
    } finally {
      setLinesLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCounts();
  }, []);

  // =========================================================
  // STATISTICS
  // =========================================================

  const countedCount = useMemo(
    () =>
      lines.filter(
        (line) => line.counted
      ).length,
    [lines]
  );

  const varianceCount = useMemo(
    () =>
      lines.filter(
        (line) =>
          line.varianceBeyondTolerance
      ).length,
    [lines]
  );

  const pendingCount =
    lines.length - countedCount;

  const allCounted =
    lines.length > 0 &&
    lines.every(
      (line) => line.counted
    );

  // =========================================================
  // POST STOCK COUNT
  // =========================================================

  const handlePost = async () => {
    if (!selectedCount) {
      return;
    }

    try {
      setPosting(true);
      setError("");

      await stockCountsApi.post(
        selectedCount.id
      );

      await loadCounts();

      const countResponse =
        await stockCountsApi.getById(
          selectedCount.id
        );

      setSelectedCount(
        countResponse.data
      );

      const linesResponse =
        await stockCountsApi.getLines(
          selectedCount.id
        );

      setLines(
        linesResponse.data || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to post stock count."
      );
    } finally {
      setPosting(false);
    }
  };

  // =========================================================
  // BACK TO COUNT LIST
  // =========================================================

  const handleBack = () => {
    setSelectedCount(null);
    setLines([]);
    setError("");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="screen-content stock-count-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="stock-count-header">

        <div>
          <h1>Stock Count</h1>

          <p>
            Review physical inventory counts and variances.
          </p>
        </div>

        <button
          type="button"
          className="stock-count-refresh"
          onClick={loadCounts}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="stock-count-error">
          {error}
        </div>
      )}

      {/* =====================================================
          STOCK COUNT LIST
      ===================================================== */}

      {!selectedCount && (
        <section className="stock-count-list-section">

          <div className="stock-count-section-title">
            <h2>Stock Count Records</h2>
          </div>

          {loading ? (
            <div className="stock-count-empty">
              Loading stock counts...
            </div>
          ) : counts.length === 0 ? (
            <div className="stock-count-empty">
              No stock counts found.
            </div>
          ) : (
            <div className="stock-count-records">

              {counts.map((count) => (
                <button
                  key={count.id}
                  type="button"
                  className="stock-count-record"
                  onClick={() =>
                    loadLines(count)
                  }
                >

                  <div className="stock-count-record-main">

                    <strong>
                      {count.countNumber || count.id}
                    </strong>

                    <span>
                      Unit: {count.unitId}
                    </span>

                  </div>

                  <div className="stock-count-record-info">

                    <span
                      className={`stock-count-status ${
                        count.status ===
                        "POSTED" || count.status === "COMPLETED"
                          ? "posted"
                          : "in-progress"
                      }`}
                    >
                      {count.status}
                    </span>

                    <span>
                      Opened by:{" "}
                      {count.openedByName ||
                        "-"}
                    </span>

                  </div>

                </button>
              ))}

            </div>
          )}

        </section>
      )}

      {/* =====================================================
          SELECTED STOCK COUNT
      ===================================================== */}

      {selectedCount && (
        <section className="stock-count-detail">

          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <button
            type="button"
            className="stock-count-back"
            onClick={handleBack}
          >
            ← Back to Stock Counts
          </button>

          {/* =================================================
              DETAIL HEADER
          ================================================= */}

          <div className="stock-count-detail-header">

            <div>

              <h2>
                {selectedCount.countNumber || selectedCount.id}
              </h2>

              <div className="stock-count-meta">

                <span>
                  Unit:{" "}
                  <strong>
                    {selectedCount.unitId}
                  </strong>
                </span>

                <span>
                  Status:{" "}
                  <strong>
                    {selectedCount.status}
                  </strong>
                </span>

              </div>

            </div>

            {selectedCount.status ===
              "IN_PROGRESS" && (
              <button
                type="button"
                className="stock-count-post-button"
                onClick={handlePost}
                disabled={
                  posting ||
                  !allCounted
                }
                title={
                  !allCounted
                    ? "All reels must be counted before posting."
                    : ""
                }
              >
                {posting
                  ? "Posting..."
                  : "Post Stock Count"}
              </button>
            )}

          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="stock-count-summary">

            <div className="stock-count-summary-card">
              <strong>
                {lines.length}
              </strong>

              <span>
                Total Reels
              </span>
            </div>

            <div className="stock-count-summary-card">
              <strong>
                {countedCount}
              </strong>

              <span>
                Counted
              </span>
            </div>

            <div className="stock-count-summary-card">
              <strong>
                {pendingCount}
              </strong>

              <span>
                Pending
              </span>
            </div>

            <div className="stock-count-summary-card variance">
              <strong>
                {varianceCount}
              </strong>

              <span>
                Variance
              </span>
            </div>

          </div>

          {/* =================================================
              LINES
          ================================================= */}

          <div className="stock-count-lines-section">

            {linesLoading ? (
              <div className="stock-count-empty">
                Loading stock count lines...
              </div>
            ) : lines.length === 0 ? (
              <div className="stock-count-empty">
                No stock count lines found.
              </div>
            ) : (
              <div className="stock-count-table-wrapper">

                <table className="stock-count-table">

                  <thead>
                    <tr>
                      <th>Reel</th>
                      <th>System Weight</th>
                      <th>Counted Weight</th>
                      <th>Variance</th>
                      <th>Tolerance</th>
                      <th>Counted</th>
                      <th>Adjustment</th>
                      <th>Reason</th>
                    </tr>
                  </thead>

                  <tbody>

                    {lines.map((line) => {

                      const hasVariance =
                        line.varianceBeyondTolerance;

                      return (
                        <tr
                          key={line.id}
                          className={
                            hasVariance
                              ? "has-variance"
                              : ""
                          }
                        >

                          <td>
                            <strong>
                              {line.reelNumber ||
                                line.reelId}
                            </strong>
                          </td>

                          <td>
                            {line.systemWeightKg ?? line.systemWeight ?? 0}
                          </td>

                          <td>
                            {line.countedWeightKg ?? line.countedWeight ?? "-"}
                          </td>

                          <td
                            className={
                              hasVariance
                                ? "variance-value"
                                : ""
                            }
                          >
                            {line.varianceKg ?? line.variance ?? "-"}
                          </td>

                          <td>
                            {line.toleranceKg ?? 0.01}
                          </td>

                          <td>

                            <span
                              className={`stock-count-badge ${
                                line.counted
                                  ? "success"
                                  : "pending"
                              }`}
                            >
                              {line.counted
                                ? "Yes"
                                : "No"}
                            </span>

                          </td>

                          <td>

                            <span
                              className={`stock-count-badge ${
                                line.adjustmentApplied
                                  ? "success"
                                  : "pending"
                              }`}
                            >
                              {line.adjustmentApplied
                                ? "Applied"
                                : "Pending"}
                            </span>

                          </td>

                          <td>
                            {line.reason ||
                              "-"}
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </section>
      )}

    </div>
  );
}
