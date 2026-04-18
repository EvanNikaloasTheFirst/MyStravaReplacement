/* src/pages/components/TrainingReadiness.js */

import { useEffect, useState } from "react";
import styles from "@/styles/Trainingreadiness.module.css";

export default function TrainingReadiness() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await fetch("/api/recent-workouts");
      const data = await res.json();

      if (data.success) {
        buildReadiness(data.sessions);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const buildReadiness = (items) => {
    if (!items.length) return;

    const now = new Date();

    const sevenDay = items.filter((s) => {
      const d = new Date(s.createdAt);
      return (
        now - d <
        7 * 24 * 60 * 60 * 1000
      );
    });

    const twentyEight = items.filter((s) => {
      const d = new Date(s.createdAt);
      return (
        now - d <
        28 * 24 * 60 * 60 * 1000
      );
    });

    const avg = (arr, key) =>
      arr.length
        ? arr.reduce(
            (a, b) => a + (b[key] || 0),
            0
          ) / arr.length
        : 0;

    const fatigue7 = avg(
      sevenDay,
      "rating"
    );

    const fatigue28 = avg(
      twentyEight,
      "rating"
    );

    const hr7 = avg(
      sevenDay,
      "avgHeartRate"
    );

    const hr28 = avg(
      twentyEight,
      "avgHeartRate"
    );

    const power7 = avg(
      sevenDay,
      "avgPower"
    );

    const power28 = avg(
      twentyEight,
      "avgPower"
    );

    let status = "READY";
    let color = "#22c55e";
    let advice =
      "Good freshness markers. Harder day is available.";

    if (
      fatigue7 > fatigue28 + 1 ||
      hr7 > hr28 + 5
    ) {
      status = "CAUTION";
      color = "#eab308";
      advice =
        "Load elevated recently. Better to stay moderate today.";
    }

    if (
      fatigue7 > fatigue28 + 2 ||
      hr7 > hr28 + 8
    ) {
      status = "RECOVER";
      color = "#ef4444";
      advice =
        "Accumulated fatigue is high. Lighter day recommended.";
    }

    if (
      power7 > power28 &&
      fatigue7 <= fatigue28
    ) {
      status = "PRIME";
      color = "#3b82f6";
      advice =
        "Output is rising while fatigue controlled. Strong day possible.";
    }

    const score = Math.max(
      1,
      Math.min(
        100,
        Math.round(
          70 +
            (power7 - power28) *
              0.4 -
            (fatigue7 -
              fatigue28) *
              10 -
            (hr7 - hr28) * 1.5
        )
      )
    );

    setReport({
      score,
      status,
      color,
      advice,
      fatigue7,
      fatigue28,
      hr7,
      hr28,
      power7,
      power28,
    });
  };

  if (!report) {
    return (
      <div className={styles.readinessCard}>
        <h2 className={styles.title}>
          Readiness
        </h2>

        <p className={styles.text}>
          Need sessions first
        </p>
      </div>
    );
  }

  return (
    <div className={styles.readinessCard}>
      <h2 className={styles.title}>
        Today Readiness
      </h2>

      {/* SCORE CIRCLE */}
      <div
        className={styles.readinessCircle}
        style={{
          borderColor: report.color,
          boxShadow: `0 0 24px ${report.color}30`,
        }}
      >
        <div
          className={
            styles.readinessScore
          }
          style={{
            color: report.color,
          }}
        >
          {report.score}
        </div>

        <span
          className={
            styles.readinessLabel
          }
        >
          SCORE
        </span>
      </div>

      {/* STATUS */}
      <div
        className={
          styles.readinessStatus
        }
        style={{
          color: report.color,
        }}
      >
        {report.status}
      </div>

      <p className={styles.readinessAdvice}>
        {report.advice}
      </p>

      {/* PANES */}
      <div className={styles.readinessStats}>
        <div
          className={
            styles.readinessMini
          }
        >
          <span>
            7D FATIGUE
          </span>
          <strong>
            {report.fatigue7.toFixed(
              1
            )} / 10
          </strong>
        </div>

        <div
          className={
            styles.readinessMini
          }
        >
          <span>
            28D FATIGUE
          </span>
          <strong>
            {report.fatigue28.toFixed(
              1
            )} /10
          </strong>
        </div>

        <div
          className={
            styles.readinessMini
          }
        >
          <span>
            7D AVG HR
          </span>
          <strong>
            {report.hr7.toFixed(0)}
          </strong>
        </div>

        <div
          className={
            styles.readinessMini
          }
        >
          <span>
            7D AVG POWER
          </span>
          <strong>
            {report.power7.toFixed(
              0
            )}
            w
          </strong>
        </div>
      </div>
    </div>
  );
}