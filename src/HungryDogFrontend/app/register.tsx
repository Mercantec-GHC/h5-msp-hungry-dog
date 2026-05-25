import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { HungryDogColors } from '@/constants/colors';

import { register } from '@/services/authService';

export default function RegisterScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      // Frontend stopper de mest almindelige fejl, før requesten sendes til backend.
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !confirmPassword
      ) {
        alert('Fill all fields');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }

      setLoading(true);

      await register({
        firstName,
        lastName,
        email,
        password,
      });

      alert('Account created');

      router.replace('/(tabs)');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Register failed';
      console.log('Register error:', error);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: HungryDogColors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            Create Account
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Register to continue
          </ThemedText>
        </View>

        <View style={styles.form}>

          <View>
            <ThemedText style={styles.label}>
              First Name
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#666"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View>
            <ThemedText style={styles.label}>
              Last Name
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#666"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View>
            <ThemedText style={styles.label}>
              Email
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <ThemedText style={styles.label}>
              Password
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View>
            <ThemedText style={styles.label}>
              Confirm Password
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Loading...' : 'Register'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/login')}
          >
            <ThemedText style={styles.loginText}>
              Already have an account? Login
            </ThemedText>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 24,
  },

  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
  },

  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: '#000',
  },

  form: {
    gap: 16,
  },

  label: {
    marginBottom: 6,
    color: '#000',
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fff',
    color: '#000',
  },

  button: {
    backgroundColor: HungryDogColors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  loginText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#000',
  },
});
