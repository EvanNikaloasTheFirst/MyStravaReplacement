/* src/lib/prHelpers.js */

export const rollingBest = (
  stream = [],
  seconds = 5
) => {
  if (
    !Array.isArray(stream) ||
    stream.length < seconds
  ) {
    return 0;
  }

  let sum = 0;

  for (
    let i = 0;
    i < seconds;
    i++
  ) {
    sum +=
      Number(stream[i]) || 0;
  }

  let best =
    sum / seconds;

  for (
    let i = seconds;
    i < stream.length;
    i++
  ) {
    sum =
      sum -
      (Number(
        stream[
          i - seconds
        ]
      ) || 0) +
      (Number(
        stream[i]
      ) || 0);

    const avg =
      sum / seconds;

    if (avg > best) {
      best = avg;
    }
  }

  return Math.round(best);
};

export const prEntry = (
  value,
  workout
) => ({
  value:
    Number(value) || 0,

  date:
    workout?.createdAt
      ? new Date(
          workout.createdAt
        )
      : new Date(),

  sessionName:
    workout?.sessionName ||
    workout?.fileName ||
    "Workout",
});

export const updateIfHigher = (
  current,
  next
) => {
  if (
    !next ||
    !next.value ||
    next.value <= 0
  ) {
    return current;
  }

  if (!current) {
    return next;
  }

  return next.value >
    current.value
    ? next
    : current;
};

export const buildUpdatedPRs = (
  current = {},
  workout = {}
) => {
  const power =
    workout.powerStream ||
    [];

  return {
    ...current,

    userId:
      workout.userId,

    fastestSpeed:
      updateIfHigher(
        current.fastestSpeed,
        prEntry(
          workout.topSpeed,
          workout
        )
      ),

    longestRide:
      updateIfHigher(
        current.longestRide,
        prEntry(
          workout.distance,
          workout
        )
      ),

    highestAvgPower:
      updateIfHigher(
        current.highestAvgPower,
        prEntry(
          workout.avgPower,
          workout
        )
      ),

    highestMaxPower:
      updateIfHigher(
        current.highestMaxPower,
        prEntry(
          workout.maxPower,
          workout
        )
      ),

    longestDuration:
      updateIfHigher(
        current.longestDuration,
        prEntry(
          workout.duration,
          workout
        )
      ),

    highestAvgHr:
      updateIfHigher(
        current.highestAvgHr,
        prEntry(
          workout.avgHeartRate,
          workout
        )
      ),

    best5sec:
      updateIfHigher(
        current.best5sec,
        prEntry(
          rollingBest(
            power,
            5
          ),
          workout
        )
      ),

    best30sec:
      updateIfHigher(
        current.best30sec,
        prEntry(
          rollingBest(
            power,
            30
          ),
          workout
        )
      ),

    best1min:
      updateIfHigher(
        current.best1min,
        prEntry(
          rollingBest(
            power,
            60
          ),
          workout
        )
      ),

    best5min:
      updateIfHigher(
        current.best5min,
        prEntry(
          rollingBest(
            power,
            300
          ),
          workout
        )
      ),

    best20min:
      updateIfHigher(
        current.best20min,
        prEntry(
          rollingBest(
            power,
            1200
          ),
          workout
        )
      ),

    updatedAt:
      new Date(),
  };
};