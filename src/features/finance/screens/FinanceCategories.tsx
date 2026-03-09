import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { useStore } from '../../../../src/store';
import { useColorScheme } from '../../../../hooks/use-color-scheme';
import { TransactionType, Category } from '../../../../src/types';

const CATEGORY_COLORS = ['#FF9500', '#5856D6', '#FF2D55', '#34C759', '#007AFF', '#00C7BE', '#AF52DE', '#FF3B30', '#8E8E93'];

export function FinanceCategories() {
  const { categories, addCategory, removeCategory } = useStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>+ Add Category</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>Expense Categories</Text>
      <View style={styles.categoryGrid}>
        {expenseCategories.map((category) => (
          <View key={category.id} style={[styles.categoryCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color || '#007AFF' }]}>
              <Text style={styles.categoryIconText}>{category.name.charAt(0)}</Text>
            </View>
            <Text style={[styles.categoryName, { color: isDark ? '#FFF' : '#000' }]}>{category.name}</Text>
            {category.isCustom && (
              <TouchableOpacity onPress={() => handleDelete(category.id, category.name, category.isCustom)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000', marginTop: 24 }]}>Income Categories</Text>
      <View style={styles.categoryGrid}>
        {incomeCategories.map((category) => (
          <View key={category.id} style={[styles.categoryCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color || '#34C759' }]}>
              <Text style={styles.categoryIconText}>{category.name.charAt(0)}</Text>
            </View>
            <Text style={[styles.categoryName, { color: isDark ? '#FFF' : '#000' }]}>{category.name}</Text>
            {category.isCustom && (
              <TouchableOpacity onPress={() => handleDelete(category.id, category.name, category.isCustom)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>Add Category</Text>

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
      <Text style={{ color: '#8E8E93', fontSize: 14, marginBottom: 8 }}>Type</Text>
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

      <Text style={{ color: '#8E8E93', fontSize: 14, marginBottom: 8, marginTop: 12 }}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Category name"
        style={{ backgroundColor: '#F2F2F7', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12 }}
      />

      <Text style={{ color: '#8E8E93', fontSize: 14, marginBottom: 8 }}>Color</Text>
      <View style={styles.colorSelector}>
        {CATEGORY_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorOption, { backgroundColor: c }, color === c && styles.colorOptionSelected]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', marginTop: 24 }}>
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
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryCard: { width: '48%', borderRadius: 12, padding: 16, marginBottom: 12, marginRight: '2%', alignItems: 'center' },
  categoryIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryIconText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  categoryName: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  deleteText: { color: '#FF3B30', fontSize: 12, marginTop: 4 },
  addButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 12 },
  typeSelector: { flexDirection: 'row', marginBottom: 16 },
  typeSelectorRow: { flexDirection: 'row', marginBottom: 16 },
  typeOption: { flex: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F2F2F7', marginRight: 8, alignItems: 'center' },
  typeOptionExpense: { backgroundColor: '#FF3B30' },
  typeOptionIncome: { backgroundColor: '#34C759' },
  typeOptionText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  typeButton: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F2F2F7', marginRight: 8, alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#FF3B30' },
  typeButtonActiveIncome: { backgroundColor: '#34C759' },
  typeButtonText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  typeButtonTextActive: { color: '#FFF' },
  colorSelector: { flexDirection: 'row', flexWrap: 'wrap' },
  colorOption: { width: 36, height: 36, borderRadius: 18, marginRight: 8, marginBottom: 8 },
  colorOptionSelected: { borderWidth: 3, borderColor: '#000' },
});
