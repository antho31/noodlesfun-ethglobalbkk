"use server";

import { PrivyClient } from "@privy-io/server-auth";
import { createPublicClient, createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { chain } from "@/components/Providers";

// import deployedContractsData from "@/contracts/";

const chainId = chain.id;

export async function link(username: string) {
  console.log("LINK", { username, chainId });

  const { LINKER_PRIVATE_KEY, PRIVY_ID, PRIVY_SECRET } = process.env;
  if (!LINKER_PRIVATE_KEY || !PRIVY_ID || !PRIVY_SECRET) {
    return { error: "Missing environment variables" };
  }

  //   const { twitterUsername, chainId } = await request.json();
  if (!username) {
    return { error: "Missing required parameter: twitterUsername" };
  }
  if (!chainId) {
    return { error: "Missing required parameter: chainId" };
  }

  const chain = Object.values(chains).find(chain => chain.id === chainId);
  if (!chain) {
    return { error: "Invalid chainId" };
  }

  const privy = new PrivyClient(PRIVY_ID, PRIVY_SECRET);
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  console.log("PUBLIC CLIENT", { chainId, chain, privy, publicClient });

  const { abi, address: visibilityCreditsAddress } = ({} as any)?.[chainId].VisibilityCredits || {};
  if (!abi || !visibilityCreditsAddress) {
    return { error: "No smart contract data found" };
  }

  const visibilityId = `x-${username}`;

  const [visibilityData, user] = await Promise.all([
    publicClient.readContract({
      address: visibilityCreditsAddress,
      abi,
      functionName: "getVisibility", // Replace with the actual function name in your contract
      args: [visibilityId], // Add arguments if the function requires them
    }) as Promise<string[]>,
    privy.getUserByTwitterUsername(username),
  ]);

  console.log("VISIBILITY DATA", { visibilityData, user });

  if (user && user?.wallet?.address) {
    const privyUserAddr = user.wallet.address;
    const creatorAddr = visibilityData[0];
    const alreadySet = privyUserAddr.toLowerCase() === creatorAddr.toLowerCase();

    if (alreadySet) {
      return { msg: "User address already set", visibilityId, creatorAddr };
    }

    const walletClient = createWalletClient({
      chain,
      transport: http(),
      account: privateKeyToAccount(LINKER_PRIVATE_KEY as `0x-${string}`),
    });

    console.log("WALLET CLIENT", { walletClient });

    const args = [visibilityId, getAddress(privyUserAddr)];

    try {
      const txHash = await walletClient.writeContract({
        address: visibilityCreditsAddress,
        abi,
        functionName: "setCreatorVisibility",
        args,
      });

      return { msg: "User address set", visibilityId, privyUserAddr, txHash };
    } catch (error) {
      return {
        msg: "Error when trying to set user address set",
        address: visibilityCreditsAddress,
        functionName: "setCreatorVisibility",
        args,
        visibilityId,
        privyUserAddr,
        error,
      };
    }
  } else {
    return { error: "User not found" };
  }
}
