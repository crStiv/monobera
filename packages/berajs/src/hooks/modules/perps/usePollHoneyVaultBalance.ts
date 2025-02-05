import { bhoneyVaultContractAddress } from "@bera/config";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";

import { bTokenAbi } from "~/abi";
import POLLING from "~/enum/polling";

export const usePollHoneyVaultBalance = () => {
  const publicClient = usePublicClient();
  const method = "availableAssets";
  const QUERY_KEY = ["bhoney", method];
  const { isLoading } = useSWR(
    QUERY_KEY,
    async () => {
      if (!publicClient) return undefined;
      try {
        const result = await publicClient.readContract({
          address: bhoneyVaultContractAddress,
          abi: bTokenAbi,
          functionName: method,
          args: [],
        });
        return result;
      } catch (e) {
        console.error(e);
        return undefined;
      }
    },
    {
      refreshInterval: POLLING.FAST,
    },
  );

  const useHoneyVaultBalance = () => {
    const { data = 0 } = useSWRImmutable(QUERY_KEY);
    return data;
  };

  const useFormattedHoneyVaultBalance = () => {
    const { data = undefined } = useSWRImmutable(QUERY_KEY);
    if (!data) return 0;
    return Number(formatUnits(data, 18));
  };
  return {
    useFormattedHoneyVaultBalance,
    useHoneyVaultBalance,
    isLoading,
  };
};
