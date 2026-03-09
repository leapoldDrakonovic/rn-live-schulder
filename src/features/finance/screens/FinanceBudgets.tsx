import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { useStore } from '../../../../src/store';
import { useColorScheme } from '../../../../hooks/use-color-scheme';
import { Budget, TransactionCategory } from '../../../../src/types';
import dayjs from 'dayjs';

const EXPENSE_CATEGORIES: TransactionCategory[] = ['food', 'transport', 'housing', 'entertainment', 'healthcare', 'education', 'shopping', 'utilities', 'other_expense'];

export function FinanceBudgets() {
  const { budgets, transactions, addBudget, removeBudget } = useStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showAddModal, setShowAddModal] = useState(false);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const currentMonth = dayjs().format('YYYY-MM');
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);

  const getSpentAmount = (category: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>+ Add Budget</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>
        {dayjs().format('MMMM YYYY')}
      </Text>

      <ScrollView style={styles.list}>
        {currentMonthBudgets.map((budget) => {
          const spent = getSpentAmount(budget.category);
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const isOverBudget = percentage > 100;
          
          return (
            <View key={budget.id} style={[styles.budgetCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
              <View style={styles.budgetHeader}>
                <Text style={[styles.budgetCategory, { color: isDark ? '#FFF' : '#000' }]}>
                  {budget.category.replace('_', ' ')}
                </Text>
                <TouchableOpacity onPress={() => removeBudget(budget.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.budgetProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: isOverBudget ? '#FF3B30' : '#007AFF'
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.budgetAmount, { color: isOverBudget ? '#FF3B30' : '#8E8E93' }]}>
                  {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                </Text>
              </View>
              <Text style={styles.budgetPercentage}>
                {percentage.toFixed(0)}% used
              </Text>
            </View>
          );
        })}
        {currentMonthBudgets.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No budgets set for this month</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>Add Budget</Text>
            
            <BudgetForm
              onSave={(data) => {
                addBudget({ ...data, month: currentMonth, spent: 0 });
                setShowAddModal(false);
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function BudgetForm({ onSave, onCancel }: { onSave: (data: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => void; onCancel: () => void }) {
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [amount, setAmount] = useState('');
  const currentMonth = dayjs().format('YYYY-MM');

  const handleSave = () => {
    onSave({ category, amount: parseFloat(amount) || 0, month: currentMonth });
  };

  return (
    <>
      <Text style={{ color: '#8E8E93', fontSize: 14, marginBottom: 8 }}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {EXPENSE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryOption, category === cat && styles.categoryOptionActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryOptionText, category === cat && styles.categoryOptionTextActive]}>
              {cat.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={{ color: '#8E8E93', fontSize: 14, marginBottom: 8 }}>Budget Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="numeric"
        style={{ backgroundColor: '#F2F2F7', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 24 }}
      />

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#F2F2F7', marginRight: 8 }} onPress={onCancel}>
          <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#8E8E93' }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#007AFF', marginLeft: 8 }}
          onPress={handleSave}
        >
          <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#FFF' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  list: { flex: 1 },
  budgetCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  budgetCategory: { fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
  deleteText: { color: '#FF3B30', fontSize: 14 },
  budgetProgress: { marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#E5E5EA', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 4 },
  budgetAmount: { fontSize: 14 },
  budgetPercentage: { fontSize: 12, color: '#8E8E93' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#8E8E93' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  categoryOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F2F2F7', marginRight: 8 },
  categoryOptionActive: { backgroundColor: '#007AFF' },
  categoryOptionText: { fontSize: 14, color: '#8E8E93', textTransform: 'capitalize' },
  categoryOptionTextActive: { color: '#FFF' },
});
