import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

interface DateTimePickerProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
}

export const DateTimePickerField: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  mode = 'datetime',
  placeholder = 'Select date and time',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate.toISOString());
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate.toISOString());
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value ? new Date(value) : new Date());
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange(null);
    setShowPicker(false);
  };

  const displayValue = value
    ? mode === 'time'
      ? dayjs(value).format('HH:mm')
      : mode === 'date'
      ? dayjs(value).format('MMM D, YYYY')
      : dayjs(value).format('MMM D, YYYY HH:mm')
    : placeholder;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, !value && styles.placeholder]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {displayValue}
        </Text>
      </TouchableOpacity>

      {showPicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible={showPicker}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={mode === 'datetime' ? 'date' : mode}
                display="spinner"
                onChange={handleChange}
                style={styles.picker}
              />
              {mode === 'datetime' && (
                <View style={styles.timePickerContainer}>
                  <Text style={styles.timeLabel}>Time</Text>
                  <DateTimePicker
                    value={tempDate}
                    mode="time"
                    display="spinner"
                    onChange={handleChange}
                    style={styles.picker}
                  />
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode={mode === 'datetime' ? 'date' : mode}
          display="default"
          onChange={handleChange}
        />
      )}

      {value && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface DurationPickerProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  minDuration?: number;
  maxDuration?: number;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 240, 300];

export const DurationPicker: React.FC<DurationPickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select duration',
  minDuration = 15,
  maxDuration = 300,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDuration, setTempDuration] = useState(value || 30);

  const filteredOptions = DURATION_OPTIONS.filter(
    d => d >= minDuration && d <= maxDuration
  );

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  };

  const handleSelect = (duration: number) => {
    setTempDuration(duration);
  };

  const handleConfirm = () => {
    onChange(tempDuration);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDuration(value || 30);
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange(null);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, !value && styles.placeholder]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {value ? formatDuration(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <Modal transparent animationType="slide" visible={showPicker}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Duration</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.durationGrid}>
                {filteredOptions.map(duration => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationOption,
                      tempDuration === duration && styles.durationOptionSelected,
                    ]}
                    onPress={() => handleSelect(duration)}
                  >
                    <Text
                      style={[
                        styles.durationOptionText,
                        tempDuration === duration && styles.durationOptionTextSelected,
                      ]}
                    >
                      {formatDuration(duration)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {value && (
                <TouchableOpacity style={styles.clearButtonModal} onPress={handleClear}>
                  <Text style={styles.clearTextModal}>Clear Duration</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  placeholder: {
    backgroundColor: '#F2F2F7',
  },
  inputText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  placeholderText: {
    color: '#8E8E93',
  },
  clearButton: {
    marginTop: 8,
  },
  clearText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
  doneText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  picker: {
    height: 216,
  },
  timePickerContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    padding: 16,
    paddingBottom: 0,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'center',
  },
  durationOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    minWidth: 80,
    alignItems: 'center',
  },
  durationOptionSelected: {
    backgroundColor: '#007AFF',
  },
  durationOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  durationOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  clearButtonModal: {
    alignItems: 'center',
    padding: 16,
  },
  clearTextModal: {
    color: '#FF3B30',
    fontSize: 17,
  },
});
