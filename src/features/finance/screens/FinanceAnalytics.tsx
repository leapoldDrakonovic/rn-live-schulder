import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../../../../src/store';

const CATEGORY_COLORS: Record<string, string> = {
  food: '#FF9500',
  transport: '#5856D6',
  housing: '#34C759',
  entertainment: '#FF2D55',
  healthcare: '#FF3B30',
  education: '#007AFF',
  shopping: '#AF52DE',
  utilities: '#00C7BE',
  other_expense: '#8E8E93',
  other: '#8E8E93',
};

export function FinanceAnalytics() {
  const { financeSummary } = useStore();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

  const total = financeSummary.totalIncome + financeSummary.totalExpenses;
  const savings = financeSummary.totalIncome - financeSummary.totalExpenses;
  const savingsRate = financeSummary.totalIncome > 0 ? (savings / financeSummary.totalIncome) * 100 : 0;

  const incomePercentage = total > 0 ? (financeSummary.totalIncome / total) * 100 : 50;
  const expensePercentage = total > 0 ? (financeSummary.totalExpenses / total) * 100 : 50;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Income vs Expenses</Text>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryBadge, { backgroundColor: '#34C75920' }]}>
              <Text style={[styles.summaryBadgeText, { color: '#34C759' }]}>Income</Text>
            </View>
            <Text style={styles.summaryValue}>{formatCurrency(financeSummary.totalIncome)}</Text>
            <Text style={styles.summaryPercent}>{incomePercentage.toFixed(0)}%</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryBadge, { backgroundColor: '#FF3B3020' }]}>
              <Text style={[styles.summaryBadgeText, { color: '#FF3B30' }]}>Expenses</Text>
            </View>
            <Text style={styles.summaryValue}>{formatCurrency(financeSummary.totalExpenses)}</Text>
            <Text style={styles.summaryPercent}>{expensePercentage.toFixed(0)}%</Text>
          </View>
        </View>

        <View style={styles.barContainer}>
          <View style={[styles.incomeBar, { flex: incomePercentage || 0.5 }]} />
          <View style={[styles.expenseBar, { flex: expensePercentage || 0.5 }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Savings</Text>
        
        <View style={styles.savingsContent}>
          <Text style={[styles.savingsAmount, { color: savings >= 0 ? '#34C759' : '#FF3B30' }]}>
            {formatCurrency(savings)}
          </Text>
          <View style={styles.savingsRateContainer}>
            <Text style={styles.savingsRateLabel}>Savings Rate</Text>
            <Text style={[styles.savingsRateValue, { color: savingsRate >= 20 ? '#34C759' : savingsRate >= 0 ? '#FF9500' : '#FF3B30' }]}>
              {savingsRate.toFixed(1)}%
            </Text>
          </View>
          <Text style={styles.savingsHint}>
            {savingsRate >= 20 ? 'Great job! Saving 20%+ of income.' : savingsRate >= 0 ? 'Try to save at least 20% of income.' : 'Your expenses exceed your income.'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Expenses by Category</Text>
        
        {financeSummary.expensesByCategory.length > 0 ? (
          <View style={styles.categoryList}>
            {financeSummary.expensesByCategory.map((item, index) => {
              const percentage = financeSummary.totalExpenses > 0 
                ? (item.total / financeSummary.totalExpenses) * 100 
                : 0;
              
              return (
                <View key={item.category} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[item.category] || '#8E8E93' }]} />
                    <Text style={styles.categoryName}>{item.category.replace('_', ' ')}</Text>
                  </View>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryAmount}>{formatCurrency(item.total)}</Text>
                    <Text style={styles.categoryPercent}>{percentage.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${percentage}%`,
                          backgroundColor: CATEGORY_COLORS[item.category] || '#8E8E93'
                        }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No expense data</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  summaryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  summaryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  summaryPercent: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  barContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
  },
  incomeBar: {
    backgroundColor: '#34C759',
  },
  expenseBar: {
    backgroundColor: '#FF3B30',
  },
  savingsContent: {
    alignItems: 'center',
  },
  savingsAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  savingsRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  savingsRateLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  savingsRateValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  savingsHint: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryList: {},
  categoryRow: {
    marginBottom: 14,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 15,
    color: '#000000',
    textTransform: 'capitalize',
    flex: 1,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginRight: 8,
  },
  categoryPercent: {
    fontSize: 13,
    color: '#8E8E93',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
  },
});
