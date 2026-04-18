/* src/pages/api/all-workouts.js */

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

    const sessions =
      await db
        .collection(
          "workouts"
        )
        .find({})
        .sort({
          createdAt: -1,
        })
        .toArray();

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error.message,
    });
  }
}