import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { useStore } from '../../../../src/store';
import { useColorScheme } from '../../../../hooks/use-color-scheme';
import { Transaction, TransactionCategory, TransactionType } from '../../../../src/types';

const EXPENSE_CATEGORIES: TransactionCategory[] = ['food', 'transport', 'housing', 'entertainment', 'healthcare', 'education', 'shopping', 'utilities', 'other_expense'];
const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'investment', 'gift', 'other_income'];

export function FinanceTransactions() {
  const { transactions, accounts, addTransaction, removeTransaction } = useStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, filterType === type && styles.filterButtonActive]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[styles.filterText, filterType === type && styles.filterTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>+ Add Transaction</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list}>
        {filteredTransactions.map((transaction) => (
          <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.transactionHeader}>
              <View>
                <Text style={[styles.transactionCategory, { color: isDark ? '#FFF' : '#000' }]}>
                  {transaction.category.replace('_', ' ')}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, { color: transaction.type === 'income' ? '#34C759' : '#FF3B30' }]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
                <TouchableOpacity onPress={() => removeTransaction(transaction.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {transaction.description ? (
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
            ) : null}
          </View>
        ))}
        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </ScrollView>

      <TransactionModal
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

function TransactionModal({ visible, onClose, accounts, onSave }: {
  visible: boolean;
  onClose: () => void;
  accounts: any[];
  onSave: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = () => {
    if (!amount || !accountId) return;
    onSave({
      amount: parseFloat(amount),
      type,
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
          <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>Add Transaction</Text>

          <View style={styles.typeSelector}>
            <TouchableOpacity style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]} onPress={() => { setType('expense'); setCategory('food'); }}>
              <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeButton, type === 'income' && styles.typeButtonActive]} onPress={() => { setType('income'); setCategory('salary'); }}>
              <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>Income</Text>
            </TouchableOpacity>
          </View>

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
            {categories.map((cat) => (
              <TouchableOpacity key={cat} style={[styles.categoryOption, category === cat && styles.categoryOptionActive]} onPress={() => setCategory(cat)}>
                <Text style={[styles.categoryOptionText, category === cat && styles.categoryOptionTextActive]}>{cat.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Account</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountSelector}>
            {accounts.map((acc) => (
              <TouchableOpacity key={acc.id} style={[styles.accountOption, accountId === acc.id && styles.accountOptionActive]} onPress={() => setAccountId(acc.id)}>
                <Text style={[styles.accountOptionText, accountId === acc.id && styles.accountOptionTextActive]}>{acc.name}</Text>
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
  filterRow: { flexDirection: 'row', marginBottom: 16 },
  filterButton: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#F2F2F7', marginRight: 8, alignItems: 'center' },
  filterButtonActive: { backgroundColor: '#007AFF' },
  filterText: { fontSize: 14, fontWeight: '500', color: '#8E8E93' },
  filterTextActive: { color: '#FFF' },
  addButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  list: { flex: 1 },
  transactionCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  transactionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  transactionCategory: { fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
  transactionDate: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 18, fontWeight: '700' },
  deleteText: { color: '#FF3B30', fontSize: 12, marginTop: 4 },
  transactionDescription: { fontSize: 14, color: '#8E8E93', marginTop: 8 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#8E8E93' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  typeSelector: { flexDirection: 'row', marginBottom: 16 },
  typeButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#F2F2F7', marginRight: 8, alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#007AFF' },
  typeButtonText: { fontSize: 16, fontWeight: '600', color: '#8E8E93' },
  typeButtonTextActive: { color: '#FFF' },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 12 },
  input: { fontSize: 16, padding: 12, borderRadius: 8 },
  categorySelector: { flexDirection: 'row' },
  categoryOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F2F2F7', marginRight: 8 },
  categoryOptionActive: { backgroundColor: '#007AFF' },
  categoryOptionText: { fontSize: 12, color: '#8E8E93', textTransform: 'capitalize' },
  categoryOptionTextActive: { color: '#FFF' },
  accountSelector: { flexDirection: 'row' },
  accountOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F2F2F7', marginRight: 8 },
  accountOptionActive: { backgroundColor: '#34C759' },
  accountOptionText: { fontSize: 12, color: '#8E8E93' },
  accountOptionTextActive: { color: '#FFF' },
  modalActions: { flexDirection: 'row', marginTop: 24 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#F2F2F7', marginRight: 8 },
  cancelButtonText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#8E8E93' },
  saveButton: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#007AFF', marginLeft: 8 },
  saveButtonText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#FFF' },
});
