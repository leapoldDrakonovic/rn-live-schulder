import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { useStore } from '../../../../src/store';
import { TransactionType, Category } from '../../../../src/types';

const CATEGORY_COLORS = ['#FF9500', '#5856D6', '#FF2D55', '#34C759', '#007AFF', '#00C7BE', '#AF52DE', '#FF3B30', '#8E8E93'];

export function FinanceCategories() {
  const { categories, addCategory, removeCategory } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  const handleDelete = (id: string, name: string, isCustom: boolean) => {
    if (!isCustom) {
      Alert.alert('Cannot Delete', 'Default categories cannot be deleted');
      return;
    }
    Alert.alert('Delete Category', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeCategory(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
        <Text style={styles.addButtonText}>+ Add Category</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Expense Categories</Text>
      <View style={styles.categoryGrid}>
        {expenseCategories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color || '#007AFF' }]}>
              <Text style={styles.categoryIconText}>{category.name.charAt(0)}</Text>
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
            {category.isCustom && (
              <TouchableOpacity onPress={() => handleDelete(category.id, category.name, category.isCustom)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Income Categories</Text>
      <View style={styles.categoryGrid}>
        {incomeCategories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color || '#34C759' }]}>
              <Text style={styles.categoryIconText}>{category.name.charAt(0)}</Text>
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
            {category.isCustom && (
              <TouchableOpacity onPress={() => handleDelete(category.id, category.name, category.isCustom)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <Modal 
        visible={showAddModal} 
        animationType="slide" 
        transparent 
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.modalBackdropTouch} 
            activeOpacity={1} 
            onPress={() => setShowAddModal(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>Add Category</Text>

            <CategoryForm onSave={(data) => {
              addCategory(data);
              setShowAddModal(false);
            }} onCancel={() => setShowAddModal(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function CategoryForm({ onSave, onCancel }: { onSave: (data: Omit<Category, 'id'>) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), type, color, icon: 'tag', isCustom: true });
    setName('');
  };

  return (
    <>
      <Text style={styles.inputLabel}>Type</Text>
      <View style={styles.typeSelectorRow}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>Income</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.inputLabel}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Category name"
        placeholderTextColor="#8E8E93"
        style={styles.input}
      />

      <Text style={styles.inputLabel}>Color</Text>
      <View style={styles.colorSelector}>
        {CATEGORY_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorOption, { backgroundColor: c }, color === c && styles.colorOptionSelected]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      <View style={styles.modalActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginRight: '2%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 6,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  typeSelectorRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    marginBottom: 10,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#000000',
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
    color: '#FFFFFF',
  },
});
