"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { useFundWallet, useLoginWithOAuth, usePrivy, useWallets } from "@privy-io/react-auth";
import { Select } from "@radix-ui/react-select";
import axios from "axios";
import { Camera, Link, Share2, TrendingUp } from "lucide-react";
import { createPublicClient, createWalletClient, custom, encodeFunctionData, http } from "viem";
// import { VisibilityCreditsABI } from "@/abis/VisibilityCredits";
import { ChartComponent } from "@/components/Chart";
import { chain } from "@/components/Providers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// import useGraph from "@/lib/fetch";

// Mock data for activity
const useGraph = (username: string, address: string) => {
  return {
    data: {
      creditsTrades: [],
      visibility: {
        totalSupply: 100,
        balances: [],
      },
      porfolio: [],
    },
    mutate: () => {},
  };
};

// Mock data for activity
const activityData = [
  {
    user: "alice",
    type: "buy",
    price: 50000,
    amount: 0.5,
    timeAgo: "5 minutes ago",
  },
  {
    user: "bob",
    type: "sell",
    price: 49800,
    amount: 0.3,
    timeAgo: "10 minutes ago",
  },
  {
    user: "charlie",
    type: "buy",
    price: 50100,
    amount: 0.7,
    timeAgo: "15 minutes ago",
  },
];

// Mock data for top holders
const topHoldersData = [
  {
    username: "crypto_whale",
    avatar: "https://github.com/shadcn.png",
    balance: 100,
    percentage: 10,
  },
  {
    username: "hodler123",
    avatar: "https://github.com/shadcn.png",
    balance: 75,
    percentage: 7.5,
  },
  {
    username: "to_the_moon",
    avatar: "https://github.com/shadcn.png",
    balance: 50,
    percentage: 5,
  },
];

const initialData = [
  { time: "2018-12-22", value: 32.51 },
  { time: "2018-12-23", value: 31.11 },
  { time: "2018-12-24", value: 27.02 },
  { time: "2018-12-25", value: 27.32 },
  { time: "2018-12-26", value: 25.17 },
  { time: "2018-12-27", value: 28.89 },
  { time: "2018-12-28", value: 25.46 },
  { time: "2018-12-29", value: 23.92 },
  { time: "2018-12-30", value: 22.68 },
  { time: "2018-12-31", value: 22.67 },
  { time: "2019-01-01", value: 33.67 },
];

export default function Bento() {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");

  const { wallets } = useWallets();
  const { user } = usePrivy();
  const { data, mutate } = useGraph(user?.twitter?.username ?? "", user?.wallet?.address ?? "");

  const [maxSellAmount, setMaxSellAmount] = useState(1); // Simulated max amount to sell
  const [tweetContent, setTweetContent] = useState("");
  const [tweetUrl, setTweetUrl] = useState("");

  const handleReset = () => {
    setAmount("");
  };

  const handleQuickBuy = (value: number) => {
    setAmount(value.toString());
  };

  const handleQuickSell = (percentage: number) => {
    const sellAmount = ((maxSellAmount * percentage) / 100).toFixed(8);
    setAmount(sellAmount);
  };

  function transformCreditsTradesToChartData(creditsTrades: any): { time: number; value: number }[] {
    // Sort by timestamp in ascending order
    const sortedTrades = creditsTrades.sort((a: any, b: any) => Number(a.timestamp) - Number(b.timestamp));

    return sortedTrades.map((trade: any) => {
      // const date = new Date(Number(trade.timestamp) / 1000000);
      // const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const value = Number(trade.tradeEvent_newCurrentPrice) / 1e14; // Convert newCurrentPrice to a more readable number
      return { time: Number(trade.timestamp), value };
    });
  }

  const trades = useMemo(() => {
    if (!data) return [];

    return transformCreditsTradesToChartData(data["creditsTrades"]);
  }, [data]);

  const activityData = useMemo(() => {
    if (!data) return [];

    function timeAgo(timestamp: any) {
      const now = Date.now();
      const secondsAgo = Math.floor((now - timestamp) / 1000);

      if (secondsAgo < 60) {
        return `${secondsAgo} seconds ago`;
      } else if (secondsAgo < 3600) {
        const minutes = Math.floor(secondsAgo / 60);
        return `${minutes} minutes ago`;
      } else if (secondsAgo < 86400) {
        const hours = Math.floor(secondsAgo / 3600);
        return `${hours} hours ago`;
      } else {
        const days = Math.floor(secondsAgo / 86400);
        return `${days} days ago`;
      }
    }

    return data["creditsTrades"]
      .map((trade: any) => ({
        user: trade.visibility.creator || "unknown",
        type: trade.tradeEvent_isBuy ? "buy" : "sell",
        price: trade.tradeEvent_tradeCost / 1e18,
        amount: trade.tradeEvent_amount,
        timeAgo: timeAgo(Number(trade.timestamp) / 1000),
      }))
      .reverse();
  }, [data]);

  const topHoldersData = useMemo(() => {
    if (!data) return [];

    const totalSupply = data["visibility"]["totalSupply"];
    const visibilityBalances = data["visibility"]["balances"];

    return visibilityBalances.map((balance: any) => {
      let percentage = (balance.balance / totalSupply) * 100;
      if (Number.isNaN(percentage)) percentage = 0;

      return {
        username: balance.user,
        avatar: "",
        balance: balance.balance,
        percentage: percentage.toFixed(2),
      };
    });
  }, [data]);

  return (
    <div className="mt-4 mb-12">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* TradingView Chart */}
        <div className="p-4 rounded-lg shadow-lg lg:col-span-2 bg-card text-card-foreground">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Chart</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-0" />
                Share
              </Button>
              {/* <Button variant="outline" size="sm">
                                <Camera className="w-4 h-4 mr-0" />
                            </Button> */}
              <Button variant="outline" size="sm">
                {/* <TrendingUp className="w-4 h-4 mr-2" /> */}
                🤙 Flex
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-md aspect-video">
            {trades.length > 0 ? (
              <ChartComponent data={trades} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">loading...</div>
            )}
          </div>
        </div>

        {/* Buy/Sell Section */}
        <div className="p-4 rounded-lg shadow-lg bg-card text-card-foreground">
          <div className="flex items-center justify-between">
            <h2 className="mb-2 text-lg font-semibold">Trade</h2>
            <h2 className="mb-2 font-semibold text-md">0.5 ETH</h2>
          </div>
          <Tabs defaultValue="buy" onValueChange={value => setMode(value as "buy" | "sell")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>
            <TabsContent value="buy">
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Amount to Buy"
                  value={amount}
                  onChange={e => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                  className="w-full border-green-500 focus-visible:ring-offset-green-500 focus-visible:ring-0"
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickBuy(1)}>
                    1
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickBuy(5)}>
                    5
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickBuy(10)}>
                    10
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickBuy(25)}>
                    25
                  </Button>
                </div>
                <Button
                  className="w-full bg-green-500 hover:bg-green-600"
                  //   onClick={handleBuy}
                >
                  Buy
                </Button>
                <p className="text-sm text-muted-foreground">
                  Enter the amount of 🍜 you want to buy. The current market price will be used for the transaction.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="sell">
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Amount to Sell"
                  value={amount}
                  onChange={e => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                  className="w-full border-red-500 focus-visible:ring-offset-red-500 focus-visible:ring-0"
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickSell(25)}>
                    25%
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickSell(50)}>
                    50%
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickSell(75)}>
                    75%
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickSell(100)}>
                    100%
                  </Button>
                </div>
                <Button
                  className="w-full"
                  variant="destructive"
                  //   onClick={handleSell}
                >
                  Sell
                </Button>
                <p className="text-sm text-muted-foreground">
                  Enter the amount of 🍜 you want to sell. The current market price will be used for the transaction.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Activity and Top Holders Tabs */}
        <div className="p-4 rounded-lg shadow-lg lg:col-span-2 bg-card text-card-foreground">
          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="topHolders">Top Holders</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price (USD)</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={item.user} alt={item.user} />
                          <AvatarFallback>{item.user[0]}</AvatarFallback>
                        </Avatar>
                        <span>@{item.user}</span>
                      </TableCell>
                      <TableCell className={item.type === "buy" ? "text-green-500" : "text-red-500"}>
                        {item.type}
                      </TableCell>
                      <TableCell>${item.price.toLocaleString()}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>{item.timeAgo}</TableCell>
                      <TableCell>
                        <Link />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="topHolders">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Holder</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>% of Holdings</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topHoldersData.map((holder, index) => (
                    <TableRow key={index}>
                      <TableCell className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={holder.avatar} alt={holder.username} />
                          <AvatarFallback>{holder.username[0]}</AvatarFallback>
                        </Avatar>
                        <span>@{holder.username}</span>
                      </TableCell>
                      <TableCell>{holder.balance}</TableCell>
                      <TableCell>{holder.percentage}%</TableCell>
                      <TableCell>
                        <Link />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>

        {/* New Bento Item: Tweet Actions */}
        <div className="p-4 rounded-lg shadow-lg bg-card text-card-foreground min-h-96">
          <h2 className="mb-2 text-lg font-semibold">Promote</h2>
          <Tabs defaultValue="tweet">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tweet">Tweet</TabsTrigger>
              <TabsTrigger value="retweet">Retweet</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            <TabsContent value="tweet">
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your proposal..."
                  value={tweetContent}
                  onChange={e => setTweetContent(e.target.value)}
                />
                <Button className="w-full">Submit</Button>
                <p className="text-sm text-muted-foreground">Required amount 10 🍜</p>
              </div>
            </TabsContent>
            <TabsContent value="retweet">
              <p className="h-full py-8 text-center text-md text-muted-foreground">Coming soon...</p>
            </TabsContent>
            <TabsContent value="info">
              <div className="space-y-4">
                <p className="text-md text-muted-foreground">
                  This feature allows you to propose tweets and retweets. Each action requires you to redeem noodles in
                  exchange for visibility. Proposals are reviewed and executed if approved.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
