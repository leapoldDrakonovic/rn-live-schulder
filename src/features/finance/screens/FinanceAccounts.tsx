import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { useStore } from '../../../../src/store';
import { useColorScheme } from '../../../../hooks/use-color-scheme';
import { Account, AccountType } from '../../../../src/types';

const ACCOUNT_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF2D55', '#5856D6', '#00C7BE', '#AF52DE', '#FF3B30'];
const ACCOUNT_TYPES: { label: string; value: AccountType }[] = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Card', value: 'bank_card' },
  { label: 'Savings', value: 'savings' },
  { label: 'Credit', value: 'credit' },
  { label: 'Investment', value: 'investment' },
  { label: 'Other', value: 'other' },
];

export function FinanceAccounts() {
  const { accounts, addAccount, updateAccount, removeAccount } = useStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeAccount(id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ Add Account</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list}>
        {accounts.map((account) => (
          <View key={account.id} style={[styles.accountCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.accountHeader}>
              <View style={[styles.accountIcon, { backgroundColor: account.color }]}>
                <Text style={styles.accountIconText}>{account.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={[styles.accountName, { color: isDark ? '#FFF' : '#000' }]}>{account.name}</Text>
                <Text style={styles.accountType}>{account.type.replace('_', ' ')}</Text>
              </View>
              <Text style={[styles.accountBalance, { color: account.balance >= 0 ? '#34C759' : '#FF3B30' }]}>
                {formatCurrency(account.balance)}
              </Text>
            </View>
            <View style={styles.accountActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setEditingAccount(account);
                  setShowAddModal(true);
                }}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(account.id, account.name)}
              >
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {accounts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No accounts yet</Text>
            <Text style={styles.emptySubtext}>Add your first account to start tracking</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </Text>
            
            <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Name</Text>
            <TextInput
              value={editingAccount?.name || ''}
              onChangeText={(text) => setEditingAccount(prev => prev ? { ...prev, name: text } : { name: text, type: 'cash', color: '#007AFF', balance: 0 } as Account)}
              placeholder="Account name"
              style={[styles.input, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }]}
            />

            <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {ACCOUNT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.typeOption, editingAccount?.type === t.value && styles.typeOptionSelected]}
                  onPress={() => setEditingAccount(prev => prev ? { ...prev, type: t.value } : { type: t.value, name: '', color: '#007AFF', balance: 0 } as Account)}
                >
                  <Text style={[styles.typeOptionText, editingAccount?.type === t.value && styles.typeOptionTextSelected]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Color</Text>
            <View style={styles.colorSelector}>
              {ACCOUNT_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorOption, { backgroundColor: c }, editingAccount?.color === c && styles.colorOptionSelected]}
                  onPress={() => setEditingAccount(prev => prev ? { ...prev, color: c } : { color: c, name: '', type: 'cash', balance: 0 } as Account)}
                />
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>Initial Balance</Text>
            <TextInput
              value={editingAccount?.balance?.toString() || '0'}
              onChangeText={(text) => setEditingAccount(prev => prev ? { ...prev, balance: parseFloat(text) || 0 } : { balance: parseFloat(text) || 0, name: '', type: 'cash', color: '#007AFF' } as Account)}
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setShowAddModal(false);
                setEditingAccount(null);
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => {
                  if (editingAccount) {
                    if (accounts.find(a => a.id === editingAccount.id)) {
                      updateAccount(editingAccount);
                    } else {
                      addAccount({ name: editingAccount.name, type: editingAccount.type, color: editingAccount.color, balance: editingAccount.balance });
                    }
                  }
                  setShowAddModal(false);
                  setEditingAccount(null);
                }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  accountCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountIconText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountType: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '700',
  },
  accountActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  actionButton: {
    marginRight: 16,
  },
  actionText: {
    color: '#007AFF',
    fontSize: 14,
  },
  deleteButton: {},
  deleteText: {
    color: '#FF3B30',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#007AFF',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  typeOptionTextSelected: {
    color: '#FFF',
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#000',
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
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
