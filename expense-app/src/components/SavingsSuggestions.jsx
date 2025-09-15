import React, { useState, useEffect } from 'react';
import { 
  generateSavingsSuggestions, 
  getSavingsSummary, 
  formatCurrency, 
  getPriorityColor,
  getSuggestionTypeColor 
} from '../utils/savingsSuggestions';

const SavingsSuggestions = ({ expenses, budget, currentMonth }) => {
  const [suggestionsData, setSuggestionsData] = useState(null);
  const [expandedSuggestions, setExpandedSuggestions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateSuggestions = async () => {
      setIsLoading(true);
      try {
        // Add a small delay to simulate processing for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const data = generateSavingsSuggestions(expenses, budget, currentMonth);
        setSuggestionsData(data);
      } catch (error) {
        console.error('Error generating savings suggestions:', error);
        setSuggestionsData({
          suggestions: [],
          totalPotentialSavings: 0,
          analysisData: {}
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateSuggestions();
  }, [expenses, budget, currentMonth]);

  const toggleSuggestion = (suggestionId) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(suggestionId)) {
      newExpanded.delete(suggestionId);
    } else {
      newExpanded.add(suggestionId);
    }
    setExpandedSuggestions(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="savings-suggestions">
        <div className="savings-header">
          <h2>💡 Sugerencias de Ahorro</h2>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Analizando tus hábitos de gasto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!suggestionsData || suggestionsData.suggestions.length === 0) {
    return (
      <div className="savings-suggestions">
        <div className="savings-header">
          <h2>💡 Sugerencias de Ahorro</h2>
          <div className="no-suggestions">
            <div className="no-suggestions-icon">📊</div>
            <h3>¡Comienza a registrar gastos!</h3>
            <p>Una vez que registres algunos gastos, podremos analizar tus hábitos y ofrecerte sugerencias personalizadas para optimizar tu presupuesto.</p>
          </div>
        </div>
      </div>
    );
  }

  const { suggestions, totalPotentialSavings, analysisData } = suggestionsData;
  const summary = getSavingsSummary(suggestions);

  return (
    <div className="savings-suggestions">
      <div className="savings-header">
        <h2>💡 Sugerencias de Ahorro Personalizadas</h2>
        
        {/* Summary Cards */}
        <div className="savings-summary">
          <div className="summary-card potential-savings">
            <div className="summary-icon">💰</div>
            <div className="summary-content">
              <div className="summary-value">{formatCurrency(totalPotentialSavings)}</div>
              <div className="summary-label">Ahorro Potencial</div>
            </div>
          </div>
          
          <div className="summary-card suggestions-count">
            <div className="summary-icon">💡</div>
            <div className="summary-content">
              <div className="summary-value">{summary.totalSuggestions}</div>
              <div className="summary-label">Sugerencias</div>
            </div>
          </div>
          
          <div className="summary-card high-priority">
            <div className="summary-icon">🚨</div>
            <div className="summary-content">
              <div className="summary-value">{summary.highPrioritySuggestions}</div>
              <div className="summary-label">Alta Prioridad</div>
            </div>
          </div>
          
          <div className="summary-card categories">
            <div className="summary-icon">📂</div>
            <div className="summary-content">
              <div className="summary-value">{summary.categoriesAffected}</div>
              <div className="summary-label">Categorías</div>
            </div>
          </div>
        </div>

        {/* Analysis Insight */}
        {analysisData.budgetUsagePercentage > 0 && (
          <div className="analysis-insight">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <strong>Análisis del Mes:</strong> Has usado {analysisData.budgetUsagePercentage.toFixed(1)}% 
              de tu presupuesto ({formatCurrency(analysisData.totalSpent)} de {formatCurrency(budget)}) 
              en {analysisData.expenseCount} transacciones.
            </div>
          </div>
        )}
      </div>

      {/* Suggestions List */}
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div 
            key={suggestion.id} 
            className={`suggestion-card ${suggestion.priority} ${suggestion.type}`}
            style={{ '--priority-color': getPriorityColor(suggestion.priority) }}
          >
            <div className="suggestion-header" onClick={() => toggleSuggestion(suggestion.id)}>
              <div className="suggestion-title-section">
                <div className="suggestion-icon">{suggestion.icon}</div>
                <div className="suggestion-title-content">
                  <h3 className="suggestion-title">{suggestion.title}</h3>
                  <div className="suggestion-meta">
                    <span className="suggestion-category">{suggestion.category}</span>
                    <span className={`suggestion-priority priority-${suggestion.priority}`}>
                      {suggestion.priority === 'high' ? 'Alta Prioridad' : 
                       suggestion.priority === 'medium' ? 'Prioridad Media' : 'Baja Prioridad'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="suggestion-savings">
                {suggestion.potentialSavings > 0 && (
                  <div className="potential-savings">
                    <span className="savings-amount">{formatCurrency(suggestion.potentialSavings)}</span>
                    <span className="savings-label">ahorro potencial</span>
                  </div>
                )}
                <div className="expand-icon">
                  {expandedSuggestions.has(suggestion.id) ? '▼' : '▶'}
                </div>
              </div>
            </div>

            <div className="suggestion-description">
              <p>{suggestion.description}</p>
            </div>

            {expandedSuggestions.has(suggestion.id) && (
              <div className="suggestion-details">
                <div className="action-items">
                  <h4>📋 Plan de Acción:</h4>
                  <ul>
                    {suggestion.actionItems.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                {suggestion.potentialSavings > 0 && (
                  <div className="savings-breakdown">
                    <div className="savings-info">
                      <strong>💰 Ahorro Estimado:</strong> {formatCurrency(suggestion.potentialSavings)} por mes
                    </div>
                    <div className="savings-annual">
                      <strong>📅 Ahorro Anual:</strong> {formatCurrency(suggestion.potentialSavings * 12)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips Footer */}
      <div className="savings-tips">
        <div className="tips-header">
          <h3>💡 Consejos Generales para Ahorrar</h3>
        </div>
        <div className="tips-grid">
          <div className="tip-item">
            <div className="tip-icon">📝</div>
            <div className="tip-content">
              <strong>Regla 24 horas:</strong> Espera un día antes de hacer compras no planificadas mayores a S/100.
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-icon">🎯</div>
            <div className="tip-content">
              <strong>Metas claras:</strong> Define objetivos específicos de ahorro para mantenerte motivado.
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-icon">📊</div>
            <div className="tip-content">
              <strong>Revisa mensualmente:</strong> Analiza tus gastos cada mes para identificar nuevas oportunidades.
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-icon">🔄</div>
            <div className="tip-content">
              <strong>Automatiza ahorros:</strong> Configura transferencias automáticas a tu cuenta de ahorros.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsSuggestions;