import { Hash, createPublicClient, formatEther, getAddress, http } from "viem";
import { chain } from "@/components/Providers";
import deployedContracts from "@/contracts/deployedContracts";

const graphUrl = "https://api.studio.thegraph.com/query/95019/noodlesfun-scrollsepolia/0.0.5";

const publicClient = createPublicClient({
  chain: chain,
  transport: http(),
});

export async function fetchSubgraph(query: string, variables: any) {
  const response = await fetch(graphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = await response.json();
  return data;
}

export function getVisibilityData(visibilityId: string) {
  return fetchSubgraph(
    `
  query getVisibilityData($visibilityId: ID!) {
    visibility(id: $visibilityId) { 
      id # eg. twitter handle
      creator
      trades(orderBy: blockTimestamp orderDirection: asc) {
        tradeEvent_from
        tradeEvent_amount
        tradeEvent_isBuy
        tradeEvent_tradeCost
        tradeEvent_creatorFee
        tradeEvent_protocolFee
        tradeEvent_referrerFee
        tradeEvent_referrer
        tradeEvent_newTotalSupply
        tradeEvent_newCurrentPrice
        blockTimestamp
        transactionHash
      }
      services {
        id
        serviceType # eg. x-post
        creditsCostAmount # tokens to spend for this service
        enabled
        executions {
          executionNonce
          requester # user addr
          state # REQUESTED, ACCEPTED, DISPUTED, REFUNDED, VALIDATED
          requestData
          responseData
          cancelData
          disputeData
          resolveData
          lastUpdated
        }
      }
      balances(orderBy: balance orderDirection: desc) {
        user # user addr
        balance # user balance for this visibility
      }
    }
  }`,
    { visibilityId },
  );
}

export async function getWalletBalance(walletAddress: string) {
  const balance = await publicClient.getBalance({ address: walletAddress });

  return formatEther(balance);
}

export async function getSharesCount(visibilityId: string, account: string) {
  const data = await publicClient.readContract({
    // @ts-ignore
    address: deployedContracts[534351].VisibilityCredits.address,
    // @ts-ignore
    abi: deployedContracts[534351].VisibilityCredits.abi,
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
    address: deployedContracts[534351].VisibilityCredits.address,
    // @ts-ignore
    abi: deployedContracts[534351].VisibilityCredits.abi,
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
    address: deployedContracts[534351].VisibilityCredits.address,
    // @ts-ignore
    abi: deployedContracts[534351].VisibilityCredits.abi,
    functionName: "sellCostWithFees",
    args: [token, amount, referer],
  });

  return data[0];
}

export async function getVisibility(token: string) {
  const data = await publicClient.readContract({
    // @ts-ignore
    address: deployedContracts[534351].VisibilityCredits.address,
    // @ts-ignore
    abi: deployedContracts[534351].VisibilityCredits.abi,
    functionName: "getVisibility",
    args: [token],
  });

  return data; // creator, supply, claimable fee, balance
}

export async function getCurrentPrice(token: string) {
  const data = await publicClient.readContract({
    // @ts-ignore
    address: deployedContracts[534351].VisibilityCredits.address,
    // @ts-ignore
    abi: deployedContracts[534351].VisibilityCredits.abi,
    functionName: "getVisibilityCurrentPrice",
    args: [token],
  });

  return data; // wei
}

export async function getCreator(address: string) {
  const data = await publicClient.readContract({
    address: deployedContracts[534351].VisibilityCredits.address,
    abi: deployedContracts[534351].VisibilityCredits.abi,
    functionName: "creators",
    args: [address],
  });

  return data;
}
