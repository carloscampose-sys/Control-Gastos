import React, { useState, useEffect } from 'react';

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

const formatDate = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return firstDay.toISOString().split('T')[0];
};

const AddExpenseForm = ({ onAddExpense, budget, spent, currentMonth }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const expenseAmount = parseFloat(amount);

    if (spent + expenseAmount > budget) {
      setError('El gasto supera el presupuesto disponible. No se puede registrar.');
      return;
    }

    if (name.trim() && expenseAmount > 0 && category && date) {
      const newExpense = {
        id: Date.now(),
        name: name.trim(),
        amount: expenseAmount,
        category,
        date
      };

      onAddExpense(newExpense);

      // Clear form and close modal
      setName('');
      setAmount('');
      setCategory('');
      setDate('');
      setError('');
      setIsFormVisible(false); // Hide form after successful submission
    } else {
      setError('Por favor complete todos los campos correctamente.');
    }
  };

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      // Clear form when opening
      setName('');
      setAmount('');
      setCategory('');
      setDate(formatDate(currentMonth));
      setError('');
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFormVisible) {
        toggleForm();
      }
    };

    if (isFormVisible) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFormVisible]);

  // Update date when currentMonth changes
  useEffect(() => {
    if (isFormVisible) {
      setDate(formatDate(currentMonth));
    }
  }, [currentMonth]);

  return (
    <div className="add-expense-form">
      <button className="add-expense-btn" onClick={toggleForm} title="Agregar nuevo gasto">
        {isFormVisible ? '✕' : '+'}
      </button>

      {isFormVisible && (
        <>
          {/* Backdrop overlay */}
          <div className="modal-backdrop" onClick={toggleForm}></div>

          {/* Modal container */}
          <div className="expense-form-container">
            <button className="modal-close-btn" onClick={toggleForm} title="Cerrar">
              ✕
            </button>
            <h3>Agregar Nuevo Gasto</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del gasto:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Almuerzo en restaurante"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Monto ($):</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoría:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  readOnly
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">Agregar Gasto</button>
                <button type="button" className="cancel-btn" onClick={toggleForm}>Cancelar</button>
              </div>

              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AddExpenseForm;