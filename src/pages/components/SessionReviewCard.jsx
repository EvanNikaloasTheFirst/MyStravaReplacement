import { useState } from "react";
import styles from "@/styles/Home.module.css";

export default function SessionReviewCard({
  session,
  topSpeed,
  avgSpeed,
  maxPower,
  avgPower,
}) {
  const [loading, setLoading] =
    useState(false);

  const handleAIAnalysis =
    async () => {
      setLoading(true);

      /* DUMMY FUNCTION
         Later replace with fetch("/api/analyse")
         and send session data
      */

      const payload = {
        distance:
          session.total_distance,
        duration:
          session.total_timer_time,
        calories:
          session.total_calories,
        avgHr:
          session.avg_heart_rate,
        maxHr:
          session.max_heart_rate,
        topSpeed,
        avgSpeed,
        maxPower,
        avgPower,
      };

      console.log(
        "Sending to AI:",
        payload
      );

      setTimeout(() => {
        alert(
          "AI Analysis Coming Soon 🚀"
        );
        setLoading(false);
      }, 1400);
    };

  if (!session) return null;

  return (
    <div className={styles.statGrid}>
      <div className={styles.statCard}>
        <button
          className={
            styles.aiButton
          }
          onClick={
            handleAIAnalysis
          }
          disabled={loading}
        >
          {loading
            ? "Analysing..."
            : "Analyse With AI"}
        </button>
      </div>

      <div className={styles.statCard}>
        <span>Distance</span>
        <strong>
          {session.total_distance?.toFixed(
            2
          )}{" "}
          km
        </strong>
      </div>

      <div className={styles.statCard}>
        <span>Duration</span>
        <strong>
          {(
            session.total_timer_time /
            60
          ).toFixed(1)}{" "}
          mins
        </strong>
      </div>

      <div className={styles.statCard}>
        <span>Calories</span>
        <strong>
          {
            session.total_calories
          }
        </strong>
      </div>

      <div className={styles.statCard}>
        <span>Avg HR</span>
        <strong>
          {
            session.avg_heart_rate
          }
        </strong>
      </div>

      <div className={styles.statCard}>
        <span>Max HR</span>
        <strong>
          {
            session.max_heart_rate
          }
        </strong>
      </div>

      <div className={styles.statCard}>
        <span>Top Speed</span>
        <strong>
          {topSpeed} km/h
        </strong>
      </div>

      <div className={styles.statCard}>
        <span>Avg Speed</span>
        <strong>
          {avgSpeed} km/h
        </strong>
      </div>

      <div className={styles.statCard}>
        <span>Max Power</span>
        <strong>
          {maxPower} w
        </strong>
      </div>

      <div className={styles.statCard}>
        <span>Avg Power</span>
        <strong>
          {avgPower} w
        </strong>
      </div>
    </div>
  );
}