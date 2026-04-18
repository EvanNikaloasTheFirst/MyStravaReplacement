/* src/pages/components/RecentSessions.js */

import { useEffect, useState } from "react";
import styles from "@/styles/RecentWorkouts.module.css";

export default function RecentSessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const res = await fetch("/api/recent-workouts");
    const data = await res.json();

    if (data.success) {
      setSessions(data.sessions);
    }
  };

  const fatigueColor = (rating) => {
    if (rating <= 2) return "#22c55e";
    if (rating <= 4) return "#84cc16";
    if (rating <= 6) return "#eab308";
    if (rating <= 8) return "#f97316";
    return "#ef4444";
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className={styles.recentWrap}>
      <h2 className={styles.title}>
        Recent Sessions
      </h2>

      {sessions.length === 0 && (
        <p className={styles.text}>
          No sessions yet
        </p>
      )}

      {sessions.map((item) => (
        <div
          key={item._id}
          className={styles.sessionRow}
        >
          <div>
            <strong className={styles.bigStat}>
              {item.distance?.toFixed(2)}km
            </strong>

            <span className={styles.smallText}>
              {item.sessionName}
            </span>

            <span className={styles.smallText}>
              {formatDate(item.createdAt)}
            </span>
          </div>

          <div>
            <strong className={styles.bigStat}>
              {item.avgPower || 0}w
            </strong>

            <span className={styles.smallText}>
              avg watts
            </span>
          </div>

          <div>
            <strong className={styles.bigStat}>
              {item.avgHeartRate || 0}
            </strong>

            <span className={styles.smallText}>
              avg hr
            </span>
          </div>

          <div>
            <div
              className={styles.fatigueBar}
              style={{
                background:
                  fatigueColor(
                    item.rating || 1
                  ),
              }}
            />

            <span className={styles.smallText}>
              fatigue
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}