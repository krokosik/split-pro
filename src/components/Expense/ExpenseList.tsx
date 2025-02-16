import { SplitType } from '@prisma/client';
import { inferRouterOutputs } from '@trpc/server';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { CategoryIcon } from '~/components/ui/categoryIcons';
import { GroupRouter } from '~/server/api/routers/group';
import { UserRouter } from '~/server/api/routers/user';
import { toUIString } from '~/utils/numbers';

export const ExpenseList: React.FC<{
  userId: number;
  expenses:
    | inferRouterOutputs<GroupRouter>['getExpenses']
    | inferRouterOutputs<UserRouter>['getExpensesWithFriend'];
  contactId: string;
  isLoading?: boolean;
}> = ({ userId, expenses, contactId, isLoading }) => (
  <>
    {expenses.map((e) => {
      const youPaid = e.paidBy === userId;
      const yourExpense = e.expenseParticipants.find((p) => p.userId === userId);
      const isSettlement = e.splitType === SplitType.SETTLEMENT;
      const yourExpenseAmount = youPaid ? yourExpense?.amount ?? 0 : -(yourExpense?.amount ?? 0);

      return (
        <Link
          href={`/groups/${contactId}/expenses/${e.id}`}
          key={e.id}
          className="flex items-center justify-between py-2"
        >
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500">
              {format(e.expenseDate, 'MMM dd')
                .split(' ')
                .map((d) => (
                  <div className="text-center" key={d}>
                    {d}
                  </div>
                ))}
            </div>
            <div>
              <CategoryIcon category={e.category} className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              {!isSettlement ? (
                <p className=" max-w-[180px] truncate text-sm lg:max-w-md lg:text-base">{e.name}</p>
              ) : null}
              <p
                className={`flex text-center ${isSettlement ? 'text-sm text-gray-400' : 'text-xs text-gray-500'}`}
              >
                <span className="text-[10px]">{isSettlement ? '  🎉  ' : null}</span>
                {youPaid ? 'You' : e.paidByUser.name ?? e.paidByUser.email} paid {e.currency}{' '}
                {toUIString(e.amount)}{' '}
              </p>
            </div>
          </div>
          {isSettlement ? null : (
            <div className="min-w-10 shrink-0">
              {youPaid || yourExpenseAmount !== 0 ? (
                <>
                  <div
                    className={`text-right text-xs ${youPaid ? 'text-emerald-500' : 'text-orange-600'}`}
                  >
                    {youPaid ? 'You lent' : 'You owe'}
                  </div>
                  <div className={`text-right ${youPaid ? 'text-emerald-500' : 'text-orange-600'}`}>
                    <span className="font-light ">{e.currency}</span>{' '}
                    {toUIString(yourExpenseAmount)}
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-xs text-gray-400">Not involved</p>
                </div>
              )}
            </div>
          )}
        </Link>
      );
    })}
    {expenses.length === 0 && !isLoading ? (
      <div className="mt-20 flex flex-col items-center justify-center ">
        <Image src="/add_expense.svg" alt="Empty" width={200} height={200} className="mb-4" />
      </div>
    ) : null}
  </>
);
