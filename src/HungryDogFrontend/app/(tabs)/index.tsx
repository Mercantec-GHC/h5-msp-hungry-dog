import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { HungryDogColors } from '@/constants/colors';
import { getDogs } from '@/services/dogService';
import { getLatestFeeding } from '@/services/feedingService';
import type { Dog } from '@/types/dog';

type DogCard = Dog & { calories?: number };

const getActivityText = (duration: string) => {
  // Korte labels gør aktivitetsniveauet nemt at scanne på hundekortet.
  if (duration === '0m') return 'Low';
  if (duration === '30m') return 'Calm';
  if (duration === '60m') return 'Normal';
  return 'High';
};

export default function HomeScreen() {
  const router = useRouter();
  const [dogs, setDogs] = useState<DogCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDogs = useCallback(async () => {
    try {
      setLoading(true);
      const apiDogs: DogCard[] = await getDogs();

      // Forsiden viser lidt ekstra data pr. hund, men virker stadig hvis en anbefaling ikke findes endnu.
      for (const dog of apiDogs) {
        try {
          const feeding = await getLatestFeeding(dog.id);
          dog.calories = Math.round(feeding.dailyCaloriesNeeded);
        } catch {}
      }

      setDogs(apiDogs);
    } catch (error) {
      console.error(error);
      setDogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDogs();
    }, [fetchDogs])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: HungryDogColors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="pets" size={18} color="#fff" />
          </View>
          <View style={styles.brandText}>
            <ThemedText style={styles.brand}>THE VITALITY CURATOR</ThemedText>
            <ThemedText style={styles.welcome}>Welcome back</ThemedText>
          </View>
          <MaterialIcons name="notifications" size={18} color={HungryDogColors.primary} />
        </View>

        <View style={styles.header}>
          <ThemedText style={styles.title}>Your Dogs</ThemedText>
          <ThemedText style={styles.subtitle}>
            Curated health insights for your companions.
          </ThemedText>
        </View>

        {loading && (
          <View style={styles.emptyState}>
            <ActivityIndicator color={HungryDogColors.primary} />
            <ThemedText style={styles.emptyText}>Loading dogs...</ThemedText>
          </View>
        )}

        {!loading && dogs.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="pets" size={30} color={HungryDogColors.primary} />
            <ThemedText style={styles.emptyTitle}>No dogs yet</ThemedText>
            <ThemedText style={styles.emptyText}>Add your first dog to see it here.</ThemedText>
          </View>
        )}

        {dogs.map((dog) => (
          <View key={dog.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.badge}>PRIME VITALITY</ThemedText>
              <View style={styles.iconBox}>
                <MaterialIcons name="pets" size={28} color={HungryDogColors.primary} />
              </View>
            </View>

            <ThemedText style={styles.name}>{dog.name}</ThemedText>
            <ThemedText style={styles.breed}>{dog.breed}</ThemedText>

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>Weight management</ThemedText>
                <ThemedText style={styles.weight}>{dog.currentWeight} kg</ThemedText>
                <View style={styles.progressTrack}>
                  <View style={styles.progressFill} />
                </View>
              </View>

              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>Activity level</ThemedText>
                <View style={styles.activityLine}>
                  <MaterialIcons name="trending-up" size={18} color={HungryDogColors.primary} />
                  <ThemedText style={styles.activityText}>
                    {getActivityText(dog.dailyActivityDuration)}
                  </ThemedText>
                </View>
                <ThemedText style={styles.miniText}>
                  {dog.calories ? `${dog.calories} kcal/day` : 'No food data yet'}
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/stats',
                  params: { dogId: String(dog.id) },
                })
              }
            >
              <ThemedText style={styles.detailsText}>VIEW DETAILS</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notesButton}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/stats',
                  params: { dogId: String(dog.id) },
                })
              }
            >
              <MaterialIcons name="sticky-note-2" size={16} color={HungryDogColors.primary} />
              <ThemedText style={styles.notesText}>NOTES</ThemedText>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addFamilyCard}>
          <ThemedText style={styles.addFamilyTitle}>Expand the Family?</ThemedText>
          <ThemedText style={styles.addFamilyText}>
            Add a new companion to track their vitality and wellness journeys.
          </ThemedText>

          <TouchableOpacity
            style={styles.addDogButton}
            onPress={() => router.push('/(tabs)/add-dog')}
          >
            <MaterialIcons name="add-circle" size={18} color="#FFFFFF" />
            <ThemedText style={styles.addDogText}>ADD NEW DOG</ThemedText>
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
    padding: 20,
    paddingBottom: 36,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: HungryDogColors.surface,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  logoCircle: {
    alignItems: 'center',
    backgroundColor: HungryDogColors.primary,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  brandText: {
    flex: 1,
  },
  brand: {
    color: HungryDogColors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  welcome: {
    color: HungryDogColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  header: {
    marginBottom: 14,
  },
  title: {
    color: HungryDogColors.textDark,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: HungryDogColors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: HungryDogColors.surface,
    borderColor: HungryDogColors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 24,
  },
  emptyTitle: {
    color: HungryDogColors.textDark,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: HungryDogColors.textSecondary,
    fontSize: 13,
  },
  card: {
    backgroundColor: HungryDogColors.surface,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#E7F6EC',
    borderRadius: 999,
    color: HungryDogColors.primary,
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  name: {
    color: HungryDogColors.textDark,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  breed: {
    color: HungryDogColors.secondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    color: HungryDogColors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  weight: {
    color: HungryDogColors.textDark,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  progressTrack: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    height: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: HungryDogColors.primary,
    height: 4,
    width: '68%',
  },
  activityLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },
  activityText: {
    color: HungryDogColors.textDark,
    fontSize: 18,
    fontWeight: '800',
  },
  miniText: {
    color: HungryDogColors.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },
  detailsButton: {
    alignItems: 'center',
    backgroundColor: '#058B2D',
    borderRadius: 999,
    marginTop: 18,
    paddingVertical: 12,
  },
  detailsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  notesButton: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderColor: HungryDogColors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
  notesText: {
    color: HungryDogColors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  addFamilyCard: {
    alignItems: 'center',
    borderColor: HungryDogColors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: 10,
    marginTop: 6,
    padding: 22,
  },
  addFamilyTitle: {
    color: HungryDogColors.textDark,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  addFamilyText: {
    color: HungryDogColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  addDogButton: {
    alignItems: 'center',
    backgroundColor: '#058B2D',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  addDogText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
