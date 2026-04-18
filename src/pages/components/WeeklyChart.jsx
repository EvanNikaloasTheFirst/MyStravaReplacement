/* src/pages/components/WeeklyLineGraph.js */

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import styles from "@/styles/WeeklyGraph.module.css";

export default function WeeklyChart() {
  const [metric, setMetric] =
    useState("distance");

  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await fetch(
      "/api/recent-workouts"
    );

    const json = await res.json();

    if (!json.success) return;

    const workouts = json.sessions || [];

    const days = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];

    const totals = days.map(
      (day) => ({
        day,
        distance: 0,
        avgHeartRate: 0,
        fatigue: 0,
        count: 0,
      })
    );

    workouts.forEach((item) => {
      const date = new Date(
        item.createdAt
      );

      let jsDay =
        date.getDay(); // Sun=0

      jsDay =
        jsDay === 0 ? 6 : jsDay - 1;

      totals[jsDay].distance +=
        item.distance || 0;

      totals[jsDay].avgHeartRate +=
        item.avgHeartRate || 0;

      totals[jsDay].fatigue +=
        item.rating || 0;

      totals[jsDay].count += 1;
    });

    const final = totals.map(
      (day) => ({
        day: day.day,
        distance:
          day.distance.toFixed(1),
        avgHeartRate:
          day.count > 0
            ? Math.round(
                day.avgHeartRate /
                  day.count
              )
            : 0,
        fatigue:
          day.count > 0
            ? Number(
                (
                  day.fatigue /
                  day.count
                ).toFixed(1)
              )
            : 0,
      })
    );

    setData(final);
  };

  const getLineName = () => {
    if (metric === "distance")
      return "KM";
    if (
      metric === "avgHeartRate"
    )
      return "Avg HR";
    return "Fatigue";
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <h2 className={styles.title}>
          Weekly Trend
        </h2>

        <select
          value={metric}
          onChange={(e) =>
            setMetric(
              e.target.value
            )
          }
          className={styles.select}
        >
          <option value="distance">
            Total KM
          </option>

          <option value="avgHeartRate">
            Avg HR
          </option>

          <option value="fatigue">
            Fatigue
          </option>
        </select>
      </div>

      <ResponsiveContainer
        width="100%"
        height={240}
      >
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey={metric}
            strokeWidth={3}
            dot={{ r: 4 }}
            name={getLineName()}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}