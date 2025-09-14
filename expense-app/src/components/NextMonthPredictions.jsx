import React, { useState, useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import {
  generateExpensePredictions,
  getPredictionSummary,
  formatPredictionDate,
  formatCurrency,
  getCategoryIcon
} from '../utils/expensePredictions';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const NextMonthPredictions = ({ expenses, currentMonth }) => {
  const [selectedView, setSelectedView] = useState('overview'); // 'overview', 'detailed', 'chart'
  
  // Generate predictions
  const predictionData = useMemo(() => {
    return generateExpensePredictions(expenses, currentMonth);
  }, [expenses, currentMonth]);

  const { predictions, totalPredicted, confidence, categoryAnalysis } = predictionData;
  const summary = getPredictionSummary(predictions);

  // Get next month info
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const nextMonthName = nextMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Prepare chart data
  const chartData = useMemo(() => {
    if (predictions.length === 0) return null;

    const categoryTotals = predictions.reduce((acc, pred) => {
      acc[pred.category] = (acc[pred.category] || 0) + pred.amount;
      return acc;
    }, {});

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];

    return {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: colors.slice(0, categories.length),
        borderColor: colors.slice(0, categories.length).map(color => color + '80'),
        borderWidth: 2,
      }]
    };
  }, [predictions]);

  const barChartData = useMemo(() => {
    if (predictions.length === 0) return null;

    const sortedPredictions = [...predictions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Top 8 predictions

    return {
      labels: sortedPredictions.map(pred => pred.name.length > 15 ? pred.name.substring(0, 15) + '...' : pred.name),
      datasets: [{
        label: 'Monto Estimado',
        data: sortedPredictions.map(pred => pred.amount),
        backgroundColor: sortedPredictions.map(pred => 
          pred.confidence >= 0.7 ? '#10b981' : pred.confidence >= 0.5 ? '#f59e0b' : '#ef4444'
        ),
        borderColor: sortedPredictions.map(pred => 
          pred.confidence >= 0.7 ? '#059669' : pred.confidence >= 0.5 ? '#d97706' : '#dc2626'
        ),
        borderWidth: 2,
        borderRadius: 6,
      }]
    };
  }, [predictions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed || context.raw;
            return `${context.label}: ${formatCurrency(value)}`;
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return '#10b981';
    if (confidence >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.7) return 'Alta';
    if (confidence >= 0.5) return 'Media';
    return 'Baja';
  };

  if (predictions.length === 0) {
    return (
      <div className="next-month-predictions">
        <div className="predictions-header">
          <h2>📊 Predicciones para {nextMonthName}</h2>
          <p className="predictions-subtitle">
            Análisis predictivo de gastos basado en patrones históricos
          </p>
        </div>
        
        <div className="no-predictions">
          <div className="no-predictions-icon">🔮</div>
          <h3>No hay suficientes datos para generar predicciones</h3>
          <p>
            Necesitamos más información sobre tus gastos actuales para poder predecir 
            los gastos del próximo mes. Continúa registrando tus gastos para obtener 
            predicciones más precisas.
          </p>
          <div className="prediction-tips">
            <h4>💡 Consejos para mejores predicciones:</h4>
            <ul>
              <li>Registra gastos regularmente durante el mes</li>
              <li>Incluye gastos recurrentes como servicios</li>
              <li>Categoriza correctamente tus gastos</li>
              <li>Mantén un historial de varios meses</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="next-month-predictions">
      <div className="predictions-header">
        <h2>🔮 Predicciones para {nextMonthName}</h2>
        <p className="predictions-subtitle">
          Proyecciones basadas en tus patrones de gasto actuales
        </p>
        <div className="confidence-indicator">
          <span className="confidence-label">Confianza del análisis:</span>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ 
                width: `${confidence * 100}%`,
                backgroundColor: getConfidenceColor(confidence)
              }}
            ></div>
          </div>
          <span className="confidence-text" style={{ color: getConfidenceColor(confidence) }}>
            {getConfidenceText(confidence)} ({Math.round(confidence * 100)}%)
          </span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${selectedView === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedView('overview')}
        >
          📋 Resumen
        </button>
        <button 
          className={`toggle-btn ${selectedView === 'detailed' ? 'active' : ''}`}
          onClick={() => setSelectedView('detailed')}
        >
          📝 Detallado
        </button>
        <button 
          className={`toggle-btn ${selectedView === 'chart' ? 'active' : ''}`}
          onClick={() => setSelectedView('chart')}
        >
          📊 Gráficos
        </button>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <div className="predictions-overview">
          <div className="prediction-summary">
            <div className="summary-cards">
              <div className="summary-card total">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3>Total Estimado</h3>
                  <p className="amount">{formatCurrency(totalPredicted)}</p>
                </div>
              </div>
              
              <div className="summary-card categories">
                <div className="card-icon">📂</div>
                <div className="card-content">
                  <h3>Categorías</h3>
                  <p className="count">{summary.categoryCount}</p>
                </div>
              </div>
              
              <div className="summary-card high-confidence">
                <div className="card-icon">✅</div>
                <div className="card-content">
                  <h3>Alta Confianza</h3>
                  <p className="count">{summary.highConfidenceCount}</p>
                </div>
              </div>
              
              <div className="summary-card recurring">
                <div className="card-icon">🔄</div>
                <div className="card-content">
                  <h3>Recurrentes</h3>
                  <p className="count">{summary.recurringCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="top-predictions">
            <h3>🎯 Principales Predicciones</h3>
            <div className="predictions-grid">
              {predictions.slice(0, 6).map((prediction) => (
                <div key={prediction.id} className="prediction-card">
                  <div className="prediction-header">
                    <span className="prediction-icon">{prediction.icon}</span>
                    <div className="prediction-info">
                      <h4>{prediction.name}</h4>
                      <span className="prediction-category">{prediction.category}</span>
                    </div>
                  </div>
                  <div className="prediction-details">
                    <div className="prediction-amount">{formatCurrency(prediction.amount)}</div>
                    <div className="prediction-date">
                      📅 {formatPredictionDate(prediction.estimatedDate)}
                    </div>
                    <div className="prediction-confidence">
                      <span 
                        className="confidence-badge"
                        style={{ backgroundColor: getConfidenceColor(prediction.confidence) }}
                      >
                        {getConfidenceText(prediction.confidence)}
                      </span>
                      {prediction.isRecurrent && <span className="recurrent-badge">🔄</span>}
                      {prediction.isImportant && <span className="important-badge">⭐</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {selectedView === 'detailed' && (
        <div className="predictions-detailed">
          <div className="predictions-list">
            <h3>📋 Lista Completa de Predicciones</h3>
            <div className="predictions-table">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="prediction-row">
                  <div className="prediction-main">
                    <span className="prediction-icon">{prediction.icon}</span>
                    <div className="prediction-text">
                      <h4>{prediction.name}</h4>
                      <span className="prediction-category">{prediction.category}</span>
                    </div>
                  </div>
                  <div className="prediction-meta">
                    <div className="prediction-amount">{formatCurrency(prediction.amount)}</div>
                    <div className="prediction-date">
                      {formatPredictionDate(prediction.estimatedDate)}
                    </div>
                    <div className="prediction-badges">
                      <span 
                        className="confidence-badge small"
                        style={{ backgroundColor: getConfidenceColor(prediction.confidence) }}
                      >
                        {Math.round(prediction.confidence * 100)}%
                      </span>
                      {prediction.isRecurrent && <span className="badge recurrent">Recurrente</span>}
                      {prediction.isImportant && <span className="badge important">Importante</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart View */}
      {selectedView === 'chart' && chartData && (
        <div className="predictions-charts">
          <div className="charts-grid">
            <div className="chart-container">
              <h3>📊 Distribución por Categorías</h3>
              <div className="chart-wrapper">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            </div>
            
            {barChartData && (
              <div className="chart-container">
                <h3>📈 Principales Gastos Estimados</h3>
                <div className="chart-wrapper">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>
            )}
          </div>
          
          <div className="chart-legend">
            <h4>🎨 Leyenda de Confianza</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                <span>Alta confianza (≥70%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>Confianza media (50-69%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Baja confianza (&lt;50%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="predictions-disclaimer">
        <div className="disclaimer-content">
          <h4>⚠️ Importante</h4>
          <p>
            Estas son <strong>proyecciones estimadas</strong> basadas en tus patrones de gasto actuales. 
            Los montos y fechas reales pueden variar. Utiliza esta información como una guía para 
            planificar tu presupuesto del próximo mes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NextMonthPredictions;