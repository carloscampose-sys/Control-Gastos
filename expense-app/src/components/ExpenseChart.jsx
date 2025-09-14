import React, { useState, useEffect } from 'react';

const ExpenseChart = ({ budget, spent, onEditBudget }) => {
  const [isTouched, setIsTouched] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const remaining = Math.max(0, budget - spent);
  const percentageSpent = budget > 0 ? (spent / budget) * 100 : 0;

  // Calculate the stroke dash array for the progress circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentageSpent / 100) * circumference;

  // Always show percentage on mobile, toggle details on touch
  const handleTouchStart = () => {
    setIsTouched(true);
  };

  const handleTouchEnd = () => {
    setIsTouched(false);
    setShowDetails(!showDetails);
  };

  // For desktop compatibility
  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  // Auto-update percentage display
  useEffect(() => {
    // Force re-render when percentage changes
  }, [percentageSpent]);

  return (
    <div className="expense-chart">
      <div className="content">
        <div className="chart-header">
          <h2>Resumen del Mes</h2>
          <button className="edit-budget-small-btn" onClick={onEditBudget} title="Modificar presupuesto">
            ✏️
          </button>
        </div>

        <div className="progress-container">
          <div
            className={`circular-progress ${isTouched ? 'touched' : ''} ${showDetails ? 'expanded' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-label={`Presupuesto gastado: ${percentageSpent.toFixed(1)}%. Toca para ver detalles.`}
          >
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke={percentageSpent > 90 ? '#dc2626' : percentageSpent > 75 ? '#f59e0b' : '#10b981'}
                strokeWidth="12"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className="progress-circle"
                style={{
                  transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.3s ease'
                }}
              />
              {/* Percentage text in center - ALWAYS VISIBLE */}
              <text
                x="100"
                y="95"
                textAnchor="middle"
                className="percentage-text visible"
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  fill: '#1e293b'
                }}
              >
                {percentageSpent.toFixed(1)}%
              </text>
              <text
                x="100"
                y="115"
                textAnchor="middle"
                className="percentage-label visible"
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  fill: '#64748b'
                }}
              >
                gastado
              </text>
            </svg>

            {/* Touch indicator for mobile */}
            <div className="touch-indicator">
              <span>Toca para detalles</span>
            </div>

            {/* Quick stats overlay when expanded */}
            {showDetails && (
              <div className="quick-stats-overlay">
                <div className="stat-item">
                  <span className="stat-label">Restante:</span>
                  <span className="stat-value">${remaining.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">${budget.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="budget-info">
          <div className="budget-item">
            <span className="label">Presupuesto Total:</span>
            <span className="value">${budget.toFixed(2)}</span>
          </div>
          <div className="budget-item">
            <span className="label">Disponible:</span>
            <span className="value available">${remaining.toFixed(2)}</span>
          </div>
          <div className="budget-item">
            <span className="label">Gastado:</span>
            <span className="value spent">${spent.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;