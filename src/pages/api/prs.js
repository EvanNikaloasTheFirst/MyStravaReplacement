/* src/pages/api/prs.js */

import clientPromise from "@/lib/mongodb.js";

export default async function handler(
  req,
  res
) {
  if (
    req.method !== "GET"
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

    const prs =
      await db
        .collection(
          "personal_records"
        )
        .findOne({
          userId:
            "itsevangelos@gmail.com",
        });

    if (!prs) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: prs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error:
        error.message,
    });
  }
}