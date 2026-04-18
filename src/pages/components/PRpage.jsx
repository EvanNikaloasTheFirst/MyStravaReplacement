import { useEffect, useState } from "react";
import styles from "@/styles/PRPage.module.css";

export default function PRPage() {
  const [prs, setPrs] =
    useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await fetch(
      "/api/personal-records"
    );

    const json =
      await res.json();

    if (json.success) {
      setPrs(json.data);
    }
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
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const Card = (
    title,
    icon,
    item,
    unit
  ) => {
    if (!item) return null;

    return (
      <div className={styles.card}>
        <span className={styles.label}>
          {icon} {title}
        </span>

        <strong className={styles.value}>
          {item.value}
          {unit}
        </strong>

        <span className={styles.meta}>
          {formatDate(
            item.date
          )}
        </span>

        <span className={styles.meta}>
          {
            item.sessionName
          }
        </span>
      </div>
    );
  };

  if (!prs)
    return (
      <div className={styles.wrap}>
        Loading...
      </div>
    );

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>
        🏆 Personal Records
      </h2>

      <div className={styles.grid}>
        {Card(
          "Best 5 sec",
          "⚡",
          prs.best5sec,
          "w"
        )}

        {Card(
          "Best 1 min",
          "🔥",
          prs.best1min,
          "w"
        )}

        {Card(
          "Best 20 min",
          "🚀",
          prs.best20min,
          "w"
        )}

        {Card(
          "Longest Ride",
          "🚴",
          prs.longestRide,
          "km"
        )}

        {Card(
          "Fastest Speed",
          "💨",
          prs.fastestSpeed,
          "km/h"
        )}

        {Card(
          "Highest Avg Power",
          "⚙️",
          prs.highestAvgPower,
          "w"
        )}
      </div>
    </div>
  );
}