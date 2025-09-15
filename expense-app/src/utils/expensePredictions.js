// Utility functions for predicting next month's expenses

/**
 * Get category icons mapping
 */
export const getCategoryIcon = (category) => {
  const icons = {
    'COMIDA': '🍽️',
    'TRANSPORTE': '🚗',
    'ENTRETENIMIENTO': '🎬',
    'SALUD': '🏥',
    'ESTUDIO': '📚',
    'SERVICIOS': '🔧',
    'GASTOS VARIOS': '🛒',
    'CASA': '🏠',
    'DEPORTES': '⚽',
    'SUSCRIPCIONES': '📺',
    'AHORRO': '💰'
  };
  return icons[category] || '📝';
};

/**
 * Analyze expense patterns and generate predictions for next month
 */
export const generateExpensePredictions = (expenses, currentMonth) => {
  if (!expenses || expenses.length === 0) {
    return {
      predictions: [],
      totalPredicted: 0,
      confidence: 0,
      categoryAnalysis: {}
    };
  }

  // Get current month expenses
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date + 'T12:00:00');
    return expenseDate.getMonth() === currentMonth.getMonth() &&
           expenseDate.getFullYear() === currentMonth.getFullYear();
  });

  // Get previous months expenses for pattern analysis
  const previousMonthsExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date + 'T12:00:00');
    return expenseDate < currentMonth;
  });

  // Analyze category patterns
  const categoryAnalysis = analyzeCategoryPatterns(currentMonthExpenses, previousMonthsExpenses);
  
  // Generate predictions based on analysis
  const predictions = generateCategoryPredictions(categoryAnalysis, currentMonth);
  
  // Calculate total predicted amount
  const totalPredicted = predictions.reduce((sum, pred) => sum + pred.amount, 0);
  
  // Calculate overall confidence based on data availability
  const confidence = calculateOverallConfidence(categoryAnalysis, currentMonthExpenses.length);

  return {
    predictions,
    totalPredicted,
    confidence,
    categoryAnalysis
  };
};

/**
 * Analyze patterns for each category
 */
const analyzeCategoryPatterns = (currentExpenses, previousExpenses) => {
  const analysis = {};

  // Group current expenses by category
  const currentByCategory = groupExpensesByCategory(currentExpenses);
  const previousByCategory = groupExpensesByCategory(previousExpenses);

  // Get all unique categories from both current and previous expenses
  const allCategories = new Set([
    ...Object.keys(currentByCategory),
    ...Object.keys(previousByCategory)
  ]);

  // Analyze each category (including those that might have been deleted from current month)
  allCategories.forEach(category => {
    const currentCategoryExpenses = currentByCategory[category] || [];
    const previousCategoryExpenses = previousByCategory[category] || [];

    // For important categories, maintain historical patterns even if current expenses are deleted
    const isImportant = isImportantCategory(category);
    const hasHistoricalData = previousCategoryExpenses.length > 0;

    analysis[category] = {
      currentCount: currentCategoryExpenses.length,
      currentTotal: currentCategoryExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      currentAverage: currentCategoryExpenses.length > 0
        ? currentCategoryExpenses.reduce((sum, exp) => sum + exp.amount, 0) / currentCategoryExpenses.length
        : (hasHistoricalData ? previousCategoryExpenses.reduce((sum, exp) => sum + exp.amount, 0) / previousCategoryExpenses.length : 0),
      previousCount: previousCategoryExpenses.length,
      previousTotal: previousCategoryExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      frequency: calculateFrequency(currentCategoryExpenses, previousCategoryExpenses),
      isRecurrent: isRecurrentCategory(category, currentCategoryExpenses, previousCategoryExpenses),
      isImportant: isImportant,
      confidence: calculateCategoryConfidence(category, currentCategoryExpenses, previousCategoryExpenses),
      expenses: currentCategoryExpenses,
      hasHistoricalData: hasHistoricalData
    };
  });

  return analysis;
};

/**
 * Group expenses by category
 */
const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((groups, expense) => {
    const category = expense.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {});
};

/**
 * Calculate frequency score for a category
 */
const calculateFrequency = (currentExpenses, previousExpenses) => {
  const totalExpenses = currentExpenses.length + previousExpenses.length;
  if (totalExpenses === 0) return 0;
  
  // Higher frequency for categories with more transactions
  return Math.min(totalExpenses / 10, 1); // Normalize to 0-1
};

/**
 * Determine if a category is recurrent based on frequency
 */
const isRecurrentCategory = (category, currentExpenses, previousExpenses) => {
  const totalCount = currentExpenses.length + previousExpenses.length;
  
  // Categories with 3+ transactions are considered recurrent
  if (totalCount >= 3) return true;
  
  // Important categories are considered recurrent even with fewer transactions
  if (isImportantCategory(category) && totalCount >= 1) return true;
  
  return false;
};

/**
 * Determine if a category is important (likely to repeat)
 */
const isImportantCategory = (category) => {
  const importantCategories = [
    'SERVICIOS', 'COMIDA', 'TRANSPORTE', 'SALUD',
    'CASA', 'ESTUDIO', 'SUSCRIPCIONES'
  ];
  return importantCategories.includes(category);
};

/**
 * Calculate confidence level for category prediction
 */
const calculateCategoryConfidence = (category, currentExpenses, previousExpenses) => {
  let confidence = 0.3; // Base confidence
  
  // Increase confidence for important categories
  if (isImportantCategory(category)) {
    confidence += 0.3;
  }
  
  // Increase confidence based on frequency
  const totalCount = currentExpenses.length + previousExpenses.length;
  if (totalCount >= 5) confidence += 0.3;
  else if (totalCount >= 3) confidence += 0.2;
  else if (totalCount >= 2) confidence += 0.1;
  
  // Increase confidence for consistent amounts
  if (currentExpenses.length > 1) {
    const amounts = currentExpenses.map(exp => exp.amount);
    const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length;
    const coefficient = Math.sqrt(variance) / avg;
    
    if (coefficient < 0.3) confidence += 0.1; // Low variance = more predictable
  }
  
  return Math.min(confidence, 1);
};

/**
 * Generate predictions for each category
 */
const generateCategoryPredictions = (categoryAnalysis, currentMonth) => {
  const predictions = [];
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  Object.keys(categoryAnalysis).forEach(category => {
    const analysis = categoryAnalysis[category];

    // Only predict for recurrent or important categories
    if (analysis.isRecurrent || analysis.isImportant) {
      // For important categories with historical data but no current expenses,
      // create predictions based on historical patterns
      if (analysis.isImportant && analysis.hasHistoricalData && analysis.currentCount === 0) {
        // Create prediction based on historical average for important categories
        const historicalAverage = analysis.previousTotal / analysis.previousCount;

        const prediction = {
          id: `pred-${category}-historical-${Date.now()}`,
          category,
          name: `${category} (histórico)`,
          amount: Math.round(historicalAverage),
          icon: getCategoryIcon(category),
          estimatedDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15), // Middle of month
          confidence: Math.max(analysis.confidence, 0.6), // Boost confidence for important historical categories
          isRecurrent: true, // Consider important historical categories as recurrent
          isImportant: analysis.isImportant,
          frequency: analysis.frequency,
          source: 'historical_pattern'
        };

        predictions.push(prediction);
      } else if (analysis.currentCount > 0) {
        // Generate predictions for current expenses
        const uniqueExpenses = getUniqueExpenseTypes(analysis.expenses);

        uniqueExpenses.forEach(expenseType => {
          const prediction = {
            id: `pred-${category}-${expenseType.name}-${Date.now()}`,
            category,
            name: expenseType.name,
            amount: Math.round(expenseType.averageAmount),
            icon: getCategoryIcon(category),
            estimatedDate: estimateNextDate(expenseType.dates, nextMonth),
            confidence: analysis.confidence,
            isRecurrent: analysis.isRecurrent,
            isImportant: analysis.isImportant,
            frequency: analysis.frequency,
            source: 'pattern_analysis'
          };

          predictions.push(prediction);
        });
      }
    }
  });

  // Sort predictions by confidence and amount
  return predictions.sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    return b.amount - a.amount;
  });
};

/**
 * Get unique expense types within a category
 */
const getUniqueExpenseTypes = (expenses) => {
  const expenseTypes = {};
  
  expenses.forEach(expense => {
    const name = expense.name;
    if (!expenseTypes[name]) {
      expenseTypes[name] = {
        name,
        amounts: [],
        dates: []
      };
    }
    expenseTypes[name].amounts.push(expense.amount);
    expenseTypes[name].dates.push(new Date(expense.date));
  });
  
  // Calculate average amount for each expense type
  return Object.values(expenseTypes).map(type => ({
    name: type.name,
    averageAmount: type.amounts.reduce((sum, amt) => sum + amt, 0) / type.amounts.length,
    dates: type.dates
  }));
};

/**
 * Estimate the next occurrence date for an expense
 */
const estimateNextDate = (previousDates, nextMonth) => {
  if (previousDates.length === 0) {
    // Default to middle of next month
    return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15);
  }
  
  if (previousDates.length === 1) {
    // Use same day of month
    const day = previousDates[0].getDate();
    return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(day, 28));
  }
  
  // Calculate average day of month
  const avgDay = previousDates.reduce((sum, date) => sum + date.getDate(), 0) / previousDates.length;
  const estimatedDay = Math.round(avgDay);
  
  return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(estimatedDay, 28));
};

/**
 * Calculate overall confidence in predictions
 */
const calculateOverallConfidence = (categoryAnalysis, totalCurrentExpenses) => {
  if (totalCurrentExpenses === 0) return 0;
  
  const categories = Object.keys(categoryAnalysis);
  if (categories.length === 0) return 0;
  
  // Average confidence across all categories
  const avgConfidence = categories.reduce((sum, category) => {
    return sum + categoryAnalysis[category].confidence;
  }, 0) / categories.length;
  
  // Adjust based on data volume
  let dataVolumeMultiplier = 1;
  if (totalCurrentExpenses >= 20) dataVolumeMultiplier = 1.1;
  else if (totalCurrentExpenses >= 10) dataVolumeMultiplier = 1.05;
  else if (totalCurrentExpenses < 5) dataVolumeMultiplier = 0.8;
  
  return Math.min(avgConfidence * dataVolumeMultiplier, 1);
};

/**
 * Get prediction summary statistics
 */
export const getPredictionSummary = (predictions) => {
  if (!predictions || predictions.length === 0) {
    return {
      totalAmount: 0,
      categoryCount: 0,
      highConfidenceCount: 0,
      recurringCount: 0,
      importantCount: 0
    };
  }
  
  const totalAmount = predictions.reduce((sum, pred) => sum + pred.amount, 0);
  const categories = new Set(predictions.map(pred => pred.category));
  const highConfidenceCount = predictions.filter(pred => pred.confidence >= 0.7).length;
  const recurringCount = predictions.filter(pred => pred.isRecurrent).length;
  const importantCount = predictions.filter(pred => pred.isImportant).length;
  
  return {
    totalAmount,
    categoryCount: categories.size,
    highConfidenceCount,
    recurringCount,
    importantCount
  };
};

/**
 * Format date for display
 */
export const formatPredictionDate = (date) => {
  const options = { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  };
  return date.toLocaleDateString('es-ES', options);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Get explanation for low or medium confidence analysis
 */
export const getConfidenceExplanation = (confidence, categoryAnalysis, totalCurrentExpenses) => {
  if (confidence >= 0.7) return null; // No explanation needed for high confidence
  
  const explanations = [];
  
  if (confidence < 0.5) {
    // Low confidence explanations
    explanations.push({
      type: 'warning',
      title: '⚠️ Confianza Baja en las Predicciones',
      message: 'Las predicciones tienen baja confianza debido a datos limitados o patrones inconsistentes.'
    });
    
    if (totalCurrentExpenses < 5) {
      explanations.push({
        type: 'data',
        title: '📊 Pocos Datos Disponibles',
        message: `Solo tienes ${totalCurrentExpenses} gastos registrados este mes. Se necesitan más datos para predicciones precisas.`
      });
    }
    
    // Check for inconsistent patterns
    const inconsistentCategories = Object.keys(categoryAnalysis).filter(category => {
      const analysis = categoryAnalysis[category];
      return analysis.confidence < 0.4;
    });
    
    if (inconsistentCategories.length > 0) {
      explanations.push({
        type: 'pattern',
        title: '🔄 Patrones Inconsistentes',
        message: `Las categorías ${inconsistentCategories.slice(0, 3).join(', ')} muestran patrones irregulares de gasto.`
      });
    }
    
  } else if (confidence < 0.7) {
    // Medium confidence explanations
    explanations.push({
      type: 'info',
      title: '📈 Confianza Media en las Predicciones',
      message: 'Las predicciones son moderadamente confiables, pero pueden mejorarse con más datos históricos.'
    });
    
    if (totalCurrentExpenses < 10) {
      explanations.push({
        type: 'data',
        title: '📊 Datos Moderados',
        message: `Tienes ${totalCurrentExpenses} gastos registrados. Más transacciones mejorarían la precisión.`
      });
    }
  }
  
  return explanations;
};

/**
 * Get practical suggestions to improve prediction confidence
 */
export const getConfidenceImprovementSuggestions = (confidence, categoryAnalysis, totalCurrentExpenses) => {
  if (confidence >= 0.7) return []; // No suggestions needed for high confidence
  
  const suggestions = [];
  
  // General suggestions based on confidence level
  if (confidence < 0.5) {
    suggestions.push({
      priority: 'high',
      icon: '📝',
      title: 'Registra más gastos este mes',
      description: 'Agrega todos tus gastos diarios, incluso los pequeños. Cada transacción ayuda a crear mejores patrones.',
      action: 'Objetivo: Al menos 15-20 gastos por mes'
    });
    
    suggestions.push({
      priority: 'high',
      icon: '🔄',
      title: 'Incluye gastos recurrentes',
      description: 'Registra servicios básicos, suscripciones y gastos fijos que se repiten cada mes.',
      action: 'Revisa: luz, agua, internet, Netflix, etc.'
    });
  }
  
  if (confidence < 0.7) {
    suggestions.push({
      priority: 'medium',
      icon: '📂',
      title: 'Categoriza correctamente',
      description: 'Asegúrate de usar las categorías apropiadas para cada gasto. Esto mejora el análisis de patrones.',
      action: 'Revisa gastos mal categorizados'
    });
    
    suggestions.push({
      priority: 'medium',
      icon: '📅',
      title: 'Mantén consistencia temporal',
      description: 'Registra gastos regularmente durante todo el mes, no solo al final.',
      action: 'Registra gastos diariamente o semanalmente'
    });
  }
  
  // Specific suggestions based on category analysis
  const lowConfidenceCategories = Object.keys(categoryAnalysis).filter(category => {
    return categoryAnalysis[category].confidence < 0.5;
  });
  
  if (lowConfidenceCategories.length > 0) {
    suggestions.push({
      priority: 'medium',
      icon: '🎯',
      title: 'Mejora categorías específicas',
      description: `Las categorías ${lowConfidenceCategories.slice(0, 2).join(' y ')} necesitan más datos históricos.`,
      action: 'Registra más gastos en estas categorías'
    });
  }
  
  // Data volume suggestions
  if (totalCurrentExpenses < 5) {
    suggestions.push({
      priority: 'high',
      icon: '⚡',
      title: 'Acción inmediata requerida',
      description: 'Con muy pocos gastos registrados, las predicciones son poco confiables.',
      action: 'Registra al menos 10 gastos más este mes'
    });
  } else if (totalCurrentExpenses < 10) {
    suggestions.push({
      priority: 'medium',
      icon: '📈',
      title: 'Aumenta el volumen de datos',
      description: 'Más transacciones registradas = predicciones más precisas.',
      action: 'Objetivo: 15-20 gastos por mes'
    });
  }
  
  // Historical data suggestions
  suggestions.push({
    priority: 'low',
    icon: '🕒',
    title: 'Construye historial a largo plazo',
    description: 'Mantén el registro durante 2-3 meses para obtener predicciones muy precisas.',
    action: 'Continúa registrando gastos consistentemente'
  });
  
  // Sort suggestions by priority
  const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
  return suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
};

/**
 * Get confidence level details for display
 */
export const getConfidenceDetails = (confidence) => {
  if (confidence >= 0.7) {
    return {
      level: 'high',
      text: 'Alta',
      color: '#10b981',
      description: 'Las predicciones son muy confiables basadas en patrones sólidos de datos.',
      icon: '✅'
    };
  } else if (confidence >= 0.5) {
    return {
      level: 'medium',
      text: 'Media',
      color: '#f59e0b',
      description: 'Las predicciones son moderadamente confiables, pero pueden mejorarse.',
      icon: '⚠️'
    };
  } else {
    return {
      level: 'low',
      text: 'Baja',
      color: '#ef4444',
      description: 'Las predicciones tienen baja confianza debido a datos limitados.',
      icon: '🔴'
    };
  }
};