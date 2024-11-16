import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import NodeCache from "node-cache";

type Response =
  | {
      id: string;
      username: string;
      name: string;
      description: string;
      followers: number;
      following: number;
      profile_image: string;
      banner_image: string;
    }
  | { error: string };

// Initialize cache with a 24 hours TTL (time-to-live)
const cache = new NodeCache({
  stdTTL: 60 * 60 * 24,
});

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params;

  // Check if data is cached
  const cachedData = cache.get(username);
  if (cachedData) {
    return NextResponse.json(cachedData as Response);
  }

  try {
    // Fetch from the Flask API if not in cache
    const response = await axios.get(`http://localhost:3001/api/profile/${username}`);

    // Cache the response data
    cache.set(username, response.data);

    // Return the data
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 });
  }
}
