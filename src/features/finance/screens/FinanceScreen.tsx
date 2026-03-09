import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useStore } from '../../../../src/store';
import { FinanceOverview } from './FinanceOverview';
import { FinanceTransactions } from './FinanceTransactions';
import { FinanceAnalytics } from './FinanceAnalytics';
import { FinanceCategories } from './FinanceCategories';

const FINANCE_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'categories', label: 'Categories' },
];

export function FinanceScreen() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { loadFinanceData } = useStore();

  useEffect(() => {
    loadFinanceData();
  }, []);

  const renderContent = () => {
    switch (selectedTab) {
      case 0:
        return <FinanceOverview />;
      case 1:
        return <FinanceTransactions />;
      case 2:
        return <FinanceAnalytics />;
      case 3:
        return <FinanceCategories />;
      default:
        return <FinanceOverview />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {FINANCE_TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === index && styles.activeTab]}
            onPress={() => setSelectedTab(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, selectedTab === index && styles.activeTabLabel]}>
              {tab.label}
            </Text>
            {selectedTab === index && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {},
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2.5,
    backgroundColor: '#007AFF',
    borderRadius: 1.25,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
});
