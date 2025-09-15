// Utility functions for generating personalized savings suggestions

/**
 * Analyze spending habits and generate personalized savings suggestions
 */
export const generateSavingsSuggestions = (expenses, budget, currentMonth) => {
  if (!expenses || expenses.length === 0) {
    return {
      suggestions: getBasicSavingsSuggestions(),
      totalPotentialSavings: 0,
      analysisData: {}
    };
  }

  // Filter expenses for current month
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date + 'T12:00:00');
    return expenseDate.getMonth() === currentMonth.getMonth() &&
           expenseDate.getFullYear() === currentMonth.getFullYear();
  });

  // Analyze spending patterns
  const analysisData = analyzeSpendingPatterns(currentMonthExpenses, budget);
  
  // Generate personalized suggestions
  const suggestions = generatePersonalizedSuggestions(analysisData, currentMonthExpenses, budget);
  
  // Calculate total potential savings
  const totalPotentialSavings = suggestions.reduce((sum, suggestion) => 
    sum + (suggestion.potentialSavings || 0), 0
  );

  return {
    suggestions,
    totalPotentialSavings,
    analysisData
  };
};

/**
 * Analyze spending patterns to identify optimization opportunities
 */
const analyzeSpendingPatterns = (expenses, budget) => {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetUsagePercentage = budget > 0 ? (totalSpent / budget) * 100 : 0;

  // Group expenses by category
  const categorySpending = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = {
        total: 0,
        count: 0,
        expenses: []
      };
    }
    acc[expense.category].total += expense.amount;
    acc[expense.category].count += 1;
    acc[expense.category].expenses.push(expense);
    return acc;
  }, {});

  // Calculate category percentages
  Object.keys(categorySpending).forEach(category => {
    categorySpending[category].percentage = totalSpent > 0 
      ? (categorySpending[category].total / totalSpent) * 100 
      : 0;
    categorySpending[category].averageAmount = 
      categorySpending[category].total / categorySpending[category].count;
  });

  // Identify high-spending categories
  const highSpendingCategories = Object.entries(categorySpending)
    .filter(([_, data]) => data.percentage > 15)
    .sort((a, b) => b[1].total - a[1].total);

  // Identify frequent small expenses
  const smallFrequentExpenses = expenses
    .filter(expense => expense.amount < 50 && expense.amount > 5)
    .reduce((acc, expense) => {
      const key = `${expense.category}-${expense.name}`;
      if (!acc[key]) {
        acc[key] = {
          name: expense.name,
          category: expense.category,
          count: 0,
          totalAmount: 0,
          averageAmount: 0
        };
      }
      acc[key].count += 1;
      acc[key].totalAmount += expense.amount;
      acc[key].averageAmount = acc[key].totalAmount / acc[key].count;
      return acc;
    }, {});

  const frequentSmallExpenses = Object.values(smallFrequentExpenses)
    .filter(item => item.count >= 3)
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    totalSpent,
    budgetUsagePercentage,
    categorySpending,
    highSpendingCategories,
    frequentSmallExpenses,
    expenseCount: expenses.length,
    averageExpenseAmount: totalSpent / expenses.length || 0
  };
};

/**
 * Generate personalized savings suggestions based on analysis
 */
const generatePersonalizedSuggestions = (analysisData, expenses, budget) => {
  const suggestions = [];
  const { 
    budgetUsagePercentage, 
    categorySpending, 
    highSpendingCategories, 
    frequentSmallExpenses,
    totalSpent
  } = analysisData;

  // Budget management suggestions
  if (budgetUsagePercentage > 90) {
    suggestions.push({
      id: 'budget-overspending',
      type: 'urgent',
      category: 'Presupuesto',
      title: '🚨 Riesgo de Sobrepasar el Presupuesto',
      description: `Has gastado ${budgetUsagePercentage.toFixed(1)}% de tu presupuesto mensual. Es momento de reducir gastos no esenciales.`,
      actionItems: [
        'Revisa gastos pendientes y pospón los no urgentes',
        'Establece un límite diario para el resto del mes',
        'Considera aumentar tu presupuesto si es realista'
      ],
      potentialSavings: totalSpent * 0.1,
      priority: 'high',
      icon: '🚨'
    });
  } else if (budgetUsagePercentage > 75) {
    suggestions.push({
      id: 'budget-warning',
      type: 'warning',
      category: 'Presupuesto',
      title: '⚠️ Acercándote al Límite del Presupuesto',
      description: `Has usado ${budgetUsagePercentage.toFixed(1)}% de tu presupuesto. Mantén control en los próximos gastos.`,
      actionItems: [
        'Monitorea gastos diarios más de cerca',
        'Prioriza gastos esenciales',
        'Busca alternativas más económicas'
      ],
      potentialSavings: totalSpent * 0.05,
      priority: 'medium',
      icon: '⚠️'
    });
  }

  // High spending category suggestions
  highSpendingCategories.slice(0, 2).forEach(([category, data]) => {
    const categoryName = category;
    const suggestions_map = getCategorySuggestions(categoryName, data);
    if (suggestions_map) {
      suggestions.push({
        id: `category-${category.toLowerCase()}`,
        type: 'optimization',
        category: categoryName,
        title: `💡 Optimiza Gastos en ${categoryName}`,
        description: `${categoryName} representa ${data.percentage.toFixed(1)}% de tus gastos (S/${data.total.toFixed(2)}). Aquí hay formas de ahorrar:`,
        actionItems: suggestions_map.actionItems,
        potentialSavings: suggestions_map.potentialSavings,
        priority: data.percentage > 25 ? 'high' : 'medium',
        icon: getCategoryIcon(categoryName)
      });
    }
  });

  // Frequent small expenses suggestions
  if (frequentSmallExpenses.length > 0) {
    const topFrequentExpense = frequentSmallExpenses[0];
    suggestions.push({
      id: 'frequent-small-expenses',
      type: 'habit',
      category: 'Hábitos de Gasto',
      title: '🔄 Controla Gastos Pequeños Frecuentes',
      description: `Gastas frecuentemente en "${topFrequentExpense.name}" (${topFrequentExpense.count} veces, S/${topFrequentExpense.totalAmount.toFixed(2)} total). Pequeños cambios pueden generar grandes ahorros.`,
      actionItems: [
        `Reduce la frecuencia de "${topFrequentExpense.name}" a la mitad`,
        'Busca alternativas más económicas o caseras',
        'Establece un límite semanal para gastos pequeños',
        'Considera comprar en mayor cantidad para obtener descuentos'
      ],
      potentialSavings: topFrequentExpense.totalAmount * 0.3,
      priority: 'medium',
      icon: '🔄'
    });
  }

  // General savings strategies based on spending patterns
  if (totalSpent > 0) {
    // Emergency fund suggestion
    const hasAhorro = categorySpending['AHORRO'];
    if (!hasAhorro || hasAhorro.total < totalSpent * 0.1) {
      suggestions.push({
        id: 'emergency-fund',
        type: 'financial-health',
        category: 'Ahorro',
        title: '💰 Construye tu Fondo de Emergencia',
        description: 'No tienes suficientes ahorros registrados. Un fondo de emergencia es esencial para la estabilidad financiera.',
        actionItems: [
          'Destina al menos 10% de tus ingresos al ahorro',
          'Automatiza transferencias a una cuenta de ahorros',
          'Comienza con pequeñas cantidades si es necesario',
          'Considera el ahorro como un "gasto" obligatorio'
        ],
        potentialSavings: totalSpent * 0.1,
        priority: 'high',
        icon: '💰'
      });
    }

    // Subscription optimization
    const suscripciones = categorySpending['SUSCRIPCIONES'];
    if (suscripciones && suscripciones.total > 100) {
      suggestions.push({
        id: 'subscription-audit',
        type: 'optimization',
        category: 'Suscripciones',
        title: '📺 Audita tus Suscripciones',
        description: `Gastas S/${suscripciones.total.toFixed(2)} en suscripciones. Revisa cuáles realmente usas.`,
        actionItems: [
          'Lista todas tus suscripciones activas',
          'Cancela las que no uses frecuentemente',
          'Considera planes familiares para compartir costos',
          'Busca promociones o descuentos anuales'
        ],
        potentialSavings: suscripciones.total * 0.25,
        priority: 'medium',
        icon: '📺'
      });
    }
  }

  // Add general money-saving tips if we don't have enough personalized suggestions
  if (suggestions.length < 3) {
    suggestions.push(...getGeneralSavingsTips(analysisData));
  }

  // Sort suggestions by priority and potential savings
  return suggestions.sort((a, b) => {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return (b.potentialSavings || 0) - (a.potentialSavings || 0);
  });
};

/**
 * Get category-specific savings suggestions
 */
const getCategorySuggestions = (category, data) => {
  const suggestions = {
    'COMIDA': {
      actionItems: [
        'Planifica menús semanales para evitar compras impulsivas',
        'Cocina más en casa en lugar de comer fuera',
        'Compra ingredientes al por mayor',
        'Aprovecha ofertas y descuentos en supermercados'
      ],
      potentialSavings: data.total * 0.2
    },
    'ENTRETENIMIENTO': {
      actionItems: [
        'Busca actividades gratuitas como parques y eventos públicos',
        'Aprovecha descuentos en días específicos (ej: martes de cine)',
        'Considera suscripciones compartidas con familia/amigos',
        'Explora entretenimiento casero como juegos de mesa'
      ],
      potentialSavings: data.total * 0.25
    },
    'TRANSPORTE': {
      actionItems: [
        'Usa transporte público cuando sea posible',
        'Considera caminar o usar bicicleta para distancias cortas',
        'Comparte viajes con colegas o amigos',
        'Mantén tu vehículo en buen estado para mejor eficiencia'
      ],
      potentialSavings: data.total * 0.15
    },
    'SERVICIOS': {
      actionItems: [
        'Revisa y negocia tarifas de servicios básicos',
        'Considera cambiar a proveedores más económicos',
        'Implementa medidas de ahorro energético',
        'Agrupa servicios con el mismo proveedor para descuentos'
      ],
      potentialSavings: data.total * 0.1
    },
    'GASTOS VARIOS': {
      actionItems: [
        'Categoriza mejor estos gastos para identificar patrones',
        'Establece un límite mensual para gastos varios',
        'Pregúntate si cada compra es realmente necesaria',
        'Espera 24 horas antes de compras no planificadas'
      ],
      potentialSavings: data.total * 0.2
    }
  };

  return suggestions[category];
};

/**
 * Get category icon
 */
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
  return icons[category] || '💡';
};

/**
 * Get basic savings suggestions for users with no data
 */
const getBasicSavingsSuggestions = () => {
  return [
    {
      id: 'start-tracking',
      type: 'getting-started',
      category: 'Primeros Pasos',
      title: '📊 Comienza a Registrar tus Gastos',
      description: 'Para recibir sugerencias personalizadas, necesitas registrar tus gastos diarios.',
      actionItems: [
        'Registra todos tus gastos, incluso los pequeños',
        'Categoriza correctamente cada gasto',
        'Mantén un registro consistente durante al menos una semana',
        'Revisa tus patrones de gasto regularmente'
      ],
      potentialSavings: 0,
      priority: 'high',
      icon: '📊'
    },
    {
      id: 'set-budget',
      type: 'getting-started',
      category: 'Presupuesto',
      title: '🎯 Establece un Presupuesto Mensual',
      description: 'Un presupuesto te ayuda a controlar tus gastos y alcanzar tus metas financieras.',
      actionItems: [
        'Calcula tus ingresos mensuales netos',
        'Lista todos tus gastos fijos (renta, servicios, etc.)',
        'Asigna cantidades para gastos variables',
        'Incluye una categoría de ahorro (al menos 10%)'
      ],
      potentialSavings: 0,
      priority: 'high',
      icon: '🎯'
    }
  ];
};

/**
 * Get general money-saving tips
 */
const getGeneralSavingsTips = (analysisData) => {
  return [
    {
      id: 'price-comparison',
      type: 'general',
      category: 'Compras Inteligentes',
      title: '🔍 Compara Precios Antes de Comprar',
      description: 'Desarrolla el hábito de comparar precios para obtener las mejores ofertas.',
      actionItems: [
        'Usa aplicaciones de comparación de precios',
        'Revisa ofertas en diferentes tiendas',
        'Considera compras en línea vs. físicas',
        'Aprovecha cupones y códigos de descuento'
      ],
      potentialSavings: analysisData.totalSpent * 0.05,
      priority: 'low',
      icon: '🔍'
    },
    {
      id: 'bulk-buying',
      type: 'general',
      category: 'Estrategias de Compra',
      title: '📦 Compra al Por Mayor Productos No Perecederos',
      description: 'Comprar en cantidad puede reducir el costo por unidad de productos que usas regularmente.',
      actionItems: [
        'Identifica productos que usas frecuentemente',
        'Calcula el costo por unidad en diferentes tamaños',
        'Asegúrate de tener espacio de almacenamiento',
        'Comparte compras grandes con familia o amigos'
      ],
      potentialSavings: analysisData.totalSpent * 0.03,
      priority: 'low',
      icon: '📦'
    }
  ];
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
 * Get savings summary statistics
 */
export const getSavingsSummary = (suggestions) => {
  if (!suggestions || suggestions.length === 0) {
    return {
      totalSuggestions: 0,
      totalPotentialSavings: 0,
      highPrioritySuggestions: 0,
      categoriesAffected: 0
    };
  }

  const totalPotentialSavings = suggestions.reduce((sum, suggestion) => 
    sum + (suggestion.potentialSavings || 0), 0
  );
  
  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high').length;
  const categoriesAffected = new Set(suggestions.map(s => s.category)).size;

  return {
    totalSuggestions: suggestions.length,
    totalPotentialSavings,
    highPrioritySuggestions,
    categoriesAffected
  };
};

/**
 * Get priority color for UI
 */
export const getPriorityColor = (priority) => {
  const colors = {
    'high': '#ef4444',
    'medium': '#f59e0b',
    'low': '#10b981'
  };
  return colors[priority] || '#6b7280';
};

/**
 * Get suggestion type color for UI
 */
export const getSuggestionTypeColor = (type) => {
  const colors = {
    'urgent': '#dc2626',
    'warning': '#d97706',
    'optimization': '#059669',
    'habit': '#7c3aed',
    'financial-health': '#0891b2',
    'getting-started': '#4f46e5',
    'general': '#6b7280'
  };
  return colors[type] || '#6b7280';
};