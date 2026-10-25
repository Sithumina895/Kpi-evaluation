import { BSCCategory, CategoryScore, EvaluationItem, GradeBand } from '../types';

export const BSC_WEIGHTS: Record<BSCCategory, number> = {
  financial: 20,
  customer: 20,
  internal_process: 25,
  learning_growth: 15,
  individual_performance: 20,
};

export const DEFAULT_GRADE_BANDS: GradeBand[] = [
  {
    id: 'outstanding',
    name: 'Outstanding',
    minScore: 90,
    maxScore: 100,
    colour: '#10B981', // Emerald
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    description: 'Consistently exceeds all performance targets and exemplifies excellence',
  },
  {
    id: 'exceeds',
    name: 'Exceeds Expectations',
    minScore: 80,
    maxScore: 89.99,
    colour: '#14B8A6', // Teal
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    description: 'Frequently surpasses objectives and shows high capability',
  },
  {
    id: 'meets',
    name: 'Meets Expectations',
    minScore: 70,
    maxScore: 79.99,
    colour: '#3B82F6', // Blue
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    description: 'Fully satisfies performance standards and role requirements',
  },
  {
    id: 'needs_improvement',
    name: 'Needs Improvement',
    minScore: 60,
    maxScore: 69.99,
    colour: '#F59E0B', // Amber
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    description: 'Partially meets expectations; requires targeted development',
  },
  {
    id: 'unsatisfactory',
    name: 'Unsatisfactory',
    minScore: 0,
    maxScore: 59.99,
    colour: '#EF4444', // Red
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    description: 'Fails to meet minimum acceptable performance standards',
  },
];

export interface ScoringResult {
  categoryScores: Record<BSCCategory, CategoryScore>;
  finalScore: number;
  grade: string;
  gradeBand: GradeBand;
}

/**
 * Pure, unit-testable score calculator for Nawaloka Balanced Scorecard KPI evaluations.
 *
 * Formula:
 * For each category:
 *   avgRating = sum(ratings in category) / count(ratings in category) (or 0 if empty)
 *   categoryScore = (avgRating / 5) * categoryWeight
 * Final score = sum of all 5 category scores (rounded to 2 decimal places)
 */
export function calculateEvaluationScore(
  items: EvaluationItem[],
  customGradeBands: GradeBand[] = DEFAULT_GRADE_BANDS
): ScoringResult {
  const categories: BSCCategory[] = [
    'financial',
    'customer',
    'internal_process',
    'learning_growth',
    'individual_performance',
  ];

  const categoryScores = {} as Record<BSCCategory, CategoryScore>;
  let totalScore = 0;

  for (const cat of categories) {
    const catItems = items.filter((item) => item.bscCategory === cat);
    const weight = BSC_WEIGHTS[cat];

    if (catItems.length === 0) {
      categoryScores[cat] = {
        category: cat,
        weight,
        avgRating: 0,
        score: 0,
      };
    } else {
      const sumRatings = catItems.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
      const avgRating = sumRatings / catItems.length;
      // Category score = (average rating / 5) * weight
      const score = (avgRating / 5) * weight;
      const roundedScore = Math.round(score * 100) / 100;

      categoryScores[cat] = {
        category: cat,
        weight,
        avgRating: Math.round(avgRating * 100) / 100,
        score: roundedScore,
      };
      totalScore += roundedScore;
    }
  }

  const roundedFinalScore = Math.min(100, Math.max(0, Math.round(totalScore * 100) / 100));

  // Determine grade based on bands
  const matchedBand =
    customGradeBands.find(
      (band) => roundedFinalScore >= band.minScore && roundedFinalScore <= band.maxScore
    ) ||
    customGradeBands[customGradeBands.length - 1] ||
    DEFAULT_GRADE_BANDS[DEFAULT_GRADE_BANDS.length - 1];

  return {
    categoryScores,
    finalScore: roundedFinalScore,
    grade: matchedBand.name,
    gradeBand: matchedBand,
  };
}

export const BSC_CATEGORY_CONFIG: Record<
  BSCCategory,
  {
    label: string;
    weight: number;
    focus: string;
    colour: string;
    tailwindBg: string;
    tailwindText: string;
    tailwindBorder: string;
    lightBg: string;
  }
> = {
  financial: {
    label: 'Financial',
    weight: 20,
    focus: 'H3 carbon & cost objectives',
    colour: '#E8821E', // Orange
    tailwindBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    tailwindText: 'text-amber-700 dark:text-amber-300',
    tailwindBorder: 'border-amber-500/30',
    lightBg: '#FFF7ED',
  },
  customer: {
    label: 'Customer',
    weight: 20,
    focus: 'Patient & client experience',
    colour: '#1A9BB0', // Teal
    tailwindBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    tailwindText: 'text-teal-700 dark:text-teal-300',
    tailwindBorder: 'border-teal-500/30',
    lightBg: '#F0FDFA',
  },
  internal_process: {
    label: 'Internal Process',
    weight: 25,
    focus: 'H1 ESG & H2 digital objectives',
    colour: '#2F5FAF', // Blue
    tailwindBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    tailwindText: 'text-blue-700 dark:text-blue-300',
    tailwindBorder: 'border-blue-500/30',
    lightBg: '#EFF6FF',
  },
  learning_growth: {
    label: 'Learning & Growth',
    weight: 15,
    focus: 'People & capability objectives',
    colour: '#2E9E5B', // Green
    tailwindBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    tailwindText: 'text-emerald-700 dark:text-emerald-300',
    tailwindBorder: 'border-emerald-500/30',
    lightBg: '#ECFDF5',
  },
  individual_performance: {
    label: 'Individual Performance',
    weight: 20,
    focus: 'Personal contribution & conduct',
    colour: '#6B3FA0', // Purple
    tailwindBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    tailwindText: 'text-purple-700 dark:text-purple-300',
    tailwindBorder: 'border-purple-500/30',
    lightBg: '#FAF5FF',
  },
};
