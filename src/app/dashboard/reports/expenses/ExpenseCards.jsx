"use client";
import MyStatCard from '@/components/MyStatCard';
import React, { useEffect, useMemo } from 'react';
import { GiSplitArrows } from "react-icons/gi";
import { useExpenseStore } from '@/store/expenseStore';

const ExpenseCards = () => {
  const { expenses, fetchExpenses } = useExpenseStore();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Calculate totals
  const { todayTotal, monthTotal, yesterdayTotal } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayTotal = 0;
    let yesterdayTotal = 0;
    let monthTotal = 0;

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.expenseDate || expense.createdAt);
      const expenseDay = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());
      const amount = parseFloat(expense.amount) || 0;

      // Today's total
      if (expenseDay.getTime() === today.getTime()) {
        todayTotal += amount;
      }

      // Yesterday's total
      if (expenseDay.getTime() === yesterday.getTime()) {
        yesterdayTotal += amount;
      }

      // This month's total
      if (expenseDate >= monthStart) {
        monthTotal += amount;
      }
    });

    return { todayTotal, monthTotal, yesterdayTotal };
  }, [expenses]);

  // Calculate percentage change from yesterday
  const percentageChange = yesterdayTotal > 0 
    ? (((todayTotal - yesterdayTotal) / yesterdayTotal) * 100).toFixed(1)
    : todayTotal > 0 ? '+100' : '0';

  const salesData = [
    {
      title: "Total Expenses",
      date: "Today",
      amount: `₦${todayTotal.toLocaleString()}`,
      change: `${percentageChange >= 0 ? '+' : ''}${percentageChange}%`,
      changeText: "from yesterday",
      icon: <GiSplitArrows className="text-neutral-800 text-lg" />,
    },
    {
      title: "Total Expenses",
      date: "This month",
      amount: `₦${monthTotal.toLocaleString()}`,
      icon: <GiSplitArrows className="text-neutral-800 text-lg" />,
    }, 
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {salesData.map((item, index) =>
          <MyStatCard
            key={index}
            title={item.title}
            date={item.date}
            amount={item.amount}
            change={item.change}
            changeText={item.changeText}
            icon={item.icon}
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseCards;