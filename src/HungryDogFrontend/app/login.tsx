import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { HungryDogColors } from '@/constants/colors';
import { login } from '@/services/authService';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      // Simpel klient-validering før API'et kaldes.
      if (!email || !password) {
        alert('Fill all fields');
        return;
      }

      setLoading(true);

      const result = await login(email, password);

      if (!result.success) {
        // Backend kan returnere en konkret fejlbesked, fx forkert login.
        alert(result.message || 'Login failed');
        return;
      }

      // replace forhindrer at brugeren kan gå tilbage til login med back-knappen.
      router.replace('/(tabs)');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.log(error);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: HungryDogColors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <MaterialIcons name="pets" size={24} color="#058B2D" />
          <ThemedText style={styles.brandText}>HUNGRY DOG</ThemedText>
        </View>

        <View style={styles.hero}>
          <ThemedText style={styles.title}>Welcome to Hungry Dog</ThemedText>
          <ThemedText style={styles.subtitle}>Continue your pet's wellness journey.</ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <ThemedText style={styles.label}>EMAIL ADDRESS</ThemedText>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="curator@hungrydog.com"
              placeholderTextColor="#8B949E"
              style={styles.input}
              value={email}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.passwordLabelRow}>
              <ThemedText style={styles.label}>PASSWORD</ThemedText>
              <ThemedText style={styles.forgotText}>Forgot?</ThemedText>
            </View>

            <TextInput
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#8B949E"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          <TouchableOpacity
            disabled={loading}
            onPress={handleLogin}
            style={[styles.button, loading && styles.buttonDisabled]}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Loading...' : 'Login'}
            </ThemedText>
            {!loading && <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerRow} onPress={() => router.push('/register')}>
          <ThemedText style={styles.registerMuted}>New to the pack?</ThemedText>
          <ThemedText style={styles.registerLink}> Create account</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    maxWidth: 460,
    padding: 18,
    paddingBottom: 34,
    width: '100%',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 6,
  },
  brandText: {
    color: '#058B2D',
    fontSize: 17,
    fontWeight: '900',
  },
  hero: {
    marginTop: 18,
  },
  title: {
    color: '#202124',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    elevation: 4,
    gap: 18,
    marginTop: 28,
    padding: 28,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#3F463F',
    fontSize: 12,
    fontWeight: '900',
  },
  passwordLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forgotText: {
    color: '#0B6FB8',
    fontSize: 12,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    color: '#111827',
    fontSize: 16,
    minHeight: 58,
    paddingHorizontal: 18,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#1F9A3B',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 58,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  registerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  registerMuted: {
    color: '#4B5563',
    fontSize: 15,
  },
  registerLink: {
    color: '#058B2D',
    fontSize: 15,
    fontWeight: '900',
  },
});
