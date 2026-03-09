import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../../../../src/store';
import { Account, Transaction } from '../../../../src/types';

export function FinanceDashboard() {
  const { financeSummary, transactions, accounts } = useStore();

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.balanceCard, { backgroundColor: '#007AFF' }]}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(financeSummary.totalBalance)}</Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Income</Text>
            <Text style={[styles.balanceItemAmount, { color: '#34C759' }]}>
              +{formatCurrency(financeSummary.totalIncome)}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Expenses</Text>
            <Text style={[styles.balanceItemAmount, { color: '#FF3B30' }]}>
              -{formatCurrency(financeSummary.totalExpenses)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accounts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {accounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={[styles.accountIcon, { backgroundColor: account.color }]}>
                <Text style={styles.accountIconText}>{account.name.charAt(0)}</Text>
              </View>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountBalance}>
                {formatCurrency(account.balance)}
              </Text>
            </View>
          ))}
          {accounts.length === 0 && (
            <View style={styles.addAccountCard}>
              <Text style={styles.addAccountText}>+ Add Account</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionsList}>
          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionCategory}>
                  {transaction.category}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'income' ? '#34C759' : '#FF3B30' }
              ]}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))}
          {recentTransactions.length === 0 && (
            <Text style={styles.emptyText}>No transactions yet</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expenses by Category</Text>
        <View style={styles.categoryChart}>
          {financeSummary.expensesByCategory.slice(0, 5).map((item, index) => (
            <View key={item.category} style={styles.categoryItem}>
              <View style={styles.categoryLabelRow}>
                <Text style={styles.categoryName}>
                  {item.category}
                </Text>
                <Text style={styles.categoryAmount}>{formatCurrency(item.total)}</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(item.total / (financeSummary.totalExpenses || 1)) * 100}%`,
                      backgroundColor: ['#FF9500', '#5856D6', '#FF2D55', '#34C759', '#007AFF'][index % 5]
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  balanceItemAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  accountCard: {
    width: 140,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountIconText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  addAccountCard: {
    width: 140,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addAccountText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryChart: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFF',
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    padding: 20,
  },
});
