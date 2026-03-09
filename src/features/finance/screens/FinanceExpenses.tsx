import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { useStore } from '../../../../src/store';
import { useColorScheme } from '../../../../hooks/use-color-scheme';
import { Transaction, TransactionCategory } from '../../../../src/types';

const EXPENSE_CATEGORIES: TransactionCategory[] = ['food', 'transport', 'housing', 'entertainment', 'healthcare', 'education', 'shopping', 'utilities', 'other_expense'];

export function FinanceExpenses() {
  const { transactions, accounts, addTransaction, removeTransaction } = useStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showAddModal, setShowAddModal] = useState(false);

  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleDelete = (id: string) => {
    removeTransaction(id);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.summaryCard, { backgroundColor: '#FF3B30' }]}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalExpenses)}</Text>
        <Text style={styles.summaryCount}>{expenseTransactions.length} transactions</Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>+ Add Expense</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list}>
        {expenseTransactions.map((transaction) => (
          <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.transactionInfo}>
              <Text style={[styles.transactionCategory, { color: isDark ? '#FFF' : '#000' }]}>
                {transaction.category.replace('_', ' ')}
              </Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[styles.transactionAmount, { color: '#FF3B30' }]}>
                -{formatCurrency(transaction.amount)}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(transaction.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {expenseTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No expenses yet</Text>
          </View>
        )}
      </ScrollView>

      <ExpenseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        accounts={accounts}
        onSave={(data) => {
          addTransaction(data);
          setShowAddModal(false);
        }}
      />
    </View>
  );
}

function ExpenseModal({ visible, onClose, accounts, onSave }: {
  visible: boolean;
  onClose: () => void;
  accounts: any[];
  onSave: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!amount || !accountId) return;
    onSave({
      amount: parseFloat(amount),
      type: 'expense',
      category,
      description,
      accountId,
      date,
    });
    setAmount('');
    setDescription('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
          <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>Add Expense</Text>

          <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }]}
          />

          <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
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

          <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Account</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountSelector}>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[styles.accountOption, accountId === acc.id && styles.accountOptionActive]}
                onPress={() => setAccountId(acc.id)}
              >
                <Text style={[styles.accountOptionText, accountId === acc.id && styles.accountOptionTextActive]}>
                  {acc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Optional"
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }]}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  summaryCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  summaryAmount: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
  summaryCount: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  addButton: { backgroundColor: '#FF3B30', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  list: { flex: 1 },
  transactionCard: { borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transactionInfo: { flex: 1 },
  transactionCategory: { fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
  transactionDate: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 18, fontWeight: '700' },
  deleteText: { color: '#FF3B30', fontSize: 12, marginTop: 4 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#8E8E93' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 12 },
  input: { fontSize: 16, padding: 12, borderRadius: 8 },
  categorySelector: { flexDirection: 'row', marginBottom: 8 },
  categoryOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F2F2F7', marginRight: 8 },
  categoryOptionActive: { backgroundColor: '#FF3B30' },
  categoryOptionText: { fontSize: 12, color: '#8E8E93', textTransform: 'capitalize' },
  categoryOptionTextActive: { color: '#FFF' },
  accountSelector: { flexDirection: 'row', marginBottom: 8 },
  accountOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F2F2F7', marginRight: 8 },
  accountOptionActive: { backgroundColor: '#007AFF' },
  accountOptionText: { fontSize: 12, color: '#8E8E93' },
  accountOptionTextActive: { color: '#FFF' },
  modalActions: { flexDirection: 'row', marginTop: 24 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#F2F2F7', marginRight: 8 },
  cancelButtonText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#8E8E93' },
  saveButton: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#FF3B30', marginLeft: 8 },
  saveButtonText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#FFF' },
});
