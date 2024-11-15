import React from "react";
import ProfileBanner from "@/components/ProfileBanner";

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
  const data: Response = await fetch(`http://localhost:3001/api/profile/${username}`, {
    cache: "force-cache",
    next: {
      revalidate: 60 * 60 * 24,
    },
  }).then(res => res.json());

  if ("error" in data) {
    return <div>{data.error}</div>;
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
          ]}
        />
      </div>
    </>
  );
}
