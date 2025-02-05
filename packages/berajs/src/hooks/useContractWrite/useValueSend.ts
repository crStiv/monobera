import { useCallback, useReducer } from "react";
import { usePublicClient, useWalletClient } from "wagmi";

import { ActionEnum, initialState, reducer } from "~/utils/stateReducer";
import { useBeraJs } from "~/contexts";
import { TransactionFailedError } from "./error";
import {
  type IUseContractWriteArgs,
  type IValueSend,
  type useTxnSendWriteApi,
} from "./types";

const useValueSend = ({
  onSuccess,
  onError,
  onLoading,
  onSubmission,
}: IUseContractWriteArgs = {}): useTxnSendWriteApi => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { account } = useBeraJs();

  const write = useCallback(
    async ({ address, value = 0n }: IValueSend): Promise<void> => {
      dispatch({ type: ActionEnum.LOADING });
      onLoading?.();
      let receipt: any | undefined;
      if (!publicClient) return;
      try {
        receipt = await walletClient?.sendTransaction({
          to: address,
          value: value,
          account: account,
        });
        dispatch({ type: ActionEnum.SUBMITTING });

        onSubmission?.(receipt);
        const confirmationReceipt: any =
          await publicClient.waitForTransactionReceipt({
            hash: receipt,
            pollingInterval: 200,
          });
        if (confirmationReceipt?.status === "success") {
          dispatch({ type: ActionEnum.SUCCESS });
          onSuccess?.(receipt);
        } else {
          const e = new TransactionFailedError();
          onError?.({
            message: e?.message ?? "Transaction failed",
            hash: receipt,
          });
        }
      } catch (e: any) {
        console.log(e);
        dispatch({ type: ActionEnum.ERROR });
        onError?.({
          message: e?.message ?? "Transaction failed",
          hash: e?.transactionHash,
        });
      }
    },
    [
      walletClient,
      account,
      publicClient,
      onSuccess,
      onError,
      onLoading,
      onSubmission,
    ],
  );

  return {
    isLoading: state.confirmState === "loading",
    isSubmitting: state.confirmState === "submitting",
    isSuccess: state.confirmState === "success",
    isError: state.confirmState === "fail",
    write,
  };
};

export default useValueSend;
