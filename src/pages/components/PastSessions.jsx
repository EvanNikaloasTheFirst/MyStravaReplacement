/* src/pages/components/RecentSessions.js */

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import styles from "@/styles/PastSession.module.css";
import SessionReviewCard from "./SessionReviewCard";
import WorkoutMap from "./WorkoutMap";

export default function PastSessions() {
  const [sessions, setSessions] = useState([]);
  const [showAll, setShowAll] =
    useState(false);
  const [selected, setSelected] =
    useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const res = await fetch(
      "/api/all-workouts"
    );

    const data =
      await res.json();

    if (data.success) {
      setSessions(
        data.sessions || []
      );
    }
  };

  const fatigueColor = (
    rating
  ) => {
    if (rating <= 2)
      return "#22c55e";
    if (rating <= 4)
      return "#84cc16";
    if (rating <= 6)
      return "#eab308";
    if (rating <= 8)
      return "#f97316";
    return "#ef4444";
  };

  const formatDate = (
    date
  ) => {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleDateString(
      "en-GB",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const recentFive =
    sessions.slice(0, 5);

  /* CHART HELPERS */

  const buildPowerChart = (
    workout
  ) => {
    if (
      !workout?.powerStream
        ?.length
    )
      return [];

    return workout.powerStream
      .slice(0, 120)
      .map((v, i) => ({
        t: i + 1,
        power: v,
      }));
  };

  const buildHrChart = (
    workout
  ) => {
    if (
      !workout?.hrStream
        ?.length
    )
      return [];

    return workout.hrStream
      .slice(0, 120)
      .map((v, i) => ({
        t: i + 1,
        hr: v,
      }));
  };

  const buildZones = (
    workout
  ) => {
    const hr =
      workout?.hrStream ||
      [];

    if (!hr.length)
      return [];

    const zones = [
      {
        zone: "Z1",
        min: 0,
        max: 120,
        mins: 0,
      },
      {
        zone: "Z2",
        min: 121,
        max: 140,
        mins: 0,
      },
      {
        zone: "Z3",
        min: 141,
        max: 155,
        mins: 0,
      },
      {
        zone: "Z4",
        min: 156,
        max: 170,
        mins: 0,
      },
      {
        zone: "Z5",
        min: 171,
        max: 300,
        mins: 0,
      },
    ];

    hr.forEach((v) => {
      const match =
        zones.find(
          (z) =>
            v >= z.min &&
            v <= z.max
        );

      if (match)
        match.mins++;
    });

    return zones.map(
      (z) => ({
        zone: z.zone,
        mins: Math.round(
          z.mins / 60
        ),
      })
    );
  };

  return (
    <>
      {/* MAIN CARD */}

      <div
        className={
          styles.recentWrap
        }
      >
        <div
          className={
            styles.topBar
          }
        >
          <h2
            className={
              styles.title
            }
          >
            Recent Sessions
          </h2>

          <button
            className={
              styles.seeAllBtn
            }
            onClick={() =>
              setShowAll(
                true
              )
            }
          >
            See All
          </button>
        </div>

        <div
          className={
            styles.sessionList
          }
        >
          {recentFive.map(
            (item) => (
              <div
                key={
                  item._id
                }
                className={
                  styles.sessionRow
                }
                onClick={() =>
                  setSelected(
                    item
                  )
                }
              >
                <div>
                  <strong
                    className={
                      styles.bigStat
                    }
                  >
                    {item.distance?.toFixed(
                      1
                    )}
                    km
                  </strong>

                  <span
                    className={
                      styles.smallText
                    }
                  >
                    {
                      item.sessionName
                    }
                  </span>

                  <span
                    className={
                      styles.smallText
                    }
                  >
                    {formatDate(
                      item.createdAt
                    )}
                  </span>
                </div>

                <div>
                  <strong
                    className={
                      styles.bigStat
                    }
                  >
                    {item.avgPower ||
                      0}
                    w
                  </strong>

                  <span
                    className={
                      styles.smallText
                    }
                  >
                    avg watts
                  </span>
                </div>

                <div>
                  <div
                    className={
                      styles.fatigueBar
                    }
                    style={{
                      background:
                        fatigueColor(
                          item.rating ||
                            1
                        ),
                    }}
                  />

                  <span
                    className={
                      styles.smallText
                    }
                  >
                    fatigue
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ALL SESSIONS MODAL */}

      {showAll && (
        <>
          <div
            className={
              styles.overlay
            }
            onClick={() =>
              setShowAll(
                false
              )
            }
          />

          <div
            className={
              styles.sidePanel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <h2>
                Past Sessions
              </h2>

              <button
                className={
                  styles.closeBtn
                }
                onClick={() =>
                  setShowAll(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <div
              className={
                styles.sessionList
              }
            >
              {sessions.map(
                (item) => (
                  <div
                    key={
                      item._id
                    }
                    className={
                      styles.listRow
                    }
                    onClick={() => {
                      setShowAll(
                        false
                      );
                      setSelected(
                        item
                      );
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          color:
                            "white",
                        }}
                      >
                        {
                          item.sessionName
                        }
                      </strong>

                      <span
                        className={
                          styles.smallText
                        }
                      >
                        {formatDate(
                          item.createdAt
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        textAlign:
                          "right",
                      }}
                    >
                      <strong
                        style={{
                          color:
                            "white",
                        }}
                      >
                        {item.distance?.toFixed(
                          1
                        )}
                        km
                      </strong>

                      <span
                        className={
                          styles.smallText
                        }
                      >
                        {Math.round(
                          (item.duration ||
                            0) /
                            60
                        )}{" "}
                        min
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* SELECTED SESSION */}

      {selected && (
        <>
          <div
            className={
              styles.overlay
            }
            onClick={() =>
              setSelected(
                null
              )
            }
          />

          <div
            className={
              styles.sidePanel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <h2>
                {
                  selected.sessionName
                }
              </h2>

              <button
                className={
                  styles.closeBtn
                }
                onClick={() =>
                  setSelected(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div
              className={
                styles.sessionList
              }
            >
              <p
                className={
                  styles.smallText
                }
              >
                {new Date(
                  selected.createdAt
                ).toLocaleString()}
              </p>

              {selected.route
                ?.length >
                0 && (
                <div
                  className={
                    styles.mapWrap
                  }
                >
                  <WorkoutMap
                    points={selected.route.map(
                      (
                        p
                      ) => [
                        p.lat,
                        p.lng,
                      ]
                    )}
                  />
                </div>
              )}

              <SessionReviewCard
                session={{
                  total_distance:
                    selected.distance,
                  total_timer_time:
                    selected.duration,
                  total_calories:
                    selected.calories,
                  avg_heart_rate:
                    selected.avgHeartRate,
                  max_heart_rate:
                    selected.maxHeartRate,
                }}
                topSpeed={
                  selected.topSpeed
                }
                avgSpeed={
                  selected.avgSpeed
                }
                maxPower={
                  selected.maxPower
                }
                avgPower={
                  selected.avgPower
                }
              />

              {/* POWER */}

              <h3
                style={{
                  color:
                    "white",
                  marginTop:
                    22,
                }}
              >
                Power Chart
              </h3>

              <div
                style={{
                  height: 180,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={buildPowerChart(
                      selected
                    )}
                  >
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      dataKey="power"
                      stroke="#f97316"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* HR */}

              <h3
                style={{
                  color:
                    "white",
                  marginTop:
                    22,
                }}
              >
                HR Chart
              </h3>

              <div
                style={{
                  height: 180,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={buildHrChart(
                      selected
                    )}
                  >
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      dataKey="hr"
                      stroke="#ef4444"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* ZONES */}

              <h3
                style={{
                  color:
                    "white",
                  marginTop:
                    22,
                }}
              >
                Time In Zones
              </h3>

              <div
                style={{
                  height: 220,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={buildZones(
                      selected
                    )}
                  >
                    <XAxis dataKey="zone" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="mins"
                      fill="#22c55e"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}