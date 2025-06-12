export const faucet = async (faucetPort: string, address: string, denom: string) => {
  await fetch(`http://localhost:${faucetPort}/credit`, {
    method: 'POST',
    body: JSON.stringify({
      address,
      denom
    }),
    headers: {
      'Content-type': 'application/json'
    }
  });
}

export const getChainInfo = async (chainId: string) => {
  const result = await fetch(`http://localhost:8081/chains/${chainId}`);
  if (!result.ok) {
    throw new Error(`Failed to fetch chain info for ${chainId}`);
  }
  const data = await result.json();
  return data;
}

export const getAssetListInfo = async (chainId: string) => {
  const result = await fetch(`http://localhost:8081/chains/${chainId}/assets`);
  if (!result.ok) {
    throw new Error(`Failed to fetch asset list info for ${chainId}`);
  }
  const data = await result.json();
  return data;
}