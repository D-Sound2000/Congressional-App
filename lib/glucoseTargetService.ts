import { supabase } from './supabase';

export interface GlucoseTargets {
  fasting: string;
  beforeMeal: string;
  afterMeal: string;
  bedtime: string;
}

export interface GlucoseTargetRanges {
  fasting: { min: number; max: number };
  beforeMeal: { min: number; max: number };
  afterMeal: { min: number; max: number };
  bedtime: { min: number; max: number };
}

export interface GlucoseStatus {
  status: 'low' | 'normal' | 'high' | 'very_high';
  color: string;
  message: string;
  recommendation: string;
}

// Enhanced glucose targets with actual numeric ranges
export const GLUCOSE_TARGET_RANGES: Record<string, GlucoseTargetRanges> = {
  type1: {
    fasting: { min: 80, max: 130 },
    beforeMeal: { min: 80, max: 130 },
    afterMeal: { min: 0, max: 180 },
    bedtime: { min: 90, max: 150 }
  },
  type2: {
    fasting: { min: 80, max: 130 },
    beforeMeal: { min: 80, max: 130 },
    afterMeal: { min: 0, max: 180 },
    bedtime: { min: 90, max: 150 }
  },
  gestational: {
    fasting: { min: 0, max: 95 },
    beforeMeal: { min: 0, max: 95 },
    afterMeal: { min: 0, max: 140 },
    bedtime: { min: 0, max: 120 }
  },
  prediabetes: {
    fasting: { min: 70, max: 100 },
    beforeMeal: { min: 70, max: 100 },
    afterMeal: { min: 0, max: 140 },
    bedtime: { min: 70, max: 100 }
  }
};

// Get glucose targets as strings for display
export const getGlucoseTargets = (diabetesType: string): GlucoseTargets => {
  const ranges = GLUCOSE_TARGET_RANGES[diabetesType] || GLUCOSE_TARGET_RANGES.type2;
  
  return {
    fasting: ranges.fasting.min === 0 ? `Less than ${ranges.fasting.max} mg/dL` : `${ranges.fasting.min}-${ranges.fasting.max} mg/dL`,
    beforeMeal: ranges.beforeMeal.min === 0 ? `Less than ${ranges.beforeMeal.max} mg/dL` : `${ranges.beforeMeal.min}-${ranges.beforeMeal.max} mg/dL`,
    afterMeal: ranges.afterMeal.min === 0 ? `Less than ${ranges.afterMeal.max} mg/dL` : `${ranges.afterMeal.min}-${ranges.afterMeal.max} mg/dL`,
    bedtime: ranges.bedtime.min === 0 ? `Less than ${ranges.bedtime.max} mg/dL` : `${ranges.bedtime.min}-${ranges.bedtime.max} mg/dL`
  };
};

// Get numeric ranges for calculations
export const getGlucoseTargetRanges = (diabetesType: string): GlucoseTargetRanges => {
  return GLUCOSE_TARGET_RANGES[diabetesType] || GLUCOSE_TARGET_RANGES.type2;
};

// Analyze glucose level and provide status
export const analyzeGlucoseLevel = (glucoseValue: number, diabetesType: string, context: 'fasting' | 'beforeMeal' | 'afterMeal' | 'bedtime'): GlucoseStatus => {
  const ranges = getGlucoseTargetRanges(diabetesType);
  const targetRange = ranges[context];
  
  if (glucoseValue < targetRange.min) {
    return {
      status: 'low',
      color: '#f44336',
      message: 'Low Blood Sugar',
      recommendation: getLowGlucoseRecommendation(glucoseValue, context)
    };
  } else if (glucoseValue <= targetRange.max) {
    return {
      status: 'normal',
      color: '#4caf50',
      message: 'In Target Range',
      recommendation: getNormalGlucoseRecommendation(context, diabetesType)
    };
  } else if (glucoseValue <= targetRange.max + 50) {
    return {
      status: 'high',
      color: '#ff9800',
      message: 'Above Target',
      recommendation: getHighGlucoseRecommendation(glucoseValue, context, diabetesType)
    };
  } else {
    return {
      status: 'very_high',
      color: '#d32f2f',
      message: 'Very High',
      recommendation: getVeryHighGlucoseRecommendation(glucoseValue, context, diabetesType)
    };
  }
};

// Specific recommendations for low glucose
const getLowGlucoseRecommendation = (glucoseValue: number, context: string): string => {
  if (glucoseValue < 70) {
    return 'Eat 15g fast-acting carbs (4 glucose tablets, 4oz juice, or 1 tbsp honey). Recheck in 15 minutes. If still low, repeat.';
  } else if (glucoseValue < 80) {
    return 'Eat a small snack with 15g carbs (1 small apple or 6 crackers). Monitor for 30 minutes.';
  }
  return 'Your glucose is slightly below target. Consider a light snack if you feel symptoms.';
};

// Specific recommendations for normal glucose
const getNormalGlucoseRecommendation = (context: string, diabetesType: string): string => {
  switch (context) {
    case 'fasting':
      return 'Excellent fasting glucose! Continue your current morning routine and medication timing.';
    case 'beforeMeal':
      return 'Perfect pre-meal reading! You can proceed with your planned meal.';
    case 'afterMeal':
      return 'Great post-meal control! Your meal timing and portions are working well.';
    case 'bedtime':
      return 'Good bedtime glucose! You\'re well-positioned for a stable night.';
    default:
      return 'Keep up your excellent glucose management!';
  }
};

// Specific recommendations for high glucose
const getHighGlucoseRecommendation = (glucoseValue: number, context: string, diabetesType: string): string => {
  const baseRecommendations = [];
  
  if (context === 'fasting') {
    baseRecommendations.push('Consider checking your evening snack timing and portion size.');
    if (diabetesType === 'type1') {
      baseRecommendations.push('Review your basal insulin dose with your doctor.');
    }
  } else if (context === 'beforeMeal') {
    baseRecommendations.push('Consider reducing your meal portion or choosing lower-carb options.');
    baseRecommendations.push('Take a 10-15 minute walk before eating to help lower glucose.');
  } else if (context === 'afterMeal') {
    baseRecommendations.push('Take a 20-30 minute walk to help lower your glucose naturally.');
    baseRecommendations.push('Consider reducing carbs in your next meal.');
  } else if (context === 'bedtime') {
    baseRecommendations.push('Avoid late-night snacks and consider light exercise before bed.');
  }
  
  if (diabetesType === 'type1') {
    baseRecommendations.push('Check if you need a correction dose of rapid-acting insulin.');
  } else if (diabetesType === 'type2') {
    baseRecommendations.push('Consider your medication timing - take with meals if not already doing so.');
  }
  
  return baseRecommendations.join(' ');
};

// Specific recommendations for very high glucose
const getVeryHighGlucoseRecommendation = (glucoseValue: number, context: string, diabetesType: string): string => {
  const recommendations = [];
  
  if (glucoseValue > 300) {
    recommendations.push('Check for ketones immediately if you have Type 1 diabetes.');
    recommendations.push('Drink plenty of water to stay hydrated.');
  }
  
  if (context === 'fasting') {
    recommendations.push('This high fasting glucose suggests reviewing your evening routine and medication.');
  } else if (context === 'afterMeal') {
    recommendations.push('Consider the meal composition - was it high in refined carbs or large portions?');
  }
  
  if (diabetesType === 'type1') {
    recommendations.push('Check your insulin pump or injection site for issues.');
    recommendations.push('Consider a correction dose and monitor closely for the next 2 hours.');
  } else {
    recommendations.push('Review your medication adherence and timing.');
  }
  
  recommendations.push('If this pattern continues, contact your healthcare provider within 24 hours.');
  
  return recommendations.join(' ');
};

// Get recent glucose logs for trend analysis
export const getRecentGlucoseLogs = async (days: number = 7): Promise<any[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('glucose_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching glucose logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRecentGlucoseLogs:', error);
    return [];
  }
};

// Get glucose trend analysis
export const getGlucoseTrend = async (diabetesType: string): Promise<{
  average: number;
  trend: 'improving' | 'stable' | 'worsening';
  recommendations: string[];
}> => {
  const logs = await getRecentGlucoseLogs(7);
  
  if (logs.length === 0) {
    return {
      average: 0,
      trend: 'stable',
      recommendations: ['Start logging your glucose levels to get personalized insights.']
    };
  }

  const values = logs.map(log => log.glucose_value);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Simple trend analysis - compare first half vs second half of logs
  const midPoint = Math.floor(logs.length / 2);
  const firstHalf = values.slice(0, midPoint);
  const secondHalf = values.slice(midPoint);
  
  const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  let trend: 'improving' | 'stable' | 'worsening' = 'stable';
  if (secondHalfAvg < firstHalfAvg - 10) trend = 'improving';
  else if (secondHalfAvg > firstHalfAvg + 10) trend = 'worsening';
  
  const ranges = getGlucoseTargetRanges(diabetesType);
  const recommendations: string[] = [];
  
  // Average-based recommendations
  if (average < ranges.fasting.min) {
    recommendations.push('Your 7-day average is below target. Consider reducing medication doses or adding snacks between meals.');
  } else if (average > ranges.fasting.max + 20) {
    recommendations.push('Your 7-day average is significantly above target. Focus on consistent meal timing, portion control, and regular exercise.');
  } else if (average > ranges.fasting.max) {
    recommendations.push('Your 7-day average is slightly above target. Try reducing portion sizes and increasing physical activity.');
  }
  
  // Trend-based recommendations
  if (trend === 'worsening') {
    recommendations.push('Your glucose trend is worsening. Review your recent meal choices and consider adjusting your medication timing.');
    recommendations.push('Track your food intake more carefully to identify patterns that may be causing higher readings.');
  } else if (trend === 'improving') {
    recommendations.push('Excellent! Your glucose control is improving. Keep up your current routine.');
  } else {
    recommendations.push('Your glucose levels are stable. Continue monitoring and maintain your current management plan.');
  }
  
  // Specific actionable recommendations based on diabetes type
  if (diabetesType === 'type1') {
    recommendations.push('Consider reviewing your insulin-to-carb ratios and correction factors with your diabetes team.');
  } else if (diabetesType === 'type2') {
    recommendations.push('Focus on consistent meal timing and consider the glycemic index of your food choices.');
  } else if (diabetesType === 'gestational') {
    recommendations.push('Maintain regular meal timing and consider smaller, more frequent meals throughout the day.');
  }
  
  return {
    average: Math.round(average),
    trend,
    recommendations
  };
};
