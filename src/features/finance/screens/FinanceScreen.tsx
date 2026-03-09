import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useStore } from '../../../../src/store';
import { SegmentedControl } from '../components/SegmentedControl';
import { FinanceDashboard } from './FinanceDashboard';
import { FinanceAccounts } from './FinanceAccounts';
import { FinanceTransactions } from './FinanceTransactions';
import { FinanceIncome } from './FinanceIncome';
import { FinanceExpenses } from './FinanceExpenses';
import { FinanceCategories } from './FinanceCategories';
import { FinanceStatistics } from './FinanceStatistics';
import { FinanceBudgets } from './FinanceBudgets';

const FINANCE_TABS = ['Dashboard', 'Accounts', 'Transactions', 'Income', 'Expenses', 'Categories', 'Stats', 'Budgets'];

export function FinanceScreen() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { loadFinanceData, accounts, transactions } = useStore();

  useEffect(() => {
    loadFinanceData();
  }, []);

  const renderContent = () => {
    switch (selectedTab) {
      case 0:
        return <FinanceDashboard />;
      case 1:
        return <FinanceAccounts />;
      case 2:
        return <FinanceTransactions />;
      case 3:
        return <FinanceIncome />;
      case 4:
        return <FinanceExpenses />;
      case 5:
        return <FinanceCategories />;
      case 6:
        return <FinanceStatistics />;
      case 7:
        return <FinanceBudgets />;
      default:
        return <FinanceDashboard />;
    }
  };

  return (
    <View style={styles.container}>
      <SegmentedControl
        segments={FINANCE_TABS}
        selectedIndex={selectedTab}
        onChange={setSelectedTab}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
  },
});
