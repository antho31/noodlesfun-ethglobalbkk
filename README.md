# Noodles.Fun - Feed Your KOLs! 🍜

**Noodles.Fun** tokenizes Twitter (X) accounts into unique bonding curve tokens. Instantly trade and speculate on content creators’ tokens and use them for promotion services like shoutout posts on X. A fun and interactive way to support, engage, and invest in KOLs!

### Built With

- **Privy:** Ties Twitter accounts to Ethereum wallets seamlessly.  
- **Subgraph:** Fully decentralized data for promotion services and trading history.  
  **Query URL:** [Subgraph Explorer](https://graph-secured.neontest.xyz/subgraphs/name/noodlesfun-neonevmdevnet/graphql?query=%7B%0A++_meta+%7B%0A++++block+%7B%0A++++++number%0A++++%7D%0A++++hasIndexingErrors%0A++%7D%0A++visibilities+%7B+%0A++++id+%23+eg.+twitter+handle%0A++++creator%0A++++services+%7B%0A++++++id%0A++++++serviceType+%23+eg.+x-post%0A++++++creditsCostAmount+%23+tokens+to+spend+for+this+service%0A++++++enabled%0A++++++executions+%7B%0A++++++++executionNonce%0A++++++++requester+%23+user+addr%0A++++++++state+%23+REQUESTED%2C+ACCEPTED%2C+DISPUTED%2C+REFUNDED%2C+VALIDATED%0A++++++++requestData%0A++++++++responseData%0A++++++++cancelData%0A++++++++disputeData%0A++++++++resolveData%0A++++++++lastUpdated%0A++++++%7D%0A++++%7D%0A++++balances+%7B%0A++++++user+%23+user+addr%0A++++++balance+%23+user+balance+for+this+visibility%0A++++%7D%0A++%7D%0A%7D)
- **Neon EVM L2:** Scalable Ethereum dApps on Solana's fast, low-cost infrastructure.
- **Blockscout:** User-friendly blockchain explorer to verify and interact with deployed contracts.  

---

### How It Works

1. **Every Twitter Account is tokenized:** Automatically generate a unique bonding curve token.  
2. **Trade Tokens instantly:** Buy or sell tokens instantly through the bonding curve—no need for liquidity pools or listings.
3. **Spend Tokens for Promotions:** The X account owner can accept their tokens as payment for services like post promotions, pinned tweets, or other custom engagements.

---

### Core Contracts

- **VisibilityCredits:** Powers creator tokens using the bonding curve formula:  
  `Price = A × Supply² + B × Supply + BasePrice`

*As token supply increases, the price grows exponentially, rewarding early supporters.*

**Check VisibilityCredits Contract on Blockscout:**  
  [0xF39Cc5a1f1adA029de8C7F18D4687B438dEa45a2](https://neon-devnet.blockscout.com/address/0xF39Cc5a1f1adA029de8C7F18D4687B438dEa45a2#code)

- **VisibilityServices:** Allows creators to accept tokens for off-chain promotion services.

**Check VisibilityServices Contract on BlockScout:**  
  [0x00f463f093C66F2F0320237ca8766C536cf02972](https://neon-devnet.blockscout.com/address/0x00f463f093C66F2F0320237ca8766C536cf02972#code)  

---

### Meet the Team

- **Maxime Gay** - Product Manager  
- **Raphaël Pautard** - UI/UX Designer  
- **Mickael Bobovitch** - Frontend Developer  
- **Anthony Gourraud** - Smart Contract & Backend Developer  

---

### Try It Now

Visit [noodles.fun](https://noodles.fun) to start trading and supporting your favorite Twitter creators today!

---

Built with love and innovation for EthGlobal Bangkok 🌏✨
