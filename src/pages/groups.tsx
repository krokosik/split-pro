import Head from 'next/head';
import MainLayout from '~/components/Layout/MainLayout';
import clsx from 'clsx';
import { Button } from '~/components/ui/button';
import { PlusIcon } from '@heroicons/react/24/solid';
import { getServerAuthSessionForSSG } from '~/server/auth';
import { type User } from '@prisma/client';
import { api } from '~/utils/api';
import { CreateGroup } from '~/components/group/CreateGroup';
import Link from 'next/link';
import { GroupAvatar } from '~/components/ui/avatar';
import { toUIString } from '~/utils/numbers';
import { motion } from 'framer-motion';
import { type NextPageWithUser } from '~/types';

const BalancePage: NextPageWithUser = () => {
  const groupQuery = api.group.getAllGroupsWithBalances.useQuery();

  return (
    <>
      <Head>
        <title>Groups</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout
        title="Groups"
        actions={
          <CreateGroup>
            <PlusIcon className="h-6 w-6 text-primary" />
          </CreateGroup>
        }
      >
        <div className="mt-2">
          <div className="mt-5 flex flex-col gap-8 px-4 pb-36">
            {groupQuery.isLoading ? null : groupQuery.data?.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-[30vh] flex flex-col items-center justify-center gap-20"
              >
                <CreateGroup>
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create Group
                  </Button>
                </CreateGroup>
              </motion.div>
            ) : (
              groupQuery.data?.map((g) => {
                const [currency, amount] = Object.entries(g.balances).reduce(
                  (acc, balance) => {
                    if (Math.abs(balance[1]) > Math.abs(acc[1])) {
                      return balance;
                    }
                    return acc;
                  },
                  [g.defaultCurrency, 0],
                );
                const multiCurrency = Object.values(g.balances).filter((b) => b !== 0).length > 1;
                return (
                  <GroupBalance
                    key={g.id}
                    groupId={g.id}
                    name={g.name}
                    amount={amount}
                    isPositive={amount >= 0 ? true : false}
                    currency={currency}
                  />
                );
              })
            )}
          </div>
        </div>
      </MainLayout>
    </>
  );
};

const GroupBalance: React.FC<{
  groupId: number;
  name: string;
  amount: number;
  isPositive: boolean;
  currency: string;
}> = ({ name, amount, isPositive, currency, groupId }) => {
  return (
    <Link href={`/groups/${groupId}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GroupAvatar name={name} size={40} />
          <div className=" text-foreground">{name}</div>
        </div>
        <div>
          {amount === 0 ? (
            <div className="text-sm text-gray-400">Settled up</div>
          ) : (
            <>
              <div
                className={clsx(
                  'text-right text-xs',
                  isPositive ? 'text-emerald-500' : 'text-orange-600',
                )}
              >
                {isPositive ? 'you lent' : 'you owe'}
              </div>
              <div className={`${isPositive ? 'text-emerald-500' : 'text-orange-600'} text-right`}>
                {currency} {toUIString(amount)}
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

BalancePage.auth = true;

export default BalancePage;