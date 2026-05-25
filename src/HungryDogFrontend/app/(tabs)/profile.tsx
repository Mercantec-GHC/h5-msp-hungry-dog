import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { HungryDogColors } from '@/constants/colors';
import {
  changePassword,
  fetchCurrentUser,
  getCurrentUser,
  logout,
  updateProfile,
} from '@/services/authService';
import type { User } from '@/types/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Lokal cache vises først, så skærmen føles hurtig.
        const localUser = await getCurrentUser();
        if (localUser) {
          setUser(localUser);
          setFirstName(localUser.firstName);
          setLastName(localUser.lastName);
        }

        // API'et hentes bagefter, så profilen bliver opdateret med nyeste data.
        const apiUser = await fetchCurrentUser();
        setUser(apiUser);
        setFirstName(apiUser.firstName);
        setLastName(apiUser.lastName);
      } catch {
        setUser(null);
      }
    };

    loadUser();
  }, []);

  const handleSaveProfile = async () => {
    // Backend kræver både fornavn og efternavn.
    if (!firstName.trim() || !lastName.trim()) {
      alert('First name and last name are required');
      return;
    }

    try {
      setSavingProfile(true);
      const updatedUser = await updateProfile(firstName, lastName);
      setUser(updatedUser);
      Alert.alert('Profile saved', 'Your name was updated.');
    } catch (error) {
      console.error(error);
      alert('Could not save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    // Password-validering ligger her, så brugeren får feedback før API-kaldet.
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Fill all password fields');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      const result = await changePassword(currentPassword, newPassword);

      if (!result.success) {
        alert(result.message || 'Could not change password');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Password changed', 'You can use the new password next time you log in.');
    } catch (error) {
      console.error(error);
      alert('Could not change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    // Logout fjerner token og sender brugeren tilbage til login.
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: HungryDogColors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Profile</ThemedText>
          <ThemedText style={styles.subtitle}>Manage your account settings.</ThemedText>
        </View>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={28} color="#FFFFFF" />
          </View>

          <View style={styles.userInfo}>
            <ThemedText style={styles.name}>
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </ThemedText>
            <ThemedText style={styles.email}>{user?.email ?? 'No email saved'}</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="edit" size={22} color={HungryDogColors.primary} />
            <ThemedText style={styles.cardTitle}>Edit Name</ThemedText>
          </View>

          <ThemedText style={styles.label}>First Name</ThemedText>
          <TextInput
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={firstName}
          />

          <ThemedText style={styles.label}>Last Name</ThemedText>
          <TextInput
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={lastName}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={savingProfile}>
            <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
            <ThemedText style={styles.saveButtonText}>
              {savingProfile ? 'Saving...' : 'Save Name'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="lock" size={22} color={HungryDogColors.primary} />
            <ThemedText style={styles.cardTitle}>Change Password</ThemedText>
          </View>

          <ThemedText style={styles.label}>Current Password</ThemedText>
          <TextInput
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={styles.input}
            value={currentPassword}
          />

          <ThemedText style={styles.label}>New Password</ThemedText>
          <TextInput
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={styles.input}
            value={newPassword}
          />

          <ThemedText style={styles.label}>Confirm New Password</ThemedText>
          <TextInput
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={savingPassword}>
            <MaterialIcons name="vpn-key" size={18} color="#FFFFFF" />
            <ThemedText style={styles.saveButtonText}>
              {savingPassword ? 'Saving...' : 'Change Password'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
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
    gap: 16,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    color: HungryDogColors.textDark,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: HungryDogColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  userCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: HungryDogColors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: HungryDogColors.primary,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: HungryDogColors.textDark,
    fontSize: 20,
    fontWeight: '900',
  },
  email: {
    color: HungryDogColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: HungryDogColors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  cardTitle: {
    color: HungryDogColors.textDark,
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    color: HungryDogColors.textDark,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: HungryDogColors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: HungryDogColors.textDark,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#058B2D',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FDE2E2',
    borderRadius: 999,
    paddingVertical: 15,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '900',
  },
});
