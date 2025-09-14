import React, { useState } from 'react';

const categories = [
  'AHORRO',
  'COMIDA',
  'CASA',
  'GASTOS VARIOS',
  'DEPORTES',
  'SALUD',
  'SUSCRIPCIONES',
  'ESTUDIO',
  'ENTRETENIMIENTO',
  'SERVICIOS',
  'TRANSPORTE'
];

const getCategoryIcon = (category) => {
  const icons = {
    'AHORRO': '💰',
    'COMIDA': '🍽️',
    'CASA': '🏠',
    'GASTOS VARIOS': '🛒',
    'DEPORTES': '⚽',
    'SALUD': '🏥',
    'SUSCRIPCIONES': '📺',
    'ESTUDIO': '📚',
    'ENTRETENIMIENTO': '🎬',
    'SERVICIOS': '🔧',
    'TRANSPORTE': '🚗'
  };
  return icons[category] || '📝';
};

const ExpenseList = ({ expenses }) => {
  const [filterCategory, setFilterCategory] = useState('');

  const filteredExpenses = filterCategory
    ? expenses.filter(expense => expense.category === filterCategory)
    : expenses;

  return (
    <div className="expense-list">
      <h2>Gastos</h2>
      <div className="filter-section">
        <label>Filtrar por categoría:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="expenses">
        {filteredExpenses.length === 0 ? (
          <p>No hay gastos registrados.</p>
        ) : (
          filteredExpenses.map(expense => (
            <div key={expense.id} className="expense-item">
              <div className="expense-icon">{getCategoryIcon(expense.category)}</div>
              <div className="expense-details">
                <div className="expense-category">{expense.category}</div>
                <div className="expense-name">{expense.name}</div>
                <div className="expense-date">{expense.date}</div>
              </div>
              <div className="expense-amount">${expense.amount.toFixed(2)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;