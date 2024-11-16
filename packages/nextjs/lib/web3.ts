import { Hash, createPublicClient, formatEther, getAddress, http } from "viem";
import { chain } from "@/components/Providers";
import deployedContracts from "@/contracts/deployedContracts";

const publicClient = createPublicClient({
  chain: chain,
  transport: http(),
});

export async function getWalletBalance(walletAddress: string) {
  const balance = await publicClient.getBalance({ address: walletAddress });

  return formatEther(balance);
}

export async function getSharesCount(visibilityId: string, account: string) {
  const data = await publicClient.readContract({
    // @ts-ignore
    address: deployedContracts[chain.id].VisibilityCredits.address,
    // @ts-ignore
    abi: deployedContracts[chain.id].VisibilityCredits.abi,
    functionName: "getVisibilityCreditBalance",
    args: [visibilityId, account as Hash],
  });

  return data;
}

export async function getBuyPrice(
  token: string,
  amount: bigint,
  referer: string = "0x0000000000000000000000000000000000000000",
) {
  const data = await publicClient.readContract({
    // @ts-ignore
    address: deployedContracts[chain.id].VisibilityCredits.address,
    // @ts-ignore
    abi: deployedContracts[chain.id].VisibilityCredits.abi,
    functionName: "buyCostWithFees",
    args: [token, amount, referer],
  });

  return data[0];
}

export async function getSellPrice(
  token: string,
  amount: bigint,
  referer: string = "0x0000000000000000000000000000000000000000",
) {
  const data = await publicClient.readContract({
    // @ts-ignore
    address: deployedContracts[chain.id].VisibilityCredits.address,
    // @ts-ignore
    abi: deployedContracts[chain.id].VisibilityCredits.abi,
    functionName: "sellCostWithFees",
    args: [token, amount, referer],
  });

  return data[0];
}
