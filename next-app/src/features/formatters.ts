export const formatBigInt = (data: string) => {
  const amount = Number(data);
  if (amount >= 1_000_000_000_000)
    return `${Math.floor((amount / 1_000_000_000_000) * 100) / 100}T`;
  if (amount >= 1_000_000_000)
    return `${Math.floor((amount / 1_000_000_000) * 100) / 100}B`;
  if (amount >= 1_000_000)
    return `${Math.floor((amount / 1_000_000) * 100) / 100}M`;
  if (amount >= 1_000) return `${Math.floor((amount / 1_000) * 100) / 100}K`;
  return (Math.floor(amount * 100) / 100).toString();
};

export const formatFixed = (result: number) => {
  const resultString = result.toString();
  return resultString.includes(".")
    ? `${resultString.split(".")[0]}.${resultString.split(".")[1].slice(0, 6)}`
    : resultString;
};

export const WEI6 = 1_000_000;
export const USDT_DECIMAL = 1_000_000;
