/* src/pages/components/Achievements.js */

import { useEffect, useState } from "react";
import styles from "@/styles/Achievements.module.css";

export default function Achievements() {
  const [stats, setStats] = useState({
    fastestSpeed: 0,
    longestRide: 0,
    highestAvgPower: 0,
    highestMaxPower: 0,
    longestDuration: 0,
    highestAvgHr: 0,
    streakWeeks: 0,
  });

  useEffect(() => {
    loadData();
  }, []);
/* REPLACE loadData() in Achievements.js */

const loadData = async () => {
  const res = await fetch(
    "/api/achievements"
  );

  const json =
    await res.json();

  if (
    json.success &&
    json.stats
  ) {
    setStats(json.stats);
  }
};

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>
        Achievements
      </h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.label}>
            Fastest Speed
          </span>
          <strong className={styles.value}>
            {
              stats.fastestSpeed
            }
            km/h
          </strong>
        </div>

        <div className={styles.card}>
          <span className={styles.label}>
            Longest Ride
          </span>
          <strong className={styles.value}>
            {
              stats.longestRide
            }
            km
          </strong>
        </div>

        <div className={styles.card}>
          <span className={styles.label}>
            Highest Avg Power
          </span>
          <strong className={styles.value}>
            {
              stats.highestAvgPower
            }
            w
          </strong>
        </div>

        <div className={styles.card}>
          <span className={styles.label}>
            Highest Max Power
          </span>
          <strong className={styles.value}>
            {
              stats.highestMaxPower
            }
            w
          </strong>
        </div>

        <div className={styles.card}>
          <span className={styles.label}>
            Longest Duration
          </span>
          <strong className={styles.value}>
            {
              stats.longestDuration
            }
            h
          </strong>
        </div>

        <div className={styles.card}>
          <span className={styles.label}>
            Highest Avg HR
          </span>
          <strong className={styles.value}>
            {
              stats.highestAvgHr
            }
          </strong>
        </div>

        <div
          className={`${styles.card} ${styles.full}`}
        >
          <span className={styles.label}>
            Consecutive Weeks Trained
          </span>
          <strong className={styles.value}>
            {
              stats.streakWeeks
            }{" "}
            weeks
          </strong>
        </div>
      </div>
    </div>
  );
}