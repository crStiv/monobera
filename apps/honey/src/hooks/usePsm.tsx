"use client";

import { useEffect, useState } from "react";
import {
  TransactionActionType,
  useBeraJs,
  useCollateralsRates,
  usePollAllowance,
  usePollBalance,
  usePollHoneyPreview,
  useTokens,
  useIsBadCollateralAsset,
  useIsBasketModeEnabled,
  type Token,
} from "@bera/berajs";
import { honeyFactoryAddress, honeyTokenAddress } from "@bera/config";
import { useAnalytics, useTxn } from "@bera/shared-ui";
import BigNumber from "bignumber.js";
import { getAddress, parseUnits, type Address } from "viem";

export const usePsm = () => {
  const [isTyping, setIsTyping] = useState(false);

  const { data: tokenData } = useTokens();
  const collateralList = tokenData?.tokenList?.filter((token: any) =>
    token.tags?.includes("collateral"),
  );
  const defaultCollateral = collateralList?.find((token: any) =>
    token.tags.includes("defaultCollateral"),
  );
  const honey = tokenData?.tokenDictionary
    ? tokenData?.tokenDictionary[getAddress(honeyTokenAddress)]
    : undefined;

  const [selectedTo, setSelectedTo] = useState<Token | undefined>(undefined);

  const [selectedFrom, setSelectedFrom] = useState<Token | undefined>(
    undefined,
  );

  const [givenIn, setGivenIn] = useState<boolean>(true);

  useEffect(() => {
    if (defaultCollateral && honey && !selectedFrom && !selectedTo) {
      setSelectedFrom(defaultCollateral);
      setSelectedTo(honey);
    }
  }, [collateralList, honey]);

  const [fromAmount, setFromAmount] = useState<string[]>([]);

  const [toAmount, setToAmount] = useState<string[]>([]);

  const isMint = selectedFrom?.address !== honey?.address;

  const collateral = isMint ? selectedFrom : selectedTo;

  const { data: isBadCollateral } = useIsBadCollateralAsset({
    collateral: collateral?.address as Address,
  });

  const { data: isBasketModeEnabled } = useIsBasketModeEnabled({ isMint });

  const { useBalance: useFromBalance } = usePollBalance({
    address: selectedFrom?.address,
  });

  const fromBalance = useFromBalance();

  const { useBalance: useToBalance } = usePollBalance({
    address: selectedTo?.address,
  });

  const toBalance = useToBalance();

  const { isReady, account } = useBeraJs();

  const { data: allowance } = usePollAllowance({
    spender: honeyFactoryAddress,
    token: selectedFrom,
  });

  const { getCollateralRate, isLoading: isFeeLoading } = useCollateralsRates({
    collateralList: collateralList?.map((token: any) => token.address) ?? [],
  });

  const params = collateral
    ? getCollateralRate(collateral.address as Address)
    : undefined;

  const fee = params ? (isMint ? params.mintFee : params.redeemFee) : 0;

  const { captureException, track } = useAnalytics();

  const {
    write,
    isLoading: isUseTxnLoading,
    ModalPortal,
  } = useTxn({
    message: isMint
      ? `Mint ${
          Number(toAmount) < 0.01 ? "<0.01" : Number(toAmount).toFixed(2)
        } Honey`
      : `Redeem ${
          Number(fromAmount) < 0.01 ? "<0.01" : Number(fromAmount).toFixed(2)
        } Honey`,
    actionType: isMint
      ? TransactionActionType.MINT_HONEY
      : TransactionActionType.REDEEM_HONEY,
    onSuccess: () => {
      track(`${isMint ? "mint" : "redeem"}_honey`);
    },
    onError: (e: Error | undefined) => {
      track(`${isMint ? "mint" : "redeem"}_honey_failed`);
      captureException(e);
    },
  });

  const { data: previewRes, isLoading: isHoneyPreviewLoading } =
    usePollHoneyPreview({
      collateral: isTyping ? undefined : collateral,
      collateralList: isBasketModeEnabled ? collateralList : undefined,
      amount: (givenIn ? fromAmount[0] : toAmount[0]) ?? "0",
      mint: isMint,
      given_in: givenIn,
    });

  useEffect(() => {
    if (givenIn) setToAmount(previewRes ?? []);
    else setFromAmount(previewRes ?? []);
  }, [previewRes]);

  const onSwitch = () => {
    const tempFromAmount = fromAmount;
    const tempToAmount = toAmount;

    const tempFrom = selectedFrom;
    const tempTo = selectedTo;

    setSelectedFrom(tempTo);
    setSelectedTo(tempFrom);

    setFromAmount(tempToAmount);
    setToAmount(tempFromAmount);
    setGivenIn(!givenIn);
  };

  const payload =
    collateral && account
      ? ([
          collateral?.address,
          parseUnits(
            fromAmount?.[0] ?? "0",
            (isMint ? collateral?.decimals : honey?.decimals) ?? 18,
          ),
          account ?? "",
          false,
        ] as const)
      : undefined;

  const needsApproval = BigNumber(fromAmount?.[0] ?? "0").gt(
    allowance?.formattedAllowance ?? "0",
  );
  const exceedBalance = BigNumber(fromAmount?.[0] ?? "0").gt(
    fromBalance?.formattedBalance ?? "0",
  );

  const isLoading = isUseTxnLoading || isHoneyPreviewLoading;
  return {
    account,
    payload,
    allowance,
    setSelectedFrom,
    isLoading,
    write,
    selectedFrom,
    selectedTo,
    fee,
    isReady,
    isFeeLoading,
    setSelectedTo,
    fromAmount,
    setFromAmount,
    toAmount,
    setToAmount,
    isMint,
    fromBalance,
    toBalance,
    onSwitch,
    ModalPortal,
    setGivenIn,
    needsApproval,
    exceedBalance,
    honey,
    collateralList,
    setIsTyping,
    isTyping,
    isBadCollateral,
    isBasketModeEnabled,
  };
};
