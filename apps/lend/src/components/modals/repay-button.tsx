import { useEffect, useState } from "react";
import { calculateHealthFactorFromBalancesBigUnits } from "@aave/math-utils";
import {
  BalanceToken,
  TransactionActionType,
  lendPoolImplementationAbi,
  useBeraJs,
  usePollAllowance,
  usePollReservesDataList,
  usePollUserAccountData,
  usePollWalletBalances,
} from "@bera/berajs";
import { getLendRepayPayload } from "@bera/berajs/actions";
import {
  honeyTokenAddress,
  lendPoolImplementationAddress,
  vdHoneyTokenAddress,
} from "@bera/config";
import {
  ApproveButton,
  FormattedNumber,
  TokenInput,
  useAnalytics,
  useTxn,
} from "@bera/shared-ui";
import { cn } from "@bera/ui";
import { Alert, AlertTitle } from "@bera/ui/alert";
import { Button } from "@bera/ui/button";
import { Dialog, DialogContent } from "@bera/ui/dialog";
import { Icons } from "@bera/ui/icons";
import BigNumber from "bignumber.js";
import { formatEther, formatUnits } from "viem";

import { getLTVColor } from "~/utils/get-ltv-color";

export default function RepayBtn({
  reserve,
  disabled = false,
  variant = "outline",
  className = "",
}: {
  reserve: any;
  disabled?: boolean;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const { captureException, track } = useAnalytics();
  const { write, isLoading, ModalPortal, isSuccess } = useTxn({
    message: `Repaying ${
      Number(amount) < 0.01 ? "<0.01" : Number(amount).toFixed(2)
    } ${reserve?.symbol}`,
    onSuccess: () => {
      track(`repay_${reserve?.symbol.toLowerCase()}`);
      walletBalanceRefetch();
      userAccountRefetch();
      reservesDataRefetch();
    },
    onError: (e: Error | undefined) => {
      track(`repay_${reserve?.symbol.toLowerCase()}_failed`);
      captureException(e);
    },
    actionType: TransactionActionType.REPAY,
  });

  const { useSelectedWalletBalance } = usePollWalletBalances();
  const honey = useSelectedWalletBalance(honeyTokenAddress);
  const vdHoney = useSelectedWalletBalance(vdHoneyTokenAddress);

  const { refresh: userAccountRefetch } = usePollUserAccountData();
  const { refresh: reservesDataRefetch } = usePollReservesDataList();
  const { refresh: walletBalanceRefetch } = usePollWalletBalances();

  useEffect(() => setOpen(false), [isSuccess]);
  useEffect(() => setAmount(undefined), [open]);
  return (
    <>
      {ModalPortal}
      <Button
        onClick={() => setOpen(true)}
        className={cn("w-full xl:w-fit", className)}
        disabled={
          disabled || isLoading || !vdHoney || vdHoney?.balance === 0n || !honey
        }
        variant={variant}
      >
        {isLoading ? "Loading" : "Repay"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full p-8 md:w-[480px]">
          <RepayModalContent
            {...{
              reserve,
              vdHoney: vdHoney!,
              honey: honey!,
              amount,
              setAmount,
              write,
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

const RepayModalContent = ({
  reserve,
  vdHoney,
  honey,
  amount,
  setAmount,
  write,
}: {
  reserve: any;
  vdHoney: BalanceToken;
  honey: BalanceToken;
  amount: string | undefined;
  setAmount: (amount: string | undefined) => void;
  write: (arg0: any) => void;
}) => {
  const { data: allowance } = usePollAllowance({
    spender: lendPoolImplementationAddress,
    token: honey,
  });

  const tokenBalance = honey.formattedBalance ?? "0";
  const debtBalance = vdHoney.formattedBalance ?? "0";

  const { account = "0x" } = useBeraJs();
  const { data: userAccountData } = usePollUserAccountData();

  const balance = BigNumber(debtBalance).gt(BigNumber(tokenBalance))
    ? tokenBalance
    : debtBalance;

  const currentHealthFactor = formatEther(userAccountData?.healthFactor ?? 0n);
  const newHealthFactor = userAccountData
    ? calculateHealthFactorFromBalancesBigUnits({
        collateralBalanceMarketReferenceCurrency: formatUnits(
          userAccountData.totalCollateralBase,
          8,
        ),
        borrowBalanceMarketReferenceCurrency:
          Number(formatUnits(userAccountData.totalDebtBase, 8)) -
          Number(amount ?? "0") *
            Number(reserve?.formattedPriceInMarketReferenceCurrency),
        currentLiquidationThreshold: formatUnits(
          userAccountData.currentLiquidationThreshold,
          4,
        ),
      })
    : BigNumber(0);

  const payload =
    honey &&
    getLendRepayPayload({
      token: honey,
      amount: amount ?? "0",
      max: BigNumber(amount ?? "0").eq(BigNumber(debtBalance ?? "0")),
      account,
    }).payload;

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="text-lg font-semibold leading-7">Repay</div>
      <div className="rounded-md border border-border bg-input">
        <TokenInput
          selected={honey}
          amount={amount}
          balance={balance}
          showExceeding={true}
          selectable={false}
          setAmount={(amount) =>
            setAmount(amount === "" ? undefined : (amount as `${number}`))
          }
          price={Number(reserve.formattedPriceInMarketReferenceCurrency)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between  text-sm leading-tight">
          <div className="text-muted-foreground ">Remaining Debt</div>
          <FormattedNumber
            value={BigNumber(debtBalance ?? "0").minus(
              BigNumber(amount ?? "0"),
            )}
            symbol="HONEY"
            className="w-[200px] justify-end truncate text-right font-semibold"
          />
        </div>

        <div className="flex justify-between  text-sm leading-tight">
          <div className="text-muted-foreground ">Estimated Value</div>
          <FormattedNumber
            value={
              Number(amount ?? "0") *
              Number(reserve.formattedPriceInMarketReferenceCurrency)
            }
            symbol="USD"
            className="w-[200px] justify-end truncate text-right font-semibold"
          />
        </div>

        <div className="flex justify-between text-sm leading-tight">
          <div className="text-muted-foreground ">LTV Health Ratio</div>
          <div className="flex items-center gap-2 font-semibold">
            <FormattedNumber
              value={currentHealthFactor}
              maxValue={999}
              className={cn(`text-${getLTVColor(Number(currentHealthFactor))}`)}
            />
            <Icons.moveRight className="inline-block h-4 w-6" />
            <FormattedNumber
              value={newHealthFactor.lte(0) ? 999 : newHealthFactor}
              className={cn(
                `text-${getLTVColor(
                  Number(newHealthFactor.lte(0) ? 999 : newHealthFactor),
                )}`,
              )}
              maxValue={999}
            />
          </div>
        </div>
        <div className="flex justify-between text-sm leading-tight">
          <div className="text-muted-foreground ">Loan APY</div>
          <div className="font-semibold text-warning-foreground">
            <FormattedNumber value={reserve.variableBorrowAPY} percent />
          </div>
        </div>
      </div>
      {Number(amount) > 0 &&
        BigNumber(debtBalance).gt(BigNumber(tokenBalance)) && (
          <Alert variant="warning">
            <AlertTitle>
              {" "}
              <Icons.info className="mr-1 inline-block h-4 w-4" />
              You owe more HONEY than you have in your wallet
            </AlertTitle>
            You don't have enough funds in your wallet to repay the full amount.
            If you proceed to repay with your current amount of funds, you will
            still have a small borrowing position in your dashboard.
          </Alert>
        )}

      {allowance &&
      BigNumber(allowance.formattedAllowance).gte(BigNumber(amount ?? "0")) ? (
        <Button
          disabled={
            !amount || Number(amount) <= 0 || Number(amount) > Number(balance)
          }
          onClick={() => {
            write({
              address: lendPoolImplementationAddress,
              abi: lendPoolImplementationAbi,
              functionName: "repay",
              params: payload,
              gasLimit: 1000000n,
            });
          }}
        >
          {Number(amount) === 0 ? "Enter Amount" : "Repay"}
        </Button>
      ) : (
        <ApproveButton token={honey} spender={lendPoolImplementationAddress} />
      )}
    </div>
  );
};
