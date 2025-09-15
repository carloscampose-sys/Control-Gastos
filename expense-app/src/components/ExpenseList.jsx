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

const ExpenseList = ({ expenses, onDeleteExpense }) => {
  const [filterCategory, setFilterCategory] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredExpenses = filterCategory
    ? expenses.filter(expense => expense.category === filterCategory)
    : expenses;

  const handleDeleteClick = (expenseId) => {
    setDeleteConfirm(expenseId);
  };

  const handleDeleteConfirm = (expenseId) => {
    onDeleteExpense(expenseId);
    setDeleteConfirm(null);
    setSuccessMessage('Gasto eliminado exitosamente');

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="expense-list">
      <h2>Gastos</h2>

      {/* Success message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

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
              <div className="expense-actions">
                {deleteConfirm === expense.id ? (
                  <div className="delete-confirm">
                    <span>¿Eliminar?</span>
                    <button
                      className="confirm-btn"
                      onClick={() => handleDeleteConfirm(expense.id)}
                      title="Confirmar eliminación"
                    >
                      ✓
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={handleDeleteCancel}
                      title="Cancelar"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(expense.id)}
                    title="Eliminar gasto"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;