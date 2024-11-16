"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { Link, Share2 } from "lucide-react";
import { encodeFunctionData, formatEther } from "viem";
import { create } from "zustand";
import { ChartComponent } from "@/components/Chart";
import { chain } from "@/components/Providers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import deployedContracts from "@/contracts/deployedContracts";
import { getBuyPrice, getSellPrice, getSharesCount, getVisibilityData, getWalletBalance } from "@/lib/web3";

type Store = {
  activity: {
    address: string;
    type: "buy" | "sell";
    price: number;
    amount: number;
    timeAgo: string;
    link: string;
  }[];
  pushActivity: (activity: Store["activity"][0]) => void;
};

const useStore = create<Store>()(set => ({
  activity: [],
  pushActivity: (activity: Store["activity"][0]) => set(state => ({ activity: [...state.activity, activity] })),
}));

export default function Bento({ username }: { username: string }) {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const { wallets } = useWallets();
  const { user } = usePrivy();

  const [loading, setLoading] = useState(false);

  const [maxSellAmount, setMaxSellAmount] = useState(1); // Simulated max amount to sell
  const [tweetContent, setTweetContent] = useState("");
  const [tweetUrl, setTweetUrl] = useState("");

  const { activity, pushActivity } = useStore();

  const visibilityId = `x-${username}`;

  const userBalanceQuery = useQuery({
    queryKey: ["balances", user?.wallet?.address],
    queryFn: async () => {
      // @ts-ignore
      const balance = await getWalletBalance(user?.wallet?.address);
      // @ts-ignore
      const tokens_data = await getSharesCount(`x-${username}`, user?.wallet?.address);

      return { balance, tokens: tokens_data };
    },
    enabled: !!user && !!user.wallet,
  });

  const visibilityQuery = useQuery({
    queryKey: ["visibility", visibilityId],
    queryFn: async () => {
      const data = (await getVisibilityData(visibilityId)) as any;
      const tradeData = data.data.visibility.trades.map((trade: any) => {
        // { time: "2018-12-22", value: 32.51 },
        return {
          time: Number(trade.blockTimestamp),
          value: Number(formatEther(trade.tradeEvent_newCurrentPrice)),
        };
      });
      return { tradeData };
    },
  });

  const handleReset = () => {
    setAmount("");
  };

  const handleBuy = async () => {
    if (!user || !user?.wallet) {
      console.log("No wallet found");
      return;
    }

    if (loading) return;

    setLoading(true);

    const wallet = wallets[0]; // Replace this with your desired wallet
    await wallet.switchChain(chain.id);
    const provider = await wallet.getEthereumProvider();

    const writeData = encodeFunctionData({
      // @ts-ignore
      abi: deployedContracts[chain.id].VisibilityCredits.abi,
      functionName: "buyCredits",
      args: [`x-${username}`, BigInt(amount), "0x0000000000000000000000000000000000000000"],
    });

    const price = await getBuyPrice(`x-${username}`, BigInt(amount));
    const transactionRequest = {
      // @ts-ignore
      to: deployedContracts[chain.id].VisibilityCredits.address,
      data: writeData,
      value: BigInt(price),
    };

    try {
      const transactionHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      console.log("TRANSACTION HASH", transactionHash);

      pushActivity({
        address: user.wallet.address,
        type: "buy",
        price: Number(formatEther(price)),
        amount: Number(amount),
        timeAgo: new Date().toLocaleString(),
        link: `https://sepolia.scrollscan.com/tx/${transactionHash}`,
      });
    } catch (error) {
      console.error("Error sending transaction:", error);
    }

    userBalanceQuery.refetch();
    visibilityQuery.refetch();
    setLoading(false);
  };

  const handleSell = async () => {
    if (!user || !user?.wallet) {
      console.log("No wallet found");
      return;
    }

    if (loading) return;
    setLoading(true);

    const wallet = wallets[0]; // Replace this with your desired wallet
    await wallet.switchChain(chain.id);
    const provider = await wallet.getEthereumProvider();

    const price = await getSellPrice(`x-${username}`, BigInt(amount));
    const writeData = encodeFunctionData({
      // @ts-ignore
      abi: deployedContracts[chain.id].VisibilityCredits.abi,
      functionName: "sellCredits",
      args: [`x-${username}`, BigInt(amount), "0x0000000000000000000000000000000000000000"],
    });

    const transactionRequest = {
      // @ts-ignore
      to: deployedContracts[chain.id].VisibilityCredits.address,
      data: writeData,
    };

    try {
      const transactionHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      console.log("TRANSACTION HASH", transactionHash);

      pushActivity({
        address: user.wallet.address,
        type: "sell",
        price: Number(formatEther(price)),
        amount: Number(amount),
        timeAgo: new Date().toLocaleString(),
        link: `https://sepolia.scrollscan.com/tx/${transactionHash}`,
      });
    } catch (error) {
      console.error("Error sending transaction:", error);
    }

    userBalanceQuery.refetch();
    visibilityQuery.refetch();
    setLoading(false);
  };

  const handleQuickBuy = (value: number) => {
    setAmount(value.toString());
  };

  //   const handleQuickSell = (percentage: number) => {
  //     const sellAmount = ((maxSellAmount * percentage) / 100).toFixed(8);
  //     setAmount(sellAmount);
  //   };

  //   TODO: GET TRADES DATA
  // FORMAT:
  // { time: "2018-12-22", value: 32.51 },

  // TODO: GET ACTIVITY DATA, last 10
  // username, type (buy/sell), price, amount, timeAgo, link

  // TODO: GET TOP HOLDERS DATA
  // username, balance, percentage, link to their profile

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

              <Button variant="outline" size="sm">
                🤙 Flex
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-md aspect-video">
            {/* TODO: TRADES */}
            {visibilityQuery.data?.tradeData?.length > 0 ? (
              <ChartComponent data={visibilityQuery.data?.tradeData} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
            )}
          </div>
        </div>

        {/* Buy/Sell Section */}
        <div className="p-4 rounded-lg shadow-lg bg-card text-card-foreground">
          <div className="flex items-center justify-between">
            <h2 className="mb-2 text-lg font-semibold">Trade</h2>
            <h2 className="mb-2 font-semibold text-md">
              {userBalanceQuery.status === "pending"
                ? "Loading..."
                : userBalanceQuery.status === "error"
                  ? "Error"
                  : mode === "buy"
                    ? `${Number(userBalanceQuery.data?.balance ?? 0).toFixed(5)} ETH`
                    : `${userBalanceQuery.data?.tokens?.toString()} x-${username}`}
            </h2>
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
                <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleBuy} disabled={loading}>
                  {loading && (
                    <svg
                      className="w-5 h-5 mr-3 -ml-1 text-muted animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
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
                  {/* <Button variant="outline" size="sm" onClick={() => handleQuickSell(25)}>
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
                  </Button> */}
                </div>
                <Button className="w-full" variant="destructive" onClick={handleSell} disabled={loading}>
                  {loading && (
                    <svg
                      className="w-5 h-5 mr-3 -ml-1 text-muted animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
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
                    <TableHead>Price (ETH)</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>View tx</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* TODO: ACTIVITY FROM GRAPHQL AND NOT LOCAL */}
                  {activity.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={item.address} alt={item.address} />
                          <AvatarFallback>{item.address[0]}</AvatarFallback>
                        </Avatar>
                        <span>{item.address}</span>
                      </TableCell>
                      <TableCell className={item.type === "buy" ? "text-green-500" : "text-red-500"}>
                        {item.type}
                      </TableCell>
                      <TableCell>${item.price.toLocaleString()}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>{item.timeAgo}</TableCell>
                      <TableCell>
                        <a href={item.link} target="_blank" rel="noreferrer noopener">
                          <Link />
                        </a>
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
                  {/* TODO: ? MAYBE WE SKIP IT */}
                  {/* {[].map((holder, index) => (
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
                  ))} */}
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
                <Button
                  className="w-full"
                  onClick={() => {
                    //   TODO: LOGIC HERE TO SUBMIT TWEET
                  }}
                >
                  Submit
                </Button>
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
