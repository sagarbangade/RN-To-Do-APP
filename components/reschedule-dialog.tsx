import React, { useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import {
  Dialog,
  Button,
  Text,
  Portal,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RescheduleDialogProps {
  visible: boolean;
  currentDate?: string;
  onDismiss: () => void;
  onConfirm: (date: Date) => void;
}

export function RescheduleDialog({
  visible,
  currentDate,
  onDismiss,
  onConfirm,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    currentDate ? new Date(currentDate) : new Date()
  );
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && date) {
        setSelectedDate(date);
      }
    } else {
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onDismiss();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Reschedule Todo</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.currentDateText}>
            {currentDate
              ? `Current due date: ${formatDate(new Date(currentDate))}`
              : 'No due date set'}
          </Text>
          <Text variant="bodyMedium" style={styles.newDateText}>
            New due date: {formatDate(selectedDate)}
          </Text>

          {showPicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
              {Platform.OS === 'android' && (
                <Button
                  mode="outlined"
                  onPress={() => setShowPicker(true)}
                  style={styles.pickerButton}>
                  Change Date
                </Button>
              )}
            </View>
          )}

          {Platform.OS === 'android' && !showPicker && (
            <Button
              mode="outlined"
              onPress={() => setShowPicker(true)}
              style={styles.pickerButton}>
              Select Date
            </Button>
          )}

          {Platform.OS === 'ios' && (
            <Button
              mode="outlined"
              onPress={() => setShowPicker(!showPicker)}
              style={styles.pickerButton}>
              {showPicker ? 'Hide Picker' : 'Show Picker'}
            </Button>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" onPress={handleConfirm}>
            Reschedule
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxWidth: 400,
  },
  currentDateText: {
    marginBottom: 8,
    opacity: 0.7,
  },
  newDateText: {
    marginBottom: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    marginVertical: 16,
  },
  pickerButton: {
    marginTop: 8,
  },
});

