import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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


const AddExpenseForm = ({ onAddExpense, budget, spent, currentMonth }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
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
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      };

      onAddExpense(newExpense);

      // Clear form and close modal
      setName('');
      setAmount('');
      setCategory('');
      setDate(new Date());
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
                <DatePicker
                  selected={date}
                  onChange={(date) => setDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="date-input"
                  required
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