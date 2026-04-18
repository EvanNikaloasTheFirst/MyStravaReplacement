import Head from "next/head";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import styles from "@/styles/Home.module.css";
import FitParser from "fit-file-parser";
import SessionReviewCard from "./components/SessionReviewCard";
import RecentSessions from "./components/RecentSessions";
import TrainingReadiness from "./components/TrainingReadiness";
import WeeklyChart from "./components/WeeklyChart";
import PRWidget from "./components/PRWidget";
import PastSessions from "./components/PastSessions";
import Achievements from "./components/Achievements";

const WorkoutMap = dynamic(() => import("./components/WorkoutMap"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});



export default function Home() {
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [workoutData, setWorkoutData] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [rating, setRating] = useState(5);
  const [completedAt, setCompletedAt] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const getEmoji = (value) => {
    if (value <= 2) return "😌";
    if (value <= 4) return "🙂";
    if (value <= 6) return "😅";
    if (value <= 8) return "🥵";
    return "💀";
  };

  const getDefaultSessionName = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Morning Activity";
    if (hour < 18) return "Afternoon Activity";
    return "Evening Activity";
  };

  const getFitTitle = (data, file) => {
    const session = data?.sessions?.[0];

    if (session?.event) return session.event;

    if (session?.sport) {
      return `${session.sport} Session`;
    }

    return file.name.replace(".fit", "");
  };

  const getFitDate = (data) => {
    const session = data?.sessions?.[0];
    const activity = data?.activity;
    const records = data?.records || [];

    if (activity?.timestamp) {
      return new Date(activity.timestamp);
    }

    if (session?.start_time) {
      return new Date(session.start_time);
    }

    if (session?.timestamp) {
      return new Date(session.timestamp);
    }

    if (
      records.length > 0 &&
      records[0]?.timestamp
    ) {
      return new Date(
        records[0].timestamp
      );
    }

    if (data?.laps?.[0]?.start_time) {
      return new Date(
        data.laps[0].start_time
      );
    }

    return new Date();
  };

  const parseFitFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const fitParser = new FitParser({
          force: true,
          speedUnit: "km/h",
          lengthUnit: "km",
          temperatureUnit: "celsius",
        });

        fitParser.parse(
          e.target.result,
          (error, data) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(data);
          }
        );
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };


  const formatPRLabel = (key) => {
  const map = {
    fastestSpeed: "Fastest Speed",
    longestRide: "Longest Ride",
    highestAvgPower: "Highest Avg Power",
    highestMaxPower: "Highest Max Power",
    longestDuration: "Longest Duration",
    highestAvgHr: "Highest Avg HR",
    best5sec: "Best 5 sec Power",
    best30sec: "Best 30 sec Power",
    best1min: "Best 1 min Power",
    best5min: "Best 5 min Power",
    best20min: "Best 20 min Power",
  };

  return map[key] || key;
};

const buildWorkoutPayload = (
  data,
  fileName,
  title,
  completedDate,
  customRating = 5
) => {
  const session = data?.sessions?.[0];
  const records = data?.records || [];

  const speeds = records
    .map((r) => r.speed)
    .filter(
      (v) =>
        typeof v === "number"
    );

  const powers = records
    .map((r) => r.power)
    .filter(
      (v) =>
        typeof v === "number"
    );

const heartRates = records
  .map(
    (r) =>
      r.heart_rate ??
      r.heartRate ??
      r.heartRateBpm
  )
    .filter(
      (v) =>
        typeof v === "number"
    );

  /* STREAMS FOR CHARTS */

 const powerStream = records
  .map((r) => r.power)
  .filter((v) => typeof v === "number");

const hrStream = records
  .map(
    (r) =>
      r.heart_rate ??
      r.heartRate
  )
  .filter((v) => typeof v === "number");

const speedStream = records
  .map((r) => r.speed)
  .filter((v) => typeof v === "number");

  const cadenceStream =
    records
      .map((r) => r.cadence)
      .filter(
        (v) =>
          typeof v ===
          "number"
      );

  const topSpeed = speeds.length
    ? Number(
        Math.max(
          ...speeds
        ).toFixed(2)
      )
    : 0;

  const avgSpeed = speeds.length
    ? Number(
        (
          speeds.reduce(
            (a, b) =>
              a + b,
            0
          ) /
          speeds.length
        ).toFixed(2)
      )
    : 0;

  const maxPower =
    powers.length
      ? Math.max(
          ...powers
        )
      : 0;

  const avgPower =
    powers.length
      ? Math.round(
          powers.reduce(
            (a, b) =>
              a + b,
            0
          ) /
            powers.length
        )
      : 0;

  const route = records
    .filter(
      (r) =>
        typeof r.position_lat ===
          "number" &&
        typeof r.position_long ===
          "number"
    )
    .map((r) => ({
      lat: r.position_lat,
      lng: r.position_long,
    }));

  return {
    userId:
      "itsevangelos@gmail.com",

    sessionName: title,
    rating: customRating,
    fileName,

    sport:
      session?.sport || "",

    distance:
      session?.total_distance ||
      0,

    duration:
      session?.total_timer_time ||
      0,

    calories:
      session?.total_calories ||
      0,

    avgHeartRate:
      session?.avg_heart_rate ||
      0,

    maxHeartRate:
      session?.max_heart_rate ||
      0,

    topSpeed,
    avgSpeed,
    maxPower,
    avgPower,

    route,

    /* NEW STREAMS */

    powerStream,
    hrStream,
    speedStream,
    cadenceStream,

    createdAt:
      completedDate,
  };
};
  const saveWorkoutPayload =
    async (payload) => {
      const response =
        await fetch(
          "/api/workout",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload
            ),
          }
        );

      return response.json();
    };

  const handleSingleFile =
    async (file) => {
      try {
        setFileName(file.name);

        const data =
          await parseFitFile(file);

        const fitTitle =
          getFitTitle(
            data,
            file
          );

        const fitDate =
          getFitDate(data);

        setSessionName(
          fitTitle ||
            getDefaultSessionName()
        );

        setCompletedAt(
          fitDate
        );

        setWorkoutData(data);
        setShowPanel(true);
      } catch {
        alert(
          "Failed to read FIT file"
        );
      }
    };

  const processAndSaveFile =
    async (file) => {
      try {
        const data =
          await parseFitFile(file);

        const fitTitle =
          getFitTitle(
            data,
            file
          );

        const fitDate =
          getFitDate(data);

        const payload =
          buildWorkoutPayload(
            data,
            file.name,
            fitTitle,
            fitDate,
            5
          );

        await saveWorkoutPayload(
          payload
        );

        return true;
      } catch {
        return false;
      }
    };

  const handleFiles = async (
    files
  ) => {
    if (
      !files ||
      files.length === 0
    )
      return;

    if (files.length === 1) {
      handleSingleFile(
        files[0]
      );
      return;
    }

    setIsImporting(true);

    setFileName(
      `${files.length} files selected`
    );

    let successCount = 0;

    for (const file of files) {
      const success =
        await processAndSaveFile(
          file
        );

      if (success)
        successCount++;
    }

    setIsImporting(false);

    alert(
      `${successCount} of ${files.length} workouts imported`
    );
  };

  const saveWorkout = async () => {
  const payload =
    buildWorkoutPayload(
      workoutData,
      fileName,
      sessionName,
      completedAt || new Date(),
      rating
    );

  const result =
    await saveWorkoutPayload(payload);

  if (result.success) {
    if (
      result.newPRs &&
      result.newPRs.length > 0
    ) {
      alert(
        "🏆 NEW PERSONAL RECORDS!\n\n" +
          result.newPRs
            .map(
              (pr) =>
                `${formatPRLabel(pr.key)}: ${pr.value}`
            )
            .join("\n")
      );
    } else {
      alert(
        "Workout saved to database"
      );
    }

    setShowPanel(false);
  } else {
    alert("Failed to save");
  }
};

  const session =
    workoutData?.sessions?.[0];

  const records =
    workoutData?.records || [];

  const mapPoints = records
    .filter(
      (r) =>
        typeof r.position_lat ===
          "number" &&
        typeof r.position_long ===
          "number"
    )
    .map((r) => [
      r.position_lat,
      r.position_long,
    ]);

  const speeds = records
    .map((r) => r.speed)
    .filter(
      (v) =>
        typeof v === "number"
    );

  const powers = records
    .map((r) => r.power)
    .filter(
      (v) =>
        typeof v === "number"
    );

  const topSpeed = speeds.length
    ? Math.max(
        ...speeds
      ).toFixed(2)
    : "--";

  const avgSpeed = speeds.length
    ? (
        speeds.reduce(
          (a, b) => a + b,
          0
        ) / speeds.length
      ).toFixed(2)
    : "--";

  const maxPower = powers.length
    ? Math.max(...powers)
    : "--";

  const avgPower = powers.length
    ? Math.round(
        powers.reduce(
          (a, b) => a + b,
          0
        ) / powers.length
      )
    : "--";

  return (
    <>
      <Head>
        <title>
          Workout Import
        </title>
      </Head>

      <div
        className={`${styles.page}`}
      >
        <main
          className={`${styles.main} ${
            showPanel
              ? styles.blurBackground
              : ""
          }`}
        >
          <div
            className={
              styles.grid
            }
          >
            <div
              className={
                styles.box
              }
            >
              <div
                className={
                  styles.cardContent
                }
              >
                <h2
                  className={
                    styles.title
                  }
                >
                  Workout Import
                </h2>

                <button
                  className={
                    styles.importBtn
                  }
                  disabled={
                    isImporting
                  }
                  onClick={() =>
                    fileInputRef.current.click()
                  }
                >
                  {isImporting
                    ? "Importing..."
                    : "Upload .FIT Files"}
                </button>

                {fileName && (
                  <p
                    className={
                      styles.fileName
                    }
                  >
                    {fileName}
                  </p>
                )}

                <input
                  type="file"
                  accept=".fit"
                  multiple
                  hidden
                  ref={
                    fileInputRef
                  }
                  onChange={(
                    e
                  ) =>
                    handleFiles(
                      Array.from(
                        e.target
                          .files
                      )
                    )
                  }
                />
              </div>
            </div>

            <div
              className={
                styles.box
              }
            >
              <PRWidget/>
              <button
  className={styles.importBtn}
  onClick={async () => {
    const res =
      await fetch(
        "/api/resync-prs",
        {
          method: "POST",
        }
      );

    const json =
      await res.json();

    if (json.success) {
      alert(
        `PRs rebuilt from ${json.total} workouts`
      );
    } else {
      alert("Failed");
    }
  }}
>
  Resync PRs
</button>
            </div>

            <div
              className={
                styles.box
              }
            >
              {/* <TrainingReadiness /> */}
            </div>

            <div
              className={
                styles.box
              }
            >

              
                <WeeklyChart/>

            </div>

            <div
              className={
                styles.box
              }
            >

                <Achievements/>
            </div>

            <div
              className={
                styles.box
              }
            >
              <PastSessions/>

            </div>
          </div>
        </main>

        {showPanel && (
          <>
            <div
              className={
                styles.overlay
              }
              onClick={() =>
                setShowPanel(
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
                  Workout
                  Summary
                </h2>

                <button
                  className={
                    styles.closeBtn
                  }
                  onClick={() =>
                    setShowPanel(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  marginBottom: 20,
                }}
              >
                <label>
                  Session Name
                </label>

                <input
                  value={
                    sessionName
                  }
                  onChange={(
                    e
                  ) =>
                    setSessionName(
                      e
                        .target
                        .value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "12px",
                    borderRadius:
                      "10px",
                    marginTop:
                      "8px",
                  }}
                />
              </div>

              {completedAt && (
                <div
                  style={{
                    marginBottom: 20,
                  }}
                >
                  <label>
                    Completed
                  </label>

                  <p
                    style={{
                      marginTop: 8,
                    }}
                  >
                    {new Date(
                      completedAt
                    ).toLocaleString()}
                  </p>
                </div>
              )}

              <div
                style={{
                  marginBottom: 24,
                }}
              >
                <label>
                  Effort
                  Rating:{" "}
                  {rating}/10{" "}
                  {getEmoji(
                    rating
                  )}
                </label>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={
                    rating
                  }
                  onChange={(
                    e
                  ) =>
                    setRating(
                      Number(
                        e
                          .target
                          .value
                      )
                    )
                  }
                  style={{
                    width:
                      "100%",
                    marginTop:
                      "10px",
                  }}
                />
              </div>

              {mapPoints.length >
                0 && (
                <div
                  style={{
                    marginBottom:
                      "20px",
                    borderRadius:
                      "14px",
                    overflow:
                      "hidden",
                  }}
                >
                  <WorkoutMap
                    points={
                      mapPoints
                    }
                  />
                </div>
              )}

              {session && (
                <SessionReviewCard
                  session={
                    session
                  }
                  topSpeed={
                    topSpeed
                  }
                  avgSpeed={
                    avgSpeed
                  }
                  maxPower={
                    maxPower
                  }
                  avgPower={
                    avgPower
                  }
                />
              )}

              <button
                className={
                  styles.importBtn
                }
                style={{
                  width:
                    "100%",
                  marginTop:
                    "25px",
                }}
                onClick={
                  saveWorkout
                }
              >
                Save
                Workout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}