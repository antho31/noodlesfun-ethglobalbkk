"use server";

import { PrivyClient } from "@privy-io/server-auth";
import { createPublicClient, createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { scrollSepolia } from "viem/chains";
import deployedContracts from "@/contracts/deployedContracts";

// import deployedContractsData from "@/contracts/";

export async function link(username: string) {
  const chainId = scrollSepolia.id;
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

  const privy = new PrivyClient(PRIVY_ID, PRIVY_SECRET);
  const publicClient = createPublicClient({
    chain: scrollSepolia,
    transport: http(),
  });

  console.log("PUBLIC CLIENT");

  const { abi, address: visibilityCreditsAddress } = deployedContracts[chainId].VisibilityCredits || {};
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
    }) as unknown as Promise<string[]>,
    privy.getUserByTwitterUsername(username),
  ]);

  console.log("VISIBILITY DATA", { visibilityData, user, username });

  if (user && user?.wallet?.address) {
    const privyUserAddr = user.wallet.address;
    const creatorAddr = visibilityData[0];
    const alreadySet = privyUserAddr.toLowerCase() === creatorAddr.toLowerCase();

    if (alreadySet) {
      return { msg: "User address already set", visibilityId, creatorAddr };
    }

    const walletClient = createWalletClient({
      chain: scrollSepolia,
      transport: http(),
      account: privateKeyToAccount(LINKER_PRIVATE_KEY as `0x-${string}`),
    });

    console.log("WALLET CLIENT");

    try {
      const txHash = await walletClient.writeContract({
        address: visibilityCreditsAddress,
        abi,
        functionName: "setCreatorVisibility",
        args: [visibilityId, getAddress(privyUserAddr)],
      });

      return { msg: "User address set", visibilityId, privyUserAddr, txHash };
    } catch (error) {
      return {
        msg: "Error when trying to set user address set",
        address: visibilityCreditsAddress,
        functionName: "setCreatorVisibility",
        visibilityId,
        privyUserAddr,
        error,
      };
    }
  } else {
    return { error: "User not found" };
  }
}
