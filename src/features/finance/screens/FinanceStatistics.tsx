import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../../../../src/store';
import { useColorScheme } from '../../../../hooks/use-color-scheme';

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

export function FinanceStatistics() {
  const { financeSummary, transactions } = useStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const total = financeSummary.totalIncome + financeSummary.totalExpenses;
  const savings = financeSummary.totalIncome - financeSummary.totalExpenses;
  const savingsRate = financeSummary.totalIncome > 0 ? (savings / financeSummary.totalIncome) * 100 : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : '#000' }]}>Income vs Expenses</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: '#34C759' }]}>{formatCurrency(financeSummary.totalIncome)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>{formatCurrency(financeSummary.totalExpenses)}</Text>
          </View>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.incomeBar, { flex: financeSummary.totalIncome || 0.5 }]} />
          <View style={[styles.expenseBar, { flex: financeSummary.totalExpenses || 0.5 }]} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : '#000' }]}>Savings</Text>
        <Text style={[styles.savingsAmount, { color: savings >= 0 ? '#34C759' : '#FF3B30' }]}>
          {formatCurrency(savings)}
        </Text>
        <Text style={styles.savingsRate}>
          {savingsRate.toFixed(1)}% savings rate
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : '#000' }]}>Expenses by Category</Text>
        {financeSummary.expensesByCategory.map((item, index) => {
          const percentage = financeSummary.totalExpenses > 0 
            ? (item.total / financeSummary.totalExpenses) * 100 
            : 0;
          return (
            <View key={item.category} style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[item.category] || '#8E8E93' }]} />
              <Text style={[styles.categoryName, { color: isDark ? '#FFF' : '#000' }]}>
                {item.category.replace('_', ' ')}
              </Text>
              <Text style={styles.categoryAmount}>{formatCurrency(item.total)}</Text>
              <Text style={styles.categoryPercent}>{percentage.toFixed(1)}%</Text>
            </View>
          );
        })}
        {financeSummary.expensesByCategory.length === 0 && (
          <Text style={styles.emptyText}>No expense data</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 12, color: '#8E8E93' },
  summaryValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  barContainer: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  incomeBar: { backgroundColor: '#34C759' },
  expenseBar: { backgroundColor: '#FF3B30' },
  savingsAmount: { fontSize: 32, fontWeight: 'bold' },
  savingsRate: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  categoryDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  categoryName: { flex: 1, fontSize: 14, textTransform: 'capitalize' },
  categoryAmount: { fontSize: 14, fontWeight: '500', marginRight: 8 },
  categoryPercent: { fontSize: 12, color: '#8E8E93', width: 50, textAlign: 'right' },
  emptyText: { textAlign: 'center', color: '#8E8E93', padding: 20 },
});
