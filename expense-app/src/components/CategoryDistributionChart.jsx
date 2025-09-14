import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

const CategoryDistributionChart = ({ expenses, currentMonth }) => {
  // Filter expenses for current month
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date + 'T12:00:00');
    return expenseDate.getMonth() === currentMonth.getMonth() &&
           expenseDate.getFullYear() === currentMonth.getFullYear();
  });

  // Group expenses by category
  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  // Category colors
  const categoryColors = {
    'COMIDA': '#ef4444',
    'TRANSPORTE': '#f97316',
    'CASA': '#eab308',
    'ENTRETENIMIENTO': '#22c55e',
    'SALUD': '#3b82f6',
    'SUSCRIPCIONES': '#8b5cf6',
    'ESTUDIO': '#06b6d4',
    'DEPORTES': '#ec4899',
    'GASTOS VARIOS': '#6b7280',
    'SERVICIOS': '#84cc16',
    'AHORRO': '#10b981'
  };

  const doughnutData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(category => categoryColors[category] || '#6b7280'),
        borderColor: Object.keys(categoryTotals).map(category => categoryColors[category] || '#6b7280'),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="category-distribution-chart">
      <h2>📊 Distribución de Gastos - {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>

      {currentMonthExpenses.length === 0 ? (
        <div className="no-data-message">
          <p>📝 No hay gastos registrados en {monthNames[currentMonth.getMonth()]}.</p>
          <p>Agrega algunos gastos para ver la distribución por categorías.</p>
        </div>
      ) : (
        <>
          <div className="chart-summary">
            <div className="summary-stat">
              <span className="stat-label">Total Gastado:</span>
              <span className="stat-value">${totalSpent.toFixed(2)}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Categorías:</span>
              <span className="stat-value">{Object.keys(categoryTotals).length}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Gastos:</span>
              <span className="stat-value">{currentMonthExpenses.length}</span>
            </div>
          </div>

          <div className="distribution-chart-container">
            <div className="chart">
              <h3>🥧 Distribución por Categorías</h3>
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.label}: $${context.parsed.toFixed(2)} (${((context.parsed / totalSpent) * 100).toFixed(1)}%)`
                      }
                    },
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 12,
                        padding: 8,
                        generateLabels: (chart) => {
                          const data = chart.data;
                          return data.labels.map((label, i) => ({
                            text: `${getCategoryIcon(label)} ${label}`,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            strokeStyle: data.datasets[0].borderColor[i],
                            lineWidth: data.datasets[0].borderWidth,
                            hidden: !chart.getDataVisibility(i),
                            index: i
                          }));
                        }
                      }
                    }
                  }
                }}
              />
            </div>

            <div className="category-breakdown">
              <h3>📋 Desglose por Categoría</h3>
              <div className="category-list">
                {Object.entries(categoryTotals)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => (
                  <div key={category} className="category-item">
                    <div className="category-info">
                      <span className="category-icon">{getCategoryIcon(category)}</span>
                      <span className="category-name">{category}</span>
                    </div>
                    <div className="category-amounts">
                      <span className="amount">${amount.toFixed(2)}</span>
                      <span className="percentage">
                        ({((amount / totalSpent) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryDistributionChart;