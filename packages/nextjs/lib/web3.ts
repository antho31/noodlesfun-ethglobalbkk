import { createPublicClient, formatEther, http } from "viem";
import { chain } from "@/components/Providers";
import deployedContracts from "@/contracts/deployedContracts";

const publicClient = createPublicClient({
  chain: chain,
  transport: http(),
});

async function getWalletBalance(walletAddress: string) {
  const balance = await publicClient.getBalance({ address: walletAddress });

  return formatEther(balance);
}

async function getBuyPrice(
  token: string,
  amount: bigint,
  referer: string = "0x0000000000000000000000000000000000000000",
) {
  const data = publicClient.readContract({
    address: deployedContracts[chain.id].VisibilityCredits.address,
    abi: deployedContracts[chain.id].VisibilityCredits.abi,
    // @ts-ignore
    method: "buyCostWithFees",
    args: [token, amount, referer],
  });
}

export { getWalletBalance };
