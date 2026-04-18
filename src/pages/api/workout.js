/* src/pages/api/workout.js */

import clientPromise from "@/lib/mongodb.js";

import { buildUpdatedPRs } from "@/helpers/prHelpers";
const getValue = (entry) =>
  entry?.value || 0;

const detectNewPRs = (
  previous = {},
  updated = {}
) => {
  const labels = {
    fastestSpeed:
      "🚴 Fastest Speed",
    longestRide:
      "📏 Longest Ride",
    highestAvgPower:
      "⚡ Highest Avg Power",
    highestMaxPower:
      "💥 Highest Max Power",
    longestDuration:
      "⏱ Longest Duration",
    highestAvgHr:
      "❤️ Highest Avg HR",
    best5sec:
      "🔥 Best 5 sec Power",
    best30sec:
      "🔥 Best 30 sec Power",
    best1min:
      "🔥 Best 1 min Power",
    best5min:
      "🔥 Best 5 min Power",
    best20min:
      "🔥 Best 20 min Power",
  };

  const units = {
    fastestSpeed:
      " km/h",
    longestRide:
      " km",
    highestAvgPower:
      " w",
    highestMaxPower:
      " w",
    longestDuration:
      " sec",
    highestAvgHr:
      " bpm",
    best5sec:
      " w",
    best30sec:
      " w",
    best1min:
      " w",
    best5min:
      " w",
    best20min:
      " w",
  };

  const newPRs = [];

  Object.keys(labels).forEach(
    (key) => {
      const oldVal =
        getValue(
          previous[key]
        );

      const newVal =
        getValue(
          updated[key]
        );

      if (
        newVal > oldVal
      ) {
        newPRs.push({
          key,
          name:
            labels[key],
          value:
            `${newVal}${units[key]}`,
        });
      }
    }
  );

  return newPRs;
};

export default async function handler(
  req,
  res
) {
  if (
    req.method !==
    "POST"
  ) {
    return res.status(405).json({
      success: false,
      message:
        "Method not allowed",
    });
  }

  try {
    const client =
      await clientPromise;

    const db =
      client.db(
        "cycler"
      );

    const workout = {
      ...req.body,

      createdAt:
        req.body.createdAt
          ? new Date(
              req.body.createdAt
            )
          : new Date(),
    };

    /* SAVE WORKOUT */

    const result =
      await db
        .collection(
          "workouts"
        )
        .insertOne(
          workout
        );

    /* LOAD OLD PRS */

    const currentPRs =
      (await db
        .collection(
          "personal_records"
        )
        .findOne({
          userId:
            workout.userId,
        })) || {};

    /* BUILD NEW PRS */

    const updatedPRs =
      buildUpdatedPRs(
        currentPRs,
        workout
      );

    updatedPRs.userId =
      workout.userId;

    updatedPRs.updatedAt =
      new Date();

    /* DETECT NEW PRS */

    const newPRs =
      detectNewPRs(
        currentPRs,
        updatedPRs
      );

    /* SAVE UPDATED PRS */

    await db
      .collection(
        "personal_records"
      )
      .updateOne(
        {
          userId:
            workout.userId,
        },
        {
          $set:
            updatedPRs,
        },
        {
          upsert: true,
        }
      );

    return res.status(200).json({
      success: true,
      id:
        result.insertedId,
      newPRs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error:
        error.message,
    });
  }
}