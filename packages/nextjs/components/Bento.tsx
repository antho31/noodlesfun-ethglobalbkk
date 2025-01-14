"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { Link, Share2 } from "lucide-react";
import { encodeFunctionData, formatEther } from "viem";
import { create } from "zustand";
import { link } from "@/app/actions";
import { ChartComponent } from "@/components/Chart";
import { chain, queryClient } from "@/components/Providers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import deployedContracts from "@/contracts/deployedContracts";
import {
  getBuyPrice,
  getSellPrice,
  getSharesCount,
  getVisibility,
  getVisibilityData,
  getWalletBalance,
} from "@/lib/web3";

export default function Bento({ username }: { username: string }) {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const { wallets } = useWallets();
  const { user } = usePrivy();

  const [loading, setLoading] = useState(false);

  const [maxSellAmount, setMaxSellAmount] = useState(1); // Simulated max amount to sell
  const [tweetContent, setTweetContent] = useState("");
  const [tweetUrl, setTweetUrl] = useState("");

  const visibilityId = `x-${username}`;

  useEffect(() => {
    if (!user) return;

    if (user.twitter?.username !== username) return;

    getVisibility(`x-${username}`).then(async visibility => {
      const creator = visibility[0];

      if (creator === user.wallet?.address) return;

      try {
        const result = await link(username);
        console.log("result", result);
      } catch (error) {
        console.error("Error linking", error);
      }
    });
  }, [user]);

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
          value: Number(formatEther(trade.tradeEvent_newCurrentPrice)) * 3100,
        };
      });
      const activityData = data.data.visibility.trades
        .map((trade: any) => {
          return {
            address: trade.tradeEvent_from,
            type: trade.tradeEvent_isBuy ? "buy" : "sell",
            price: Number(formatEther(trade.tradeEvent_tradeCost)),
            amount: Number(trade.tradeEvent_amount),
            timeAgo: new Date(Number(trade.blockTimestamp) * 1000).toLocaleString(),
            link: `https://sepolia.scrollscan.com/tx/${trade.transactionHash}`,
          };
        })
        .reverse();
      const services = data.data.visibility.services.map((service: any) => service);
      const service = services[0];
      if (service && user?.wallet?.address) {
        service.balance = data.data.visibility.balances.find(
          (balance: any) => balance.user.toLowerCase() === (user?.wallet?.address as string).toLowerCase(),
        )?.balance;
      }
      return { visibility: data.data.visibility, tradeData, activityData, services, service };
    },
    refetchInterval: 1000,
  });

  useEffect(() => {
    const wallet = wallets[0]; // Replace this with your desired wallet

    async function createService() {
      if (visibilityQuery.data?.services?.length === 0 && user?.wallet?.address && wallets && wallets[0]) {
        await wallet.switchChain(chain.id);
        const provider = await wallet.getEthereumProvider();
        const balance = await getWalletBalance(user.wallet.address as string);
        if (Number(balance) > 0) {
          console.log("create service...");

          const writeData = encodeFunctionData({
            // @ts-ignore
            abi: deployedContracts[534351].VisibilityServices.abi,
            functionName: "createService",
            args: [`x-post`, `x-${username}`, BigInt("10")],
          });
          const transactionRequest = {
            // @ts-ignore
            to: deployedContracts[534351].VisibilityServices.address,
            data: writeData,
          };

          console.log("ready to create service", transactionRequest);

          try {
            console.log("sending transaction...", transactionRequest);
            const transactionHash = await provider.request({
              method: "eth_sendTransaction",
              params: [transactionRequest],
            });

            console.log("TRANSACTION HASH", transactionHash);

            const receipt = await provider.request({
              method: "eth_getTransactionReceipt",
              params: [transactionHash],
            });

            console.log("RECEIPT", receipt);

            //  visibilityQuery.refetch();
          } catch (error) {
            console.error("Error sending transaction:", error);
          }
        }
      }
    }

    if (
      visibilityQuery.data?.visibility?.creator &&
      user?.wallet?.address &&
      visibilityQuery.data.visibility.creator.toLowerCase() === user?.wallet?.address.toLowerCase()
    )
      createService();
  }, [visibilityQuery?.data, user?.wallet?.address, wallets]);

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
      abi: deployedContracts[534351].VisibilityCredits.abi,
      functionName: "buyCredits",
      args: [`x-${username}`, BigInt(amount), "0x0000000000000000000000000000000000000000"],
    });

    const price = await getBuyPrice(`x-${username}`, BigInt(amount));
    const transactionRequest = {
      // @ts-ignore
      to: deployedContracts[534351].VisibilityCredits.address,
      data: writeData,
      value: BigInt(price),
    };

    try {
      const transactionHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      console.log("TRANSACTION HASH", transactionHash);

      visibilityQuery.refetch();
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
      abi: deployedContracts[534351].VisibilityCredits.abi,
      functionName: "sellCredits",
      args: [`x-${username}`, BigInt(amount), "0x0000000000000000000000000000000000000000"],
    });

    const transactionRequest = {
      // @ts-ignore
      to: deployedContracts[534351].VisibilityCredits.address,
      data: writeData,
    };

    try {
      const transactionHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      console.log("TRANSACTION HASH", transactionHash);

      visibilityQuery.refetch();
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
                ? ""
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
                    <TableHead>Amount</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>View tx</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* @ts-ignore */}
                  {visibilityQuery?.data?.activityData?.map((item, index) => (
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
                      <TableCell>{item.price.toLocaleString()} ETH</TableCell>
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
        {visibilityQuery?.data?.services?.length > 0 ? (
          <div className="p-4 rounded-lg shadow-lg bg-card text-card-foreground min-h-96">
            <h2 className="mb-2 text-lg font-semibold">Promote</h2>
            <Tabs defaultValue="tweet">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tweet">Tweet</TabsTrigger>
              </TabsList>
              <TabsContent value="tweet">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe your proposal..."
                    value={tweetContent}
                    onChange={e => setTweetContent(e.target.value)}
                  />
                  <Button
                    disabled={!(Number(visibilityQuery.data?.service?.balance) >= 10 && tweetContent?.length > 0)}
                    className="w-full"
                    onClick={async () => {
                      setLoading(true);

                      const wallet = wallets[0]; // Replace this with your desired wallet
                      await wallet.switchChain(chain.id);
                      const provider = await wallet.getEthereumProvider();

                      const writeData = encodeFunctionData({
                        // @ts-ignore
                        abi: deployedContracts[534351].VisibilityServices.abi,
                        functionName: "requestServiceExecution",
                        args: [visibilityQuery.data?.service?.id, tweetContent],
                      });

                      const transactionRequest = {
                        // @ts-ignore
                        to: deployedContracts[534351].VisibilityServices.address,
                        data: writeData,
                      };

                      try {
                        const transactionHash = await provider.request({
                          method: "eth_sendTransaction",
                          params: [transactionRequest],
                        });

                        console.log("TRANSACTION HASH REQ SERVICE", transactionHash);
                      } catch (error) {
                        console.error("Error sending transaction:", error);
                      }

                      userBalanceQuery.refetch();
                      visibilityQuery.refetch();
                      setLoading(false);
                    }}
                  >
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
                    {`${Number(visibilityQuery.data?.service?.balance) >= 10 ? "Submit" : "Insufficient balance"}`}
                  </Button>
                  <p className="text-sm text-muted-foreground">Required amount: 10 🍜</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="p-4 rounded-lg shadow-lg bg-card text-card-foreground min-h-96">
            <h2 className="mb-2 text-lg font-semibold">Promote</h2>
            <div className="space-y-4">
              <p className="text-md text-muted-foreground">
                This creator has not enabled the promotion feature yet. Check back later or reach out to them directly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
