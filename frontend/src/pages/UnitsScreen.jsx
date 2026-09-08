import React from "react";
import { useNavigate } from "react-router-dom";
import { Factory, ChevronRight } from "lucide-react";
import { units } from "./data/mockData";

export default function UnitsScreen() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Manufacturing Units</h1>

        <p className="page-sub">
          Manage manufacturing units
        </p>
      </div>

      <div className="list-grid">
        {units
          .filter((unit) => unit.active)
          .map((u) => (
            <button
              key={u.id}
              className="card card-pad tap"
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
              }}
              onClick={() =>
                navigate(`/units/${u.id}`)
              }
            >
              <div className="between">
                <div className="row">
                  <div className="li-ico">
                    <Factory size={18} />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "15.5px",
                        fontWeight: 660,
                      }}
                    >
                      {u.name}
                    </div>

                    <div className="tiny muted">
                      {u.code} · {u.city} · {u.stateCode}
                    </div>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="li-chev"
                />
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}