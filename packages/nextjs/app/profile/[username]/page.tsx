"use server";

import React, { useEffect } from "react";
import { PrivyClient } from "@privy-io/server-auth";
import Bento from "@/components/Bento";
import ProfileBanner from "@/components/ProfileBanner";

const privy = new PrivyClient("cm3j2xanc00ohxc232di6d8z5", "");

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

export default async function Profile({ params }: { params: { username: string } }) {
  const { username } = params;

  let data: Response;

  try {
    data = await fetch(`http://queue.siborg.io:3001/api/profile/${username}`, {
      /*
      cache: "force-cache",
      next: {
        revalidate: 60 * 60 * 24,
      },
      */
    }).then(res => res.json());
  } catch (e) {
    data = { error: "ERROR" };
  }

  if ("error" in data) {
    // redirect to 404
    return (
      <div className="flex items-center justify-center w-full min-h-[55vh] text-4xl font-bold text-white">
        404 - Not Found
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-5 md:px-4 4xl:px-4 py-0 2xl:container min-h-[85vh]">
        <ProfileBanner
          name={data?.name || "Satoshi Nakamoto"}
          handle={data?.username || "satoshi"}
          description={data?.description || "Creator of Bitcoin, cryptography enthusiast, and privacy advocate."}
          avatarUrl={data?.profile_image || "/placeholder.svg?height=128&width=128"}
          bannerUrl={data?.banner_image || "/placeholder.svg?height=128&width=1024"}
          stats={[
            { label: "Following", value: data?.following },
            { label: "Followers", value: data?.followers },

            /*{
              label: "Market Cap",
              value: "420.69$",
            },
            */
          ]}
        />
        <Bento username={username} />
      </div>
    </>
  );
}
