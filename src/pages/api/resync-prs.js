import clientPromise from "@/lib/mongodb.js";

import { buildUpdatedPRs } from "@/helpers/prHelpers";

export default async function handler(
  req,
  res
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const client =
      await clientPromise;

    const db =
      client.db("cycler");

    const userId =
      "itsevangelos@gmail.com";

    const workouts =
      await db
        .collection("workouts")
        .find({ userId })
        .sort({ createdAt: 1 })
        .toArray();

    let prs = {};

    for (const workout of workouts) {
      prs =
        buildUpdatedPRs(
          prs,
          workout
        );
    }

    prs.userId = userId;
    prs.updatedAt =
      new Date();

    await db
      .collection(
        "personal_records"
      )
      .updateOne(
        { userId },
        { $set: prs },
        { upsert: true }
      );

    return res.status(200).json({
      success: true,
      total:
        workouts.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error:
        error.message,
    });
  }
}