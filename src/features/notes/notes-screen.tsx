import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useStore } from '../../store';
import { Note } from '../../types';
import { formatDate } from '../../utils';
import dayjs from 'dayjs';

export const NotesScreen: React.FC = () => {
  const { notes, addNote, updateNote, removeNote } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  const handleCreateNote = () => {
    if (!noteTitle.trim()) return;
    
    addNote({
      title: noteTitle,
      content: noteContent,
      linkedTaskId: null,
      linkedGoalId: null,
      tags: [],
    });
    
    setNoteTitle('');
    setNoteContent('');
    setShowModal(false);
  };
  
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowModal(true);
  };
  
  const handleSaveNote = () => {
    if (!editingNote || !noteTitle.trim()) return;
    
    updateNote({
      ...editingNote,
      title: noteTitle,
      content: noteContent,
    });
    
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setShowModal(false);
  };
  
  const handleDeleteNote = (id: string) => {
    removeNote(id);
    if (editingNote?.id === id) {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
      setShowModal(false);
    }
  };
  
  const closeModal = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setShowModal(false);
  };
  
  const renderNoteItem = ({ item }: { item: Note }) => {
    const preview = item.content.slice(0, 100) + (item.content.length > 100 ? '...' : '');
    
    return (
      <TouchableOpacity 
        style={styles.noteCard}
        onPress={() => handleEditNote(item)}
      >
        <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
        {preview && (
          <Text style={styles.notePreview} numberOfLines={2}>{preview}</Text>
        )}
        <Text style={styles.noteDate}>{formatDate(item.updatedAt, 'MMM D, HH:mm')}</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <Text style={styles.subtitle}>{notes.length} notes</Text>
      </View>
      
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={renderNoteItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>Create your first note</Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingNote ? 'Edit Note' : 'New Note'}
            </Text>
            <TouchableOpacity 
              onPress={editingNote ? handleSaveNote : handleCreateNote}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          {editingNote && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteNote(editingNote.id)}
            >
              <Text style={styles.deleteButtonText}>Delete Note</Text>
            </TouchableOpacity>
          )}
          
          <ScrollView style={styles.modalForm}>
            <TextInput
              style={styles.titleInput}
              value={noteTitle}
              onChangeText={setNoteTitle}
              placeholder="Note title"
              placeholderTextColor="#8E8E93"
              autoFocus={!editingNote}
            />
            <TextInput
              style={styles.contentInput}
              value={noteContent}
              onChangeText={setNoteContent}
              placeholder="Start writing..."
              placeholderTextColor="#8E8E93"
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  notePreview: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cancelText: {
    fontSize: 17,
    color: '#8E8E93',
  },
  saveText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  deleteButtonText: {
    fontSize: 17,
    color: '#FF3B30',
    textAlign: 'center',
  },
  modalForm: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 300,
    padding: 0,
  },
});
