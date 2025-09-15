import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BudgetForm from './components/BudgetForm';
import ExpenseChart from './components/ExpenseChart';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import CategoryDistributionChart from './components/CategoryDistributionChart';
import NextMonthPredictions from './components/NextMonthPredictions';
import SavingsSuggestions from './components/SavingsSuggestions';
import './App.css';

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [budgets, setBudgets] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // Helper function to get month key
  const getMonthKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // Get current month's budget
  const currentBudget = budgets[getMonthKey(currentMonth)] || 0;

  // Load data from localStorage on mount
  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    const savedBudget = localStorage.getItem('budget'); // Legacy support
    const savedExpenses = localStorage.getItem('expenses');

    let budgetsObj = {};

    if (savedBudgets) {
      try {
        budgetsObj = JSON.parse(savedBudgets);
        if (typeof budgetsObj !== 'object' || budgetsObj === null) {
          budgetsObj = {};
        }
      } catch (error) {
        console.error('Error parsing budgets from localStorage:', error);
        budgetsObj = {};
      }
    }

    // Migrate legacy single budget to current month
    if (savedBudget && !savedBudgets) {
      const budgetValue = parseFloat(savedBudget);
      if (!isNaN(budgetValue) && budgetValue > 0) {
        const currentMonthKey = getMonthKey(new Date());
        budgetsObj[currentMonthKey] = budgetValue;
        // Remove old budget key
        localStorage.removeItem('budget');
      }
    }

    setBudgets(budgetsObj);

    if (savedExpenses) {
      try {
        const expensesArray = JSON.parse(savedExpenses);
        if (Array.isArray(expensesArray)) {
          setExpenses(expensesArray);
        }
      } catch (error) {
        console.error('Error parsing expenses from localStorage:', error);
        setExpenses([]);
      }
    }
  }, []);

  // Save data to localStorage whenever budgets or expenses change
  useEffect(() => {
    try {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    } catch (error) {
      console.error('Error saving budgets to localStorage:', error);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses to localStorage:', error);
    }
  }, [expenses]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setIsEditingBudget(false); // Reset editing state when switching months
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setIsEditingBudget(false); // Reset editing state when switching months
  };

  const handleEditBudget = () => {
    setIsEditingBudget(true);
  };

  const handleSaveBudget = (newBudget) => {
    const monthKey = getMonthKey(currentMonth);
    setBudgets(prev => ({
      ...prev,
      [monthKey]: newBudget
    }));
    setIsEditingBudget(false);
  };

  const handleAddExpense = (expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  // Filter expenses for current month
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date + 'T12:00:00'); // Use noon to avoid timezone issues
    return expenseDate.getMonth() === currentMonth.getMonth() &&
           expenseDate.getFullYear() === currentMonth.getFullYear();
  });

  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="app">
      <Header
        currentMonth={currentMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />
      <div className="main-content">
        <div className="left-panel">
          <BudgetForm
            budget={currentBudget}
            onSaveBudget={handleSaveBudget}
            isEditing={isEditingBudget}
            onStartEditing={() => setIsEditingBudget(true)}
          />
          <ExpenseChart
            budget={currentBudget}
            spent={totalSpent}
            onEditBudget={handleEditBudget}
          />
        </div>
        <div className="right-panel">
          <AddExpenseForm
            onAddExpense={handleAddExpense}
            budget={currentBudget}
            spent={totalSpent}
          />
          <ExpenseList expenses={currentMonthExpenses} />
        </div>
      </div>

      {/* Current Month Category Distribution */}
      <CategoryDistributionChart
        expenses={expenses}
        currentMonth={currentMonth}
      />

      {/* Next Month Predictions */}
      <NextMonthPredictions
        expenses={expenses}
        currentMonth={currentMonth}
      />

      {/* Savings Suggestions */}
      <SavingsSuggestions
        expenses={expenses}
        budget={currentBudget}
        currentMonth={currentMonth}
      />

    </div>
  );
}

export default App;
