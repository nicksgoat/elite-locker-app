import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function SubscribeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState(route.params?.plan || 'monthly');
  const [paymentMethod, setPaymentMethod] = useState('apple_pay');

  // Mock club data - in real app, fetch from API
  const club = {
    id: route.params?.club_id,
    name: 'Elite Speed Academy',
    pricing: {
      monthly: 29.99,
      annual: 299.99,
      trial_days: 7,
    },
    features: [
      'Weekly live training sessions',
      'Personalized workout programs',
      'Form analysis & feedback',
      'Private community access',
      'Progress tracking tools',
    ],
  };

  const paymentMethods = [
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: 'logo-apple',
    },
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: 'card',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'logo-paypal',
    },
  ];

  const handleSubscribe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // In real app, integrate with Stripe/RevenueCat here
      Alert.alert(
        'Subscription Successful',
        'Welcome to Elite Speed Academy! Your free trial begins now.',
        [
          {
            text: 'Start Training',
            onPress: () => navigation.navigate('ClubDetail', { id: club.id }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Join {club.name}</Text>
          
          <View style={styles.planSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            <View style={styles.planToggle}>
              <TouchableOpacity
                style={[styles.planOption, selectedPlan === 'monthly' && styles.planSelected]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <View style={styles.planContent}>
                  <Text style={[styles.planName, selectedPlan === 'monthly' && styles.planTextSelected]}>
                    Monthly
                  </Text>
                  <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planTextSelected]}>
                    ${club.pricing.monthly}/mo
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.planOption, selectedPlan === 'annual' && styles.planSelected]}
                onPress={() => setSelectedPlan('annual')}
              >
                <View style={styles.planContent}>
                  <Text style={[styles.planName, selectedPlan === 'annual' && styles.planTextSelected]}>
                    Annual
                  </Text>
                  <Text style={[styles.planPrice, selectedPlan === 'annual' && styles.planTextSelected]}>
                    ${(club.pricing.annual / 12).toFixed(2)}/mo
                  </Text>
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Save 20%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  paymentMethod === method.id && styles.paymentSelected,
                ]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <Ionicons name={method.icon} size={24} color="#FFFFFF" />
                <Text style={styles.paymentText}>{method.name}</Text>
                {paymentMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#0A84FF" style={styles.checkmark} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Membership Includes</Text>
            {club.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#0A84FF" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.trialSection}>
            <Ionicons name="time-outline" size={24} color="#0A84FF" />
            <Text style={styles.trialText}>
              {club.pricing.trial_days}-day free trial included
            </Text>
          </View>

          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and acknowledge that your subscription will automatically renew. You can cancel anytime.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BlurView intensity={30} style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.footerPrice}>
            ${selectedPlan === 'monthly' ? club.pricing.monthly : (club.pricing.annual / 12).toFixed(2)}
          </Text>
          <Text style={styles.footerPriceLabel}>/month</Text>
        </View>
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  planSection: {
    marginBottom: 30,
  },
  planToggle: {
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
    borderRadius: 16,
    padding: 4,
  },
  planOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 4,
  },
  planSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planName: {
    fontSize: 17,
    color: '#8E8E93',
  },
  planPrice: {
    fontSize: 17,
    color: '#8E8E93',
  },
  planTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  savingsBadge: {
    backgroundColor: '#30D158',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 10,
  },
  savingsText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  paymentSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  paymentText: {
    fontSize: 17,
    color: '#FFFFFF',
    marginLeft: 15,
    flex: 1,
  },
  checkmark: {
    marginLeft: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  trialSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  trialText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  termsSection: {
    marginBottom: 100,
  },
  termsText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(60, 60, 67, 0.29)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerPriceLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 5,
  },
  subscribeButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginLeft: 15,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 