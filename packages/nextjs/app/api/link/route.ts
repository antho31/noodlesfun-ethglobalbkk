import { PrivyClient } from "@privy-io/server-auth";
import { createPublicClient, createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";

// import deployedContractsData from "@/contracts/";

export async function POST(request: Request) {
  const { LINKER_PRIVATE_KEY, PRIVY_ID, PRIVY_SECRET, RPC_URL } = process.env;
  if (!LINKER_PRIVATE_KEY || !PRIVY_ID || !PRIVY_SECRET || !RPC_URL) {
    return Response.json({ error: "Missing environment variables" }, { status: 500 });
  }

  const { twitterUsername, chainId } = await request.json();
  if (!twitterUsername) {
    return Response.json({ error: "Missing required parameter: twitterUsername" }, { status: 400 });
  }
  if (!chainId) {
    return Response.json({ error: "Missing required parameter: chainId" }, { status: 400 });
  }

  const chain = Object.values(chains).find(chain => chain.id === chainId);
  if (!chain) {
    return Response.json({ error: "Invalid chainId" }, { status: 400 });
  }

  const privy = new PrivyClient(PRIVY_ID, PRIVY_SECRET);
  const publicClient = createPublicClient({
    chain,
    transport: http(process.env.RPC_URL || chain.rpcUrls.default.http[0]),
  });
  const { abi, address: visibilityCreditsAddress } = ({} as any)?.[chainId].VisibilityCredits || {};
  if (!abi || !visibilityCreditsAddress) {
    return Response.json({ error: "No smart contract data found" }, { status: 400 });
  }

  const visibilityId = `x-${twitterUsername}`;

  const [visibilityData, user] = await Promise.all([
    publicClient.readContract({
      address: visibilityCreditsAddress,
      abi,
      functionName: "getVisibility", // Replace with the actual function name in your contract
      args: [visibilityId], // Add arguments if the function requires them
    }) as Promise<string[]>,
    privy.getUserByTwitterUsername(twitterUsername),
  ]);

  if (user && user?.wallet?.address) {
    const privyUserAddr = user.wallet.address;
    const creatorAddr = visibilityData[0];
    const alreadySet = privyUserAddr.toLowerCase() === creatorAddr.toLowerCase();

    if (alreadySet) {
      return Response.json({ msg: "User address already set", visibilityId, creatorAddr }, { status: 200 });
    }

    const walletClient = createWalletClient({
      chain,
      transport: http(process.env.RPC_URL || chain.rpcUrls.default.http[0]),
      account: privateKeyToAccount(LINKER_PRIVATE_KEY as `0x-${string}`),
    });

    const args = [visibilityId, getAddress(privyUserAddr)];

    try {
      const txHash = await walletClient.writeContract({
        address: visibilityCreditsAddress,
        abi,
        functionName: "setCreatorVisibility",
        args,
      });

      return Response.json({ msg: "User address set", visibilityId, privyUserAddr, txHash }, { status: 201 });
    } catch (error) {
      return Response.json(
        {
          msg: "Error when trying to set user address set",
          address: visibilityCreditsAddress,
          functionName: "setCreatorVisibility",
          args,
          visibilityId,
          privyUserAddr,
          error,
        },
        { status: 500 },
      );
    }
  } else {
    return Response.json({ error: "User not found" }, { status: 404 });
  }
}
