import { useBeraJs } from "@bera/berajs";
import { ConnectWalletBear, DataTable, NotFoundBear } from "@bera/shared-ui";

import { my_columns } from "~/components/pools-table-columns";
import { usePollUserDeposited } from "~/hooks/usePollUserDeposited";
import { getPoolUrl } from "../../fetchPools";
import { PoolCard } from "./PoolCard";
import CardViewLoading from "./card-view-loading";
import TableViewLoading from "./table-view-loading";

export default function MyPool({ isList }: { isList: boolean }) {
  const { isReady } = useBeraJs();
  const { usePositions, isLoading } = usePollUserDeposited();
  const userPools = usePositions();

  return (
    <>
      {" "}
      {!isReady ? (
        <ConnectWalletBear
          message="You need to connect your wallet to see deposited pools and
        rewards"
        />
      ) : isLoading ? (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          {isList ? <TableViewLoading /> : <CardViewLoading />}
        </div>
      ) : userPools === undefined || userPools.length === 0 ? (
        <NotFoundBear title="No Pools found." />
      ) : isList ? (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <DataTable
            data={userPools}
            columns={my_columns}
            title={`My Pools (${userPools?.length ?? "0"})`}
            onRowClick={(row: any) => {
              window.open(getPoolUrl(row.original), "_self");
            }}
          />
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {userPools.map((pool: any) => {
              return (
                <PoolCard
                  pool={pool}
                  key={`search${pool?.pool}`}
                  isUserData={true}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}