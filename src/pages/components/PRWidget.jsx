import { useEffect, useState } from "react";
import styles from "@/styles/PRWidget.module.css";

export default function PRWidget() {
  const [prs, setPrs] = useState([]);

  useEffect(() => {
    loadPRs();
  }, []);

  const formatLabel = (key) => {
    const map = {
      fastestSpeed: "Fastest Speed",
      longestRide: "Longest Ride",
      highestAvgPower: "Highest Avg Power (watts)",
      highestMaxPower: "Highest Max Power (watts)",
      longestDuration: "Longest Duration",
      highestAvgHr: "Highest Avg HR",
      best5sec: "Best 5 sec Power (watts)",
      best30sec: "Best 30 sec Power (watts)",
      best1min: "Best 1 min Power (watts)",
      best5min: "Best 5 min Power (watts)",
      best20min: "Best 20 min Power (watts)",
    };

    return map[key] || key;
  };

const loadPRs = async () => {
  const res = await fetch("/api/prs");
  const json = await res.json();

  if (!json.success) return;

  const data = json.data;

  if (Array.isArray(data)) {
    setPrs(data);
    return;
  }

  if (
    data &&
    typeof data === "object"
  ) {
    const items =
      Object.keys(data)
        .filter(
          (key) =>
            data[key] &&
            data[key].value !==
              undefined
        )
        .map((key) => ({
          name: formatLabel(key),
          value:
            data[key].value,
          date:
            data[key].date,
        }));

    setPrs(items);
    return;
  }

  setPrs([]);
};

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>
        Personal Records
      </h2>

      <div className={styles.grid}>
        {prs.map((item, i) => (
          <div
            key={i}
            className={styles.card}
          >
            <span className={styles.badge}>
              🏆
            </span>

            <span className={styles.name}>
              {item.name}
            </span>

            <strong className={styles.value}>
              {item.value}
            </strong>

            <span className={styles.date}>
              {new Date(
                item.date
              ).toLocaleDateString(
                "en-GB"
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}