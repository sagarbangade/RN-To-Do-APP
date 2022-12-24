import { CreateTodoInput, Todo, TodoPriority } from '@/types/todo';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  IconButton,
  Portal,
  SegmentedButtons,
  TextInput,
  Title,
} from 'react-native-paper';

interface TodoFormProps {
  visible: boolean;
  todo?: Todo | null;
  onClose: () => void;
  onSubmit: (input: CreateTodoInput | Partial<Todo>) => Promise<void>;
}

const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];

export function TodoForm({ visible, todo, onClose, onSubmit }: TodoFormProps) {
  const isEdit = !!todo;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setCategory(todo.category || '');
      setDueDate(todo.dueDate ? new Date(todo.dueDate) : null);
    } else {
      resetForm();
    }
    setShowDatePicker(false);
  }, [todo, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('');
    setDueDate(null);
    setShowDatePicker(false);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    try {
      const input: CreateTodoInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category: category || undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      };

      if (isEdit && todo) {
        await onSubmit({ ...input, id: todo.id });
      } else {
        await onSubmit(input);
      }

      resetForm();
      onClose();
    } catch {
      // Error handling is done in the parent component
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      // On Android, the picker is a modal that closes automatically
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setDueDate(selectedDate);
      }
    } else {
      // iOS - update in real-time as user scrolls
      if (selectedDate) {
        setDueDate(selectedDate);
      }
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
  };

  const priorityButtons = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}>
        <View style={styles.modalContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Title style={styles.title}>
                  {isEdit ? 'Edit Todo' : 'New Todo'}
                </Title>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={onClose}
                />
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                  <TextInput
                    label="Title *"
                    value={title}
                    onChangeText={(text) => {
                      setTitle(text);
                      if (errors.title) setErrors({});
                    }}
                    error={!!errors.title}
                    mode="outlined"
                    style={styles.input}
                    autoFocus
                  />
                  {errors.title && (
                    <TextInput
                      editable={false}
                      value={errors.title}
                      style={styles.errorText}
                      textColor="#B00020"
                    />
                  )}
                </View>

                <View style={styles.section}>
                  <TextInput
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                  />
                </View>

                <View style={styles.section}>
                  <TextInput
                    label="Priority"
                    value=""
                    editable={false}
                    mode="outlined"
                    style={styles.input}
                  />
                  <SegmentedButtons
                    value={priority}
                    onValueChange={(value) => setPriority(value as TodoPriority)}
                    buttons={Object.entries(priorityButtons).map(([key, label]) => ({
                      value: key,
                      label,
                    }))}
                    style={styles.segmentedButtons}
                  />
                </View>

                <View style={styles.section}>
                  <TextInput
                    label="Category"
                    value=""
                    editable={false}
                    mode="outlined"
                    style={styles.input}
                  />
                  <View style={styles.chipContainer}>
                    {categories.map((cat) => (
                      <Chip
                        key={cat}
                        selected={category === cat}
                        onPress={() => setCategory(category === cat ? '' : cat)}
                        style={styles.chip}
                        mode={category === cat ? 'flat' : 'outlined'}>
                        {cat}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}>
                    <TextInput
                      label="Due Date & Time"
                      value={formatDateTime(dueDate) || 'Select due date and time (optional)'}
                      editable={false}
                      mode="outlined"
                      right={
                        <TextInput.Icon
                          icon="calendar"
                          onPress={() => setShowDatePicker(true)}
                        />
                      }
                      style={styles.input}
                      placeholder="Select due date and time (optional)"
                    />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <>
                      {Platform.OS === 'ios' ? (
                        <View style={styles.datePickerContainer}>
                          <DateTimePicker
                            value={dueDate || new Date()}
                            mode="datetime"
                            display="spinner"
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                            style={styles.datePicker}
                          />
                          <View style={styles.iosDatePickerContainer}>
                            <Button
                              mode="outlined"
                              onPress={() => {
                                setShowDatePicker(false);
                              }}
                              style={styles.datePickerButton}>
                              Cancel
                            </Button>
                            <Button
                              mode="contained"
                              onPress={() => {
                                if (!dueDate) {
                                  setDueDate(new Date());
                                }
                                setShowDatePicker(false);
                              }}
                              style={styles.datePickerButton}>
                              Done
                            </Button>
                          </View>
                        </View>
                      ) : (
                        <DateTimePicker
                          value={dueDate || new Date()}
                          mode="datetime"
                          display="default"
                          onChange={handleDateChange}
                          minimumDate={new Date()}
                        />
                      )}
                    </>
                  )}

                  {dueDate && (
                    <Button
                      mode="text"
                      onPress={() => {
                        setDueDate(null);
                        setShowDatePicker(false);
                      }}
                      textColor="#B00020"
                      style={styles.clearDateButton}>
                      Clear date & time
                    </Button>
                  )}
                </View>
              </ScrollView>
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <Button mode="outlined" onPress={onClose} style={styles.actionButton}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.actionButton}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 20,
  },
  card: {
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  textArea: {
    marginBottom: 8,
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    height: 20,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  datePickerContainer: {
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  datePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 'auto',
  },
  iosDatePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  datePickerButton: {
    minWidth: 80,
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  actions: {
    padding: 16,
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});
