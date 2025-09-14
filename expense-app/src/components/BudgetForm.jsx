import React, { useState, useEffect } from 'react';

const BudgetForm = ({ budget, onSaveBudget, isEditing, onStartEditing }) => {
  const [inputBudget, setInputBudget] = useState(budget || '');
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync inputBudget with budget prop when it changes
  useEffect(() => {
    setInputBudget(budget || '');
  }, [budget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBudget = parseFloat(inputBudget);
    if (newBudget > 0) {
      onSaveBudget(newBudget);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const startEditing = () => {
    setInputBudget(budget || '');
    onStartEditing();
  };

  const cancelEditing = () => {
    setInputBudget(budget || '');
    // Reset editing state in parent by calling onSaveBudget with current budget
    // This will trigger setIsEditingBudget(false) in the parent
    onSaveBudget(budget);
  };

  return (
    <div className="budget-form">
      <div className="content">
        <h2>Presupuesto Mensual</h2>

        {budget > 0 && !isEditing ? (
          <div className="budget-display">
            <div className="current-budget">
              <p>Presupuesto actual: <strong>${budget.toFixed(2)}</strong></p>
            </div>
            <button className="edit-budget-btn" onClick={startEditing}>
              ✏️ Modificar Presupuesto
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Monto del presupuesto ($):</label>
              <input
                type="number"
                value={inputBudget}
                onChange={(e) => setInputBudget(e.target.value)}
                placeholder="Ej: 1500.00"
                min="0"
                step="0.01"
                required
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {budget > 0 ? 'Actualizar Presupuesto' : 'Guardar Presupuesto'}
              </button>
              {budget > 0 && isEditing && (
                <button type="button" className="cancel-btn" onClick={cancelEditing}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}

        {showSuccess && (
          <p className="success-message">
            ¡Presupuesto {budget > 0 ? 'actualizado' : 'guardado'} exitosamente!
          </p>
        )}
      </div>
    </div>
  );
};

export default BudgetForm;