/* src/pages/api/recent-workouts.js */

import clientPromise from "../../lib/mongodb";

export default async function handler(
  req,
  res
) {
  try {
    const client =
      await clientPromise;

    const db = client.db("cycler");

    const sessions = await db
      .collection("workouts")
      .find({
        userId:
          "itsevangelos@gmail.com",
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
}