/* src/pages/api/achievements.js */

import clientPromise from "@/lib/mongodb.js";

export default async function handler(
  req,
  res
) {
  try {
    const client =
      await clientPromise;

    const db =
      client.db("cycler");

    const userId =
      "itsevangelos@gmail.com";

    const sessions =
      await db
        .collection(
          "workouts"
        )
        .find({
          userId,
        })
        .sort({
          createdAt: -1,
        })
        .toArray();

    if (!sessions.length) {
      return res.status(200).json({
        success: true,
        stats: null,
      });
    }

    const fastestSpeed =
      Math.max(
        ...sessions.map(
          (x) =>
            x.topSpeed || 0
        )
      );

    const longestRide =
      Math.max(
        ...sessions.map(
          (x) =>
            x.distance || 0
        )
      );

    const highestAvgPower =
      Math.max(
        ...sessions.map(
          (x) =>
            x.avgPower || 0
        )
      );

    const highestMaxPower =
      Math.max(
        ...sessions.map(
          (x) =>
            x.maxPower || 0
        )
      );

    const longestDuration =
      Math.max(
        ...sessions.map(
          (x) =>
            x.duration || 0
        )
      );

    const highestAvgHr =
      Math.max(
        ...sessions.map(
          (x) =>
            x.avgHeartRate ||
            0
        )
      );

    /* streak */

    const weekSet =
      new Set();

    sessions.forEach(
      (item) => {
        const d =
          new Date(
            item.createdAt
          );

        const year =
          d.getFullYear();

        const firstJan =
          new Date(
            year,
            0,
            1
          );

        const week =
          Math.ceil(
            ((d -
              firstJan) /
              86400000 +
              firstJan.getDay() +
              1) /
              7
          );

        weekSet.add(
          `${year}-${week}`
        );
      }
    );

    const sortedWeeks =
      Array.from(
        weekSet
      ).sort();

    let streak = 1;
    let maxStreak = 1;

    for (
      let i = 1;
      i <
      sortedWeeks.length;
      i++
    ) {
      const prev =
        sortedWeeks[
          i - 1
        ].split("-");

      const curr =
        sortedWeeks[
          i
        ].split("-");

      const prevNum =
        Number(
          prev[0]
        ) *
          100 +
        Number(
          prev[1]
        );

      const currNum =
        Number(
          curr[0]
        ) *
          100 +
        Number(
          curr[1]
        );

      if (
        currNum ===
        prevNum + 1
      ) {
        streak++;
        maxStreak =
          Math.max(
            maxStreak,
            streak
          );
      } else {
        streak = 1;
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        fastestSpeed:
          fastestSpeed.toFixed(
            1
          ),
        longestRide:
          longestRide.toFixed(
            1
          ),
        highestAvgPower,
        highestMaxPower,
        longestDuration:
          (
            longestDuration /
            3600
          ).toFixed(1),
        highestAvgHr,
        streakWeeks:
          maxStreak,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error.message,
    });
  }
}