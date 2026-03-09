import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { useStore } from '../../../../src/store';
import { useColorScheme } from '../../../../hooks/use-color-scheme';
import { Transaction, TransactionCategory } from '../../../../src/types';

const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'investment', 'gift', 'other_income'];
const RSD_TO_USD_RATE = 96;

type Currency = 'USD' | 'RSD';

export function FinanceIncome() {
  const { transactions, accounts, addTransaction, removeTransaction } = useStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showAddModal, setShowAddModal] = useState(false);

  const incomeTransactions = transactions.filter(t => t.type === 'income');

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleDelete = (id: string) => {
    removeTransaction(id);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.summaryCard, { backgroundColor: '#34C759' }]}>
        <Text style={styles.summaryLabel}>Total Income</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalIncome)}</Text>
        <Text style={styles.summaryCount}>{incomeTransactions.length} transactions</Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>+ Add Income</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list}>
        {incomeTransactions.map((transaction) => (
          <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.transactionInfo}>
              <Text style={[styles.transactionCategory, { color: isDark ? '#FFF' : '#000' }]}>
                {transaction.category.replace('_', ' ')}
              </Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[styles.transactionAmount, { color: '#34C759' }]}>
                +{formatCurrency(transaction.amount)}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(transaction.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {incomeTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No income yet</Text>
          </View>
        )}
      </ScrollView>

      <IncomeModal
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

function IncomeModal({ visible, onClose, accounts, onSave }: {
  visible: boolean;
  onClose: () => void;
  accounts: any[];
  onSave: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [category, setCategory] = useState<TransactionCategory>('salary');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const getDisplayAmount = () => {
    if (!amount) return '';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;
    if (currency === 'RSD') {
      return (numAmount / RSD_TO_USD_RATE).toFixed(2);
    }
    return amount;
  };

  const handleSave = () => {
    if (!amount || !accountId) return;
    const numAmount = parseFloat(amount);
    const finalAmount = currency === 'RSD' ? numAmount / RSD_TO_USD_RATE : numAmount;
    onSave({
      amount: finalAmount,
      type: 'income',
      category,
      description,
      accountId,
      date,
    });
    setAmount('');
    setDescription('');
    setCurrency('USD');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
          <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>Add Income</Text>

          <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Amount</Text>
          <View style={styles.currencyRow}>
            <View style={styles.currencyToggle}>
              <TouchableOpacity 
                style={[styles.currencyButton, currency === 'USD' && styles.currencyButtonActive]} 
                onPress={() => setCurrency('USD')}
              >
                <Text style={[styles.currencyButtonText, currency === 'USD' && styles.currencyButtonTextActive]}>USD</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.currencyButton, currency === 'RSD' && styles.currencyButtonActive]} 
                onPress={() => setCurrency('RSD')}
              >
                <Text style={[styles.currencyButtonText, currency === 'RSD' && styles.currencyButtonTextActive]}>RSD</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder={currency === 'USD' ? "0.00" : "0"}
              keyboardType="numeric"
              style={[styles.input, styles.amountInput, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }]}
            />
          </View>
          {currency === 'RSD' && amount && (
            <Text style={styles.convertedText}>≈ ${getDisplayAmount()} USD</Text>
          )}

          <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
            {INCOME_CATEGORIES.map((cat) => (
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
  addButton: { backgroundColor: '#34C759', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
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
  currencyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  currencyToggle: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 8, padding: 2, marginRight: 8 },
  currencyButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  currencyButtonActive: { backgroundColor: '#007AFF' },
  currencyButtonText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  currencyButtonTextActive: { color: '#FFFFFF' },
  amountInput: { flex: 1 },
  convertedText: { fontSize: 13, color: '#34C759', marginTop: -4, marginBottom: 8 },
  input: { fontSize: 16, padding: 12, borderRadius: 8 },
  categorySelector: { flexDirection: 'row', marginBottom: 8 },
  categoryOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F2F2F7', marginRight: 8 },
  categoryOptionActive: { backgroundColor: '#34C759' },
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
  saveButton: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#34C759', marginLeft: 8 },
  saveButtonText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#FFF' },
});
