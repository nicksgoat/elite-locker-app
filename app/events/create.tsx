import MapView, { Marker, PROVIDER_GOOGLE } from '@/lib/platform/react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '../../components/ui/GlobalHeader';

// Event types
type EventType = 'in_person' | 'virtual' | 'hybrid';

interface TierInput {
  id: string;
  name: string;
  price: string;
  capacity: string;
}

// Location interface
interface LocationResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function CreateEventScreen() {
  const router = useRouter();

  // Event details state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('in_person');
  const [location, setLocation] = useState('');
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [showLocationResults, setShowLocationResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)); // Default: 2 hours later
  const [capacity, setCapacity] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(true);

  // Map state
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Ticket tiers state
  const [tiers, setTiers] = useState<TierInput[]>([
    { id: '1', name: 'Standard', price: '', capacity: '' }
  ]);

  // Club association state
  const [isClubEvent, setIsClubEvent] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  // Check if map component is available
  useEffect(() => {
    try {
      if (MapView) {
        setMapLoaded(true);
      }
    } catch (error) {
      console.error('Error loading map:', error);
      setMapLoaded(false);
    }
  }, []);

  // Request location permissions
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Permission to access location was denied');
          return;
        }

        // Get current location for initial map position
        const location = await Location.getCurrentPositionAsync({});
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.log('Error getting current location:', error);
      }
    })();
  }, []);

  // Search for locations based on input
  const searchLocations = async (query: string) => {
    setLocation(query);

    if (query.length < 3) {
      setLocationResults([]);
      setShowLocationResults(false);
      return;
    }

    setIsLocationLoading(true);
    try {
      // In a real app, this would call a geocoding API like Google Places API or MapKit
      // For this demo, we'll simulate some results
      const mockResults: LocationResult[] = [
        {
          id: '1',
          name: query + ' Stadium',
          address: '123 ' + query + ' Street, City, State',
          latitude: mapRegion.latitude + 0.01,
          longitude: mapRegion.longitude + 0.01,
        },
        {
          id: '2',
          name: query + ' Sports Center',
          address: '456 ' + query + ' Avenue, City, State',
          latitude: mapRegion.latitude - 0.01,
          longitude: mapRegion.longitude - 0.01,
        },
        {
          id: '3',
          name: query + ' Fitness Club',
          address: '789 ' + query + ' Boulevard, City, State',
          latitude: mapRegion.latitude,
          longitude: mapRegion.longitude + 0.02,
        },
      ];

      // Simulate API delay
      setTimeout(() => {
        setLocationResults(mockResults);
        setShowLocationResults(true);
        setIsLocationLoading(false);
      }, 1000);
    } catch (error) {
      console.log('Error searching locations:', error);
      setIsLocationLoading(false);
    }
  };

  // Handle location selection
  const handleSelectLocation = (location: LocationResult) => {
    setSelectedLocation(location);
    setLocation(location.name);
    setShowLocationResults(false);

    // Update map region
    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Validation
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter an event title');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please enter an event description');
      return false;
    }

    if (eventType !== 'virtual' && !selectedLocation) {
      Alert.alert('Missing Information', 'Please select a location for your in-person event');
      return false;
    }

    // Validate tiers have at least a name
    for (const tier of tiers) {
      if (!tier.name.trim()) {
        Alert.alert('Invalid Tier', 'All ticket tiers must have a name');
        return false;
      }
    }

    return true;
  };

  // Date handlers
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(startDate.getHours(), startDate.getMinutes());
      setStartDate(newDate);

      // If end date is before start date, update it
      if (endDate < newDate) {
        const newEndDate = new Date(newDate);
        newEndDate.setHours(newDate.getHours() + 2); // Default duration: 2 hours
        setEndDate(newEndDate);
      }
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(startDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setStartDate(newDate);

      // If end time is before start time on the same day, update it
      if (
        endDate.getFullYear() === newDate.getFullYear() &&
        endDate.getMonth() === newDate.getMonth() &&
        endDate.getDate() === newDate.getDate() &&
        endDate < newDate
      ) {
        const newEndDate = new Date(newDate);
        newEndDate.setHours(newDate.getHours() + 2); // Default duration: 2 hours
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(endDate.getHours(), endDate.getMinutes());

      // End date must be on or after start date
      if (newDate < startDate) {
        Alert.alert('Invalid Date', 'End date must be on or after start date');
        return;
      }

      setEndDate(newDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(endDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());

      // If same day, end time must be after start time
      if (
        newDate.getFullYear() === startDate.getFullYear() &&
        newDate.getMonth() === startDate.getMonth() &&
        newDate.getDate() === startDate.getDate() &&
        newDate <= startDate
      ) {
        Alert.alert('Invalid Time', 'End time must be after start time');
        return;
      }

      setEndDate(newDate);
    }
  };

  // Tier management
  const addTier = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTiers([
      ...tiers,
      { id: Date.now().toString(), name: '', price: '', capacity: '' }
    ]);
  };

  const updateTier = (id: string, field: keyof TierInput, value: string) => {
    setTiers(tiers.map(tier =>
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const removeTier = (id: string) => {
    if (tiers.length <= 1) {
      Alert.alert('Cannot Remove', 'You must have at least one ticket tier');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTiers(tiers.filter(tier => tier.id !== id));
  };

  // Submit handler
  const handleSubmit = () => {
    if (!validateForm()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // In a real app, we'd send this to an API
    const formattedTiers = tiers.map(tier => ({
      name: tier.name,
      price: parseFloat(tier.price) || 0,
      capacity: tier.capacity ? parseInt(tier.capacity, 10) : null,
    }));

    const eventData = {
      title,
      description,
      eventType,
      location: eventType !== 'virtual' ? selectedLocation : null,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      capacity: capacity ? parseInt(capacity, 10) : null,
      clubId: isClubEvent ? selectedClubId : null,
      tiers: formattedTiers,
    };

    console.log('Creating event:', eventData);
    Alert.alert(
      'Event Created',
      'Your event has been created successfully!',
      [
        {
          text: 'View Event',
          onPress: () => router.push('/events')
        }
      ]
    );
  };

  // Formatting helpers
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Render map or fallback for the selected location
  const renderLocationMap = () => {
    if (!selectedLocation || !mapLoaded) {
      return null;
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={mapRegion}
          customMapStyle={darkMapStyle}
        >
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title={selectedLocation.name}
          />
        </MapView>
        <Text style={styles.selectedLocationText}>
          {selectedLocation.name} • {selectedLocation.address}
        </Text>
      </View>
    );
  };

  // Render methods for form sections
  const renderBasicDetailsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Details</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Event Title*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a clear, descriptive title"
          placeholderTextColor="#8E8E93"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description*</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your event, what attendees will learn, and what to expect"
          placeholderTextColor="#8E8E93"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Event Type*</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeOption,
              eventType === 'in_person' && styles.typeOptionSelected
            ]}
            onPress={() => setEventType('in_person')}
          >
            <Ionicons
              name="location"
              size={18}
              color={eventType === 'in_person' ? '#FFFFFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.typeText,
                eventType === 'in_person' && styles.typeTextSelected
              ]}
            >
              In Person
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeOption,
              eventType === 'virtual' && styles.typeOptionSelected
            ]}
            onPress={() => setEventType('virtual')}
          >
            <Ionicons
              name="videocam"
              size={18}
              color={eventType === 'virtual' ? '#FFFFFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.typeText,
                eventType === 'virtual' && styles.typeTextSelected
              ]}
            >
              Virtual
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeOption,
              eventType === 'hybrid' && styles.typeOptionSelected
            ]}
            onPress={() => setEventType('hybrid')}
          >
            <Ionicons
              name="globe"
              size={18}
              color={eventType === 'hybrid' ? '#FFFFFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.typeText,
                eventType === 'hybrid' && styles.typeTextSelected
              ]}
            >
              Hybrid
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {eventType !== 'virtual' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location*</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationSearchContainer}>
              <TextInput
                style={styles.input}
                placeholder="Search for a venue or address"
                placeholderTextColor="#8E8E93"
                value={location}
                onChangeText={searchLocations}
              />
              {isLocationLoading && (
                <ActivityIndicator style={styles.locationLoader} color="#0A84FF" />
              )}
            </View>

            {showLocationResults && locationResults.length > 0 && (
              <View style={styles.locationResults}>
                {locationResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.locationResultItem}
                    onPress={() => handleSelectLocation(result)}
                  >
                    <Ionicons name="location-outline" size={18} color="#AAAAAA" />
                    <View style={styles.locationResultTextContainer}>
                      <Text style={styles.locationResultName}>{result.name}</Text>
                      <Text style={styles.locationResultAddress}>{result.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {renderLocationMap()}
          </View>
        </View>
      )}
    </View>
  );

  const renderDateTimeSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Date & Time</Text>

      <View style={styles.dateRow}>
        <View style={styles.dateColumn}>
          <Text style={styles.label}>Start Date*</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            <Ionicons name="calendar" size={18} color="#8E8E93" />
          </TouchableOpacity>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.dateColumn}>
          <Text style={styles.label}>Start Time*</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text style={styles.dateText}>{formatTime(startDate)}</Text>
            <Ionicons name="time" size={18} color="#8E8E93" />
          </TouchableOpacity>

          {showStartTimePicker && (
            <DateTimePicker
              value={startDate}
              mode="time"
              display="default"
              onChange={handleStartTimeChange}
            />
          )}
        </View>
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateColumn}>
          <Text style={styles.label}>End Date*</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            <Ionicons name="calendar" size={18} color="#8E8E93" />
          </TouchableOpacity>

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
              minimumDate={startDate}
            />
          )}
        </View>

        <View style={styles.dateColumn}>
          <Text style={styles.label}>End Time*</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={styles.dateText}>{formatTime(endDate)}</Text>
            <Ionicons name="time" size={18} color="#8E8E93" />
          </TouchableOpacity>

          {showEndTimePicker && (
            <DateTimePicker
              value={endDate}
              mode="time"
              display="default"
              onChange={handleEndTimeChange}
            />
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Capacity (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Maximum number of attendees"
          placeholderTextColor="#8E8E93"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
        />
        <Text style={styles.helperText}>Leave blank for unlimited capacity</Text>
      </View>
    </View>
  );

  const renderTicketTiersSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ticket Tiers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={addTier}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Tier</Text>
        </TouchableOpacity>
      </View>

      {tiers.map((tier, index) => (
        <View key={tier.id} style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierNumber}>Tier {index + 1}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeTier(tier.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#FF453A" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Early Bird, Standard, VIP"
              placeholderTextColor="#8E8E93"
              value={tier.name}
              onChangeText={(value) => updateTier(tier.id, 'name', value)}
            />
          </View>

          <View style={styles.tierRow}>
            <View style={styles.tierColumn}>
              <Text style={styles.label}>Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#8E8E93"
                value={tier.price}
                onChangeText={(value) => {
                  // Only allow numeric input with decimal
                  if (/^\d*\.?\d*$/.test(value) || value === '') {
                    updateTier(tier.id, 'price', value);
                  }
                }}
                keyboardType="decimal-pad"
              />
              <Text style={styles.helperText}>0 for free tickets</Text>
            </View>

            <View style={styles.tierColumn}>
              <Text style={styles.label}>Capacity</Text>
              <TextInput
                style={styles.input}
                placeholder="Optional"
                placeholderTextColor="#8E8E93"
                value={tier.capacity}
                onChangeText={(value) => {
                  // Only allow numeric input
                  if (/^\d*$/.test(value) || value === '') {
                    updateTier(tier.id, 'capacity', value);
                  }
                }}
                keyboardType="number-pad"
              />
              <Text style={styles.helperText}>Limit for this tier</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderClubSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Club Association</Text>

      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Host as Club Event</Text>
          <Text style={styles.toggleSubtext}>
            Make this event visible to members of your club
          </Text>
        </View>
        <Switch
          value={isClubEvent}
          onValueChange={setIsClubEvent}
          trackColor={{ false: '#222', true: '#0A84FF' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#222"
        />
      </View>

      {isClubEvent && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Club</Text>
          <TouchableOpacity
            style={styles.clubSelector}
            onPress={() => {
              // In a real app, show club selector
              setSelectedClubId('c1');
            }}
          >
            <Text style={styles.clubSelectorText}>
              {selectedClubId ? 'Elite Speed Academy' : 'Select a club'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <GlobalHeader
        title="Create Event"
        showBackButton={true}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderBasicDetailsSection()}
          {renderDateTimeSection()}
          {renderTicketTiersSection()}
          {renderClubSection()}

          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Dark mode map style
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    color: '#FFFFFF',
    fontSize: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.29)',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  helperText: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.29)',
  },
  typeOptionSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderColor: '#0A84FF',
  },
  typeText: {
    color: '#8E8E93',
    fontSize: 14,
    marginLeft: 8,
  },
  typeTextSelected: {
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateColumn: {
    width: '48%',
  },
  dateInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.29)',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#0A84FF',
    fontSize: 14,
    marginLeft: 4,
  },
  tierCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierColumn: {
    width: '48%',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  toggleSubtext: {
    color: '#8E8E93',
    fontSize: 14,
  },
  clubSelector: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.29)',
  },
  clubSelectorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  submitContainer: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Location search styles
  locationContainer: {
    marginBottom: 8,
  },
  locationSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLoader: {
    position: 'absolute',
    right: 12,
  },
  locationResults: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  locationResultItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
    alignItems: 'center',
  },
  locationResultTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationResultName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  locationResultAddress: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  mapContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    padding: 1,
  },
  map: {
    height: 200,
    width: '100%',
    borderRadius: 12,
  },
  selectedLocationText: {
    color: '#CCCCCC',
    fontSize: 12,
    padding: 12,
    textAlign: 'center',
  },
});