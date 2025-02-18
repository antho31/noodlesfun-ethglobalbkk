"use client";

/* eslint-disable @next/next/no-img-element */
import { use, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther, parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { getVisibility } from "@/lib/web3";

interface Stat {
  label: string;
  value: string | number;
}

interface ProfileBannerProps {
  name: string;
  handle: string;
  description: string;
  location?: string;
  avatarUrl: string;
  bannerUrl: string;
  stats: Stat[];
}

export default function ProfileBanner({
  name = "Satoshi Nakamoto",
  handle = "@satoshi",
  description = "Creator of Bitcoin, cryptography enthusiast, and privacy advocate.",
  avatarUrl = "/placeholder.svg?height=128&width=128",
  bannerUrl = "/placeholder.svg?height=128&width=1024",
  stats = [
    { label: "Following", value: 21 },
    { label: "Followers", value: "1M" },
    { label: "Market Cap", value: "$546B" },
    { label: "24h Volume", value: "$32B" },
  ],
}: ProfileBannerProps) {
  const [claim, setClaim] = useState<string>("0");
  const { user } = usePrivy();

  useEffect(() => {
    if (user?.wallet?.address) {
      getVisibility(`x-${handle}`).then(visibility => {
        setClaim(formatEther(visibility[2]));
      });
    }
  }, [user]);

  return (
    <div className="w-full mx-auto mt-4">
      <div className="relative">
        {/* Banner Image */}
        <div className="w-full h-32 overflow-hidden">
          <img src={bannerUrl} alt="Profile Banner" className="object-cover w-full h-full rounded-lg" />
        </div>

        {/* Avatar */}
        <div className="absolute bottom-0 transform translate-y-1/2 left-4">
          <div className="w-32 h-32 overflow-hidden bg-white border-4 rounded-full border-background">
            <img src={avatarUrl} alt={name} className="object-cover w-full h-full hover:animate-spin" />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 mt-20">
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-extrabold">{name}</h1>
            <p className="text-muted-foreground">@{handle}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="mt-2 text-foreground">{description}</p>

          {user && user.twitter?.username === handle && user.wallet?.address && (
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                if (!user?.wallet?.address) return;

                //  TODO: LOGIC HERE TO CLAIM ETH
              }}
            >
              Claim {claim} ETH
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-0 mt-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 text-center rounded-lg bg-card">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-purple-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
