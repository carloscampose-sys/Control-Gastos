// Utility functions for predicting next month's expenses

/**
 * Get category icons mapping
 */
export const getCategoryIcon = (category) => {
  const icons = {
    'Alimentación': '🍽️',
    'Transporte': '🚗',
    'Entretenimiento': '🎬',
    'Salud': '🏥',
    'Educación': '📚',
    'Servicios': '💡',
    'Ropa': '👕',
    'Hogar': '🏠',
    'Otros': '📦',
    'Tecnología': '💻',
    'Deportes': '⚽',
    'Viajes': '✈️',
    'Mascotas': '🐕',
    'Belleza': '💄',
    'Regalos': '🎁'
  };
  return icons[category] || '📦';
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
  
  // Analyze each category in current month
  Object.keys(currentByCategory).forEach(category => {
    const currentCategoryExpenses = currentByCategory[category];
    const previousCategoryExpenses = previousByCategory[category] || [];
    
    analysis[category] = {
      currentCount: currentCategoryExpenses.length,
      currentTotal: currentCategoryExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      currentAverage: currentCategoryExpenses.reduce((sum, exp) => sum + exp.amount, 0) / currentCategoryExpenses.length,
      previousCount: previousCategoryExpenses.length,
      previousTotal: previousCategoryExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      frequency: calculateFrequency(currentCategoryExpenses, previousCategoryExpenses),
      isRecurrent: isRecurrentCategory(category, currentCategoryExpenses, previousCategoryExpenses),
      isImportant: isImportantCategory(category),
      confidence: calculateCategoryConfidence(category, currentCategoryExpenses, previousCategoryExpenses),
      expenses: currentCategoryExpenses
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
    'Servicios', 'Alimentación', 'Transporte', 'Salud', 
    'Hogar', 'Educación'
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
      // Generate predictions for each expense type in the category
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