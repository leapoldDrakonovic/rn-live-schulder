import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useStore } from '../../../../src/store';
import { Transaction, TransactionCategory, TransactionType } from '../../../../src/types';

const EXPENSE_CATEGORIES: TransactionCategory[] = ['food', 'transport', 'housing', 'entertainment', 'healthcare', 'education', 'shopping', 'utilities', 'other_expense'];
const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'investment', 'gift', 'other_income'];

export function FinanceTransactions() {
  const { transactions, accounts, addTransaction, removeTransaction, addAccount } = useStore();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  const defaultAccountId = accounts[0]?.id || '';

  useEffect(() => {
    if (accounts.length === 0) {
      addAccount({ name: 'Cash', type: 'cash', balance: 0, color: '#007AFF' });
    }
  }, []);

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

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+ Add Transaction</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionLeft}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: transaction.type === 'income' ? '#34C75920' : '#FF3B3020' }
                ]}>
                  <Text style={[
                    styles.transactionIconText,
                    { color: transaction.type === 'income' ? '#34C759' : '#FF3B30' }
                  ]}>
                    {transaction.type === 'income' ? '↑' : '↓'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.transactionCategory}>
                    {transaction.category.replace('_', ' ')}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? '#34C759' : '#FF3B30' }
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
                <TouchableOpacity 
                  onPress={() => removeTransaction(transaction.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
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
        defaultAccountId={defaultAccountId}
        onSave={(data) => {
          addTransaction(data);
          setShowAddModal(false);
        }}
      />
    </View>
  );
}

function TransactionModal({ visible, onClose, defaultAccountId, onSave }: {
  visible: boolean;
  onClose: () => void;
  defaultAccountId: string;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = () => {
    if (!amount || !defaultAccountId) return;
    onSave({
      amount: parseFloat(amount),
      type,
      category,
      description,
      accountId: defaultAccountId,
      date,
    });
    setAmount('');
    setDescription('');
    setCategory(type === 'income' ? 'salary' : 'food');
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent 
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalBackdrop}>
        <TouchableOpacity 
          style={styles.modalBackdropTouch} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          
          <Text style={styles.modalTitle}>
            {type === 'expense' ? 'Add Expense' : 'Add Income'}
          </Text>

          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]} 
              onPress={() => { setType('expense'); setCategory('food'); }}
            >
              <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]} 
              onPress={() => { setType('income'); setCategory('salary'); }}
            >
              <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            style={styles.input}
            placeholderTextColor="#8E8E93"
          />

          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.option, category === cat && (type === 'expense' ? styles.optionActiveExpense : styles.optionActiveIncome)]} 
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.optionText, category === cat && styles.optionTextActive]}>
                  {cat.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.inputLabel}>Description (optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add a note"
            style={styles.input}
            placeholderTextColor="#8E8E93"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: type === 'expense' ? '#FF3B30' : '#34C759' }]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 6,
  },
  transactionDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 5,
    backgroundColor: '#D1D1D6',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 3,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  typeButtonActiveIncome: {
    backgroundColor: '#FFFFFF',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  typeButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: '#000000',
  },
  selector: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  optionActiveExpense: {
    backgroundColor: '#FF3B30',
  },
  optionActiveIncome: {
    backgroundColor: '#34C759',
  },
  optionText: {
    fontSize: 13,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    marginLeft: 8,
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
