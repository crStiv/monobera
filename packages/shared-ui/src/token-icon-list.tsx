import React, { useMemo } from "react";
import { Token } from "@bera/berajs";
import { cn } from "@bera/ui";

import { TokenIcon } from "./token-icon";

interface ITokenIconList {
  key?: string;
  tokenList: (Omit<Token, "name" | "symbol" | "decimals" | "address"> & {
    address: string;
  })[];
  size?: "3xl" | "2xl" | "xl" | "lg" | "md" | "sm" | "xs";
  showCount?: number;
  className?: string;
}

export function TokenIconList({
  key = "",
  tokenList,
  showCount = 3,
  size = "lg",
  className,
}: ITokenIconList) {
  const length = tokenList?.length;
  const newTokenList = useMemo(() => {
    if (showCount && showCount < length) {
      return tokenList.slice(0, showCount);
    }
    return tokenList;
  }, [tokenList, showCount]);

  return (
    <div className={cn("ml-[5px] flex items-center", className)}>
      {newTokenList?.map((token: any) => (
        <TokenIcon
          key={`${token.address}-${token.id ?? key}`}
          address={token.address}
          symbol={token.symbol}
          className="ml-[-5px]"
          size={size}
        />
      ))}
      {showCount && length > showCount && (
        <div className="ml-2 text-muted-foreground">+{length - showCount}</div>
      )}
    </div>
  );
}
