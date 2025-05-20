import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock club data (would be fetched based on ID in a real app)
const mockClub = {
  id: '1',
  name: 'Elite Speed Academy',
  creator: {
    name: 'Coach Devon Allen',
    avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
  },
  pricing: {
    monthly: 29.99,
    annual: 299.99,
    trial_days: 7,
    features: [
      'Weekly live training sessions',
      'Custom workout programs',
      'Form analysis & feedback',
      'Private community access',
      'Exclusive drills library'
    ]
  }
};

// Payment methods
const paymentMethods = [
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: 'logo-apple',
  },
  {
    id: 'credit_card',
    name: 'Credit Card',
    icon: 'card-outline',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: 'logo-paypal',
  }
];

export default function SubscribeScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('apple_pay');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // In a real app, we'd fetch club data based on the ID
  const club = mockClub;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSelectPlan = (plan: 'monthly' | 'annual') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  const handleSelectPayment = (method: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaymentMethod(method);
  };

  const handleToggleTerms = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTermsAccepted(!termsAccepted);
  };

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // In a real app, this would connect to a payment processor
    Alert.alert(
      'Subscription Successful',
      `You've subscribed to ${club.name}. Your ${club.pricing.trial_days}-day free trial begins today.`,
      [
        {
          text: 'OK',
          onPress: () => router.push('/'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={30} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscribe</Text>
        <View style={styles.placeholder} />
      </BlurView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.clubInfoContainer}>
          <View style={styles.clubInfo}>
            <Image source={{ uri: club.creator.avatar }} style={styles.clubAvatar} />
            <View>
              <Text style={styles.clubName}>{club.name}</Text>
              <Text style={styles.creatorName}>by {club.creator.name}</Text>
            </View>
          </View>
        </View>

        {/* Plan Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          <TouchableOpacity
            style={[
              styles.planOption,
              selectedPlan === 'monthly' && styles.selectedPlanOption,
            ]}
            onPress={() => handleSelectPlan('monthly')}
          >
            <View style={styles.planDetails}>
              <Text style={styles.planName}>Monthly</Text>
              <Text style={styles.planPrice}>${club.pricing.monthly}/month</Text>
              <Text style={styles.planTrial}>
                {club.pricing.trial_days}-day free trial
              </Text>
            </View>
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radioOuter,
                  selectedPlan === 'monthly' && styles.radioOuterSelected,
                ]}
              >
                {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planOption,
              selectedPlan === 'annual' && styles.selectedPlanOption,
            ]}
            onPress={() => handleSelectPlan('annual')}
          >
            <View style={styles.planDetails}>
              <View style={styles.planNameRow}>
                <Text style={styles.planName}>Annual</Text>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save 17%</Text>
                </View>
              </View>
              <Text style={styles.planPrice}>
                ${(club.pricing.annual / 12).toFixed(2)}/month
              </Text>
              <Text style={styles.planBilledAs}>
                Billed as ${club.pricing.annual} annually
              </Text>
              <Text style={styles.planTrial}>
                {club.pricing.trial_days}-day free trial
              </Text>
            </View>
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radioOuter,
                  selectedPlan === 'annual' && styles.radioOuterSelected,
                ]}
              >
                {selectedPlan === 'annual' && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                paymentMethod === method.id && styles.selectedPaymentOption,
              ]}
              onPress={() => handleSelectPayment(method.id)}
            >
              <View style={styles.paymentDetails}>
                <Ionicons name={method.icon} size={24} color="#FFFFFF" />
                <Text style={styles.paymentName}>{method.name}</Text>
              </View>
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    paymentMethod === method.id && styles.radioOuterSelected,
                  ]}
                >
                  {paymentMethod === method.id && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Membership Features */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Membership Includes</Text>
          {club.pricing.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Terms of Service */}
        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.termsCheckbox}
            onPress={handleToggleTerms}
          >
            <View
              style={[
                styles.checkbox,
                termsAccepted && styles.checkboxSelected,
              ]}
            >
              {termsAccepted && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree to the Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <BlurView intensity={30} style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            ${selectedPlan === 'monthly' ? club.pricing.monthly : (club.pricing.annual / 12).toFixed(2)}
          </Text>
          <Text style={styles.pricePeriod}>
            {selectedPlan === 'monthly' ? '/month' : '/month (billed annually)'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.subscribeButton, !termsAccepted && styles.disabledButton]}
          onPress={handleSubscribe}
          disabled={!termsAccepted}
        >
          <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
        </TouchableOpacity>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  clubInfoContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  planOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedPlanOption: {
    borderColor: '#0A84FF',
  },
  planDetails: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  savingsBadge: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  savingsText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planBilledAs: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  planTrial: {
    fontSize: 14,
    color: '#0A84FF',
  },
  radioContainer: {
    padding: 8,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#0A84FF',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0A84FF',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedPaymentOption: {
    borderColor: '#0A84FF',
  },
  paymentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 100, // Extra space for bottom bar
  },
  termsCheckbox: {
    marginRight: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  termsText: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(60, 60, 67, 0.29)',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pricePeriod: {
    fontSize: 15,
    color: '#8E8E93',
    marginLeft: 2,
  },
  subscribeButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.5)',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 