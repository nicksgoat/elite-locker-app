/**
 * Elite Locker - Conflict Resolution Modal
 * 
 * This component handles sync conflicts between local and remote data.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { resolveSyncConflict } from '../utils/realtimeSync';
import { createLogger } from '../utils/secureLogger';

const logger = createLogger('ConflictResolution');

// Conflict resolution modal props
export interface ConflictResolutionModalProps {
  visible: boolean;
  conflicts: Array<{
    id: string;
    table: string;
    localRecord: any;
    remoteRecord: any;
    timestamp: number;
  }>;
  onClose: () => void;
  onResolved: (conflictId: string, resolution: 'local' | 'remote' | 'merge') => void;
}

// Conflict resolution modal component
export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  visible,
  conflicts,
  onClose,
  onResolved,
}) => {
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Resolve conflict
  const handleResolveConflict = async (
    conflictId: string,
    resolution: 'local' | 'remote' | 'merge',
    mergedData?: any
  ) => {
    setIsResolving(true);
    
    try {
      await resolveSyncConflict(conflictId, resolution, mergedData);
      onResolved(conflictId, resolution);
      
      logger.info('Conflict resolved', { conflictId, resolution });
      
      // Close modal if no more conflicts
      if (conflicts.length <= 1) {
        onClose();
      }
    } catch (error) {
      logger.error('Failed to resolve conflict', { error: error.message, conflictId });
      Alert.alert('Error', 'Failed to resolve conflict. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  // Resolve all conflicts with same strategy
  const handleResolveAll = (resolution: 'local' | 'remote') => {
    Alert.alert(
      'Resolve All Conflicts',
      `Are you sure you want to resolve all conflicts using ${resolution} data?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            for (const conflict of conflicts) {
              try {
                await handleResolveConflict(conflict.id, resolution);
              } catch (error) {
                logger.error('Failed to resolve conflict in batch', { 
                  error: error.message, 
                  conflictId: conflict.id 
                });
              }
            }
          },
        },
      ]
    );
  };

  // Format field value for display
  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return String(value);
  };

  // Get field differences
  const getFieldDifferences = (localRecord: any, remoteRecord: any) => {
    const differences: Array<{
      field: string;
      localValue: any;
      remoteValue: any;
      isDifferent: boolean;
    }> = [];

    const allFields = new Set([
      ...Object.keys(localRecord || {}),
      ...Object.keys(remoteRecord || {}),
    ]);

    allFields.forEach(field => {
      const localValue = localRecord?.[field];
      const remoteValue = remoteRecord?.[field];
      const isDifferent = JSON.stringify(localValue) !== JSON.stringify(remoteValue);

      differences.push({
        field,
        localValue,
        remoteValue,
        isDifferent,
      });
    });

    return differences.sort((a, b) => {
      // Show different fields first
      if (a.isDifferent && !b.isDifferent) return -1;
      if (!a.isDifferent && b.isDifferent) return 1;
      return a.field.localeCompare(b.field);
    });
  };

  if (!visible || conflicts.length === 0) {
    return null;
  }

  const currentConflict = conflicts.find(c => c.id === selectedConflict) || conflicts[0];
  const differences = getFieldDifferences(currentConflict.localRecord, currentConflict.remoteRecord);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sync Conflicts</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Conflict selector */}
        {conflicts.length > 1 && (
          <View style={styles.conflictSelector}>
            <Text style={styles.selectorTitle}>
              Conflict {conflicts.findIndex(c => c.id === currentConflict.id) + 1} of {conflicts.length}
            </Text>
            <View style={styles.selectorButtons}>
              {conflicts.map((conflict, index) => (
                <TouchableOpacity
                  key={conflict.id}
                  style={[
                    styles.selectorButton,
                    conflict.id === currentConflict.id && styles.selectorButtonActive,
                  ]}
                  onPress={() => setSelectedConflict(conflict.id)}
                >
                  <Text
                    style={[
                      styles.selectorButtonText,
                      conflict.id === currentConflict.id && styles.selectorButtonTextActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Conflict details */}
        <ScrollView style={styles.content}>
          <View style={styles.conflictInfo}>
            <Text style={styles.conflictTable}>Table: {currentConflict.table}</Text>
            <Text style={styles.conflictTime}>
              Occurred: {new Date(currentConflict.timestamp).toLocaleString()}
            </Text>
          </View>

          {/* Field differences */}
          <View style={styles.differencesContainer}>
            <Text style={styles.differencesTitle}>Field Differences</Text>
            
            {differences.map(({ field, localValue, remoteValue, isDifferent }) => (
              <View
                key={field}
                style={[
                  styles.fieldRow,
                  isDifferent && styles.fieldRowDifferent,
                ]}
              >
                <Text style={styles.fieldName}>{field}</Text>
                
                <View style={styles.fieldValues}>
                  <View style={styles.fieldValueContainer}>
                    <Text style={styles.fieldValueLabel}>Local</Text>
                    <Text style={[
                      styles.fieldValue,
                      isDifferent && styles.fieldValueDifferent,
                    ]}>
                      {formatFieldValue(localValue)}
                    </Text>
                  </View>
                  
                  <View style={styles.fieldValueContainer}>
                    <Text style={styles.fieldValueLabel}>Remote</Text>
                    <Text style={[
                      styles.fieldValue,
                      isDifferent && styles.fieldValueDifferent,
                    ]}>
                      {formatFieldValue(remoteValue)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Resolution buttons */}
        <View style={styles.resolutionButtons}>
          <TouchableOpacity
            style={[styles.resolutionButton, styles.localButton]}
            onPress={() => handleResolveConflict(currentConflict.id, 'local')}
            disabled={isResolving}
          >
            <Text style={styles.resolutionButtonText}>Use Local</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resolutionButton, styles.remoteButton]}
            onPress={() => handleResolveConflict(currentConflict.id, 'remote')}
            disabled={isResolving}
          >
            <Text style={styles.resolutionButtonText}>Use Remote</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resolutionButton, styles.mergeButton]}
            onPress={() => {
              // For now, merge means prefer local with remote timestamp
              const mergedData = {
                ...currentConflict.remoteRecord,
                ...currentConflict.localRecord,
                updated_at: currentConflict.remoteRecord.updated_at,
              };
              handleResolveConflict(currentConflict.id, 'merge', mergedData);
            }}
            disabled={isResolving}
          >
            <Text style={styles.resolutionButtonText}>Merge</Text>
          </TouchableOpacity>
        </View>

        {/* Batch resolution */}
        {conflicts.length > 1 && (
          <View style={styles.batchResolution}>
            <Text style={styles.batchTitle}>Resolve All:</Text>
            <TouchableOpacity
              style={[styles.batchButton, styles.batchLocalButton]}
              onPress={() => handleResolveAll('local')}
              disabled={isResolving}
            >
              <Text style={styles.batchButtonText}>All Local</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.batchButton, styles.batchRemoteButton]}
              onPress={() => handleResolveAll('remote')}
              disabled={isResolving}
            >
              <Text style={styles.batchButtonText}>All Remote</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  conflictSelector: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  selectorButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: '#007AFF',
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  selectorButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  conflictInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  conflictTable: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  conflictTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  differencesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  differencesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  fieldRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  fieldRowDifferent: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  fieldValues: {
    flexDirection: 'row',
    gap: 16,
  },
  fieldValueContainer: {
    flex: 1,
  },
  fieldValueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
  fieldValueDifferent: {
    backgroundColor: '#FFE5B4',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  resolutionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  resolutionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  localButton: {
    backgroundColor: '#34C759',
  },
  remoteButton: {
    backgroundColor: '#007AFF',
  },
  mergeButton: {
    backgroundColor: '#FF9500',
  },
  resolutionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  batchResolution: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    gap: 12,
  },
  batchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  batchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  batchLocalButton: {
    backgroundColor: '#34C759',
  },
  batchRemoteButton: {
    backgroundColor: '#007AFF',
  },
  batchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ConflictResolutionModal;
