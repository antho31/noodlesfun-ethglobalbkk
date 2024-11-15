"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineChain } from "viem";
import { neonDevnet } from "viem/chains";

export const chain = defineChain({
  ...neonDevnet,
  blockExplorers: {
    default: {
      name: "Neonscan",
      url: "https://neon-devnet.blockscout.com",
    },
  },
});

export const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId="cm3j2xanc00ohxc232di6d8z5"
        clientId="client-WY5dbxLMLGuLZdwajQQyHt9VZxTdCyxm1Z2vothRH2DJv"
        config={{
          loginMethods: ["twitter"],
          defaultChain: chain,
          supportedChains: [chain],
        }}
      >
        {children}
      </PrivyProvider>
    </QueryClientProvider>
  );
}
