import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { HungryDogColors } from '@/constants/colors';
import { getDogRecommendations } from '@/data/breeds';
import { deleteDog, getDogs, updateDog } from '@/services/dogService';
import { addDogNote, deleteDogNote, getDogNotes } from '@/services/dogNoteService';
import {
  calculateFeeding,
  getLatestFeeding,
  getLatestMealLog,
  getRecentMealLogs,
  logMeal,
  type FeedingRecommendation,
  type MealAmount,
  type MealLog,
  type MealName,
} from '@/services/feedingService';
import { addWeight, getWeightHistory } from '@/services/weightService';
import type { Dog } from '@/types/dog';
import type { DogNote } from '@/types/dogNote';
import type { WeightRecord } from '@/types/weight';

const screenWidth = Dimensions.get('window').width;

const activityOptions = [
  { label: '30 min', value: '30m' },
  { label: '60 min', value: '60m' },
  { label: '90 min', value: '90m' },
  { label: '120 min', value: '120m' },
  { label: '150 min', value: '150m' },
];

const mealOptions: { value: MealAmount; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Half', label: 'Half' },
  { value: 'Small', label: 'Small bit' },
  { value: 'None', label: 'Nothing' },
];

const mealNames: MealName[] = ['Breakfast', 'Dinner'];

// Komma accepteres i input, fordi danske brugere ofte skriver decimaler sådan.
const parseWeight = (value: string) => Number(value.replace(',', '.'));

const getAgeText = (months: number) => {
  // UI'et viser år, mens backend gemmer alderen som måneder.
  const years = months / 12;
  return `${Number.isInteger(years) ? years : years.toFixed(1)} Years`;
};

const getActivityText = (duration: string) => {
  // Backend-værdien er kompakt, og her laves den om til et læsbart label.
  return activityOptions.find((option) => option.value === duration)?.label ?? duration;
};

const splitAge = (months: number) => ({
  // Edit-modal bruger to felter, så total alder splittes igen.
  years: String(Math.floor(months / 12)),
  months: String(months % 12),
});

const formatChartLabel = (dateText: string) => {
  // Chart labels holdes korte, så grafen også passer på små skærme.
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return 'NOW';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
};

export default function StatsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dogId?: string }>();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<number | null>(null);
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [feeding, setFeeding] = useState<FeedingRecommendation | null>(null);
  const [mealAmount, setMealAmount] = useState<MealAmount>('All');
  const [mealName, setMealName] = useState<MealName>('Breakfast');
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [mealMessage, setMealMessage] = useState('Default is All if you skip it.');
  const [notes, setNotes] = useState<DogNote[]>([]);
  const [noteText, setNoteText] = useState('');
  const [loadingDogs, setLoadingDogs] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // Vægt-modal har sin egen state, så den ikke påvirker resten af formularen.
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  // Edit-modal har separate felter, så ændringer først gemmes når brugeren trykker save.
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editYears, setEditYears] = useState('');
  const [editMonths, setEditMonths] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editActivity, setEditActivity] = useState('30m');
  const [savingProfile, setSavingProfile] = useState(false);

  const selectedDog = dogs.find((dog) => dog.id === selectedDogId) ?? null;

  const loadDogs = useCallback(async () => {
    try {
      setLoadingDogs(true);
      const apiDogs = await getDogs();
      setDogs(apiDogs);

      const idFromParams = params.dogId ? Number(params.dogId) : null;
      const dogFromParams = apiDogs.find((dog) => dog.id === idFromParams);

      // Hvis brugeren kommer fra "Vis detaljer", vælges den hund. Ellers beholdes den nuværende hund.
      setSelectedDogId((currentId) => {
        const dogStillExists = apiDogs.find((dog) => dog.id === currentId);
        return dogStillExists?.id ?? dogFromParams?.id ?? apiDogs[0]?.id ?? null;
      });
    } catch (error) {
      console.error(error);
      setDogs([]);
      setSelectedDogId(null);
    } finally {
      setLoadingDogs(false);
    }
  }, [params.dogId]);

  const loadStats = useCallback(async () => {
    if (!selectedDogId) {
      setWeights([]);
      setFeeding(null);
      setMealAmount('All');
      setMealName('Breakfast');
      setMealLogs([]);
      setMealMessage('Default is All if you skip it.');
      setNotes([]);
      return;
    }

    try {
      setLoadingStats(true);
      setWeights(await getWeightHistory(selectedDogId, 6));

      // Nogle hunde har måske ikke fået beregnet anbefaling endnu, så siden må ikke gå ned.
      try {
        setFeeding(await getLatestFeeding(selectedDogId));
      } catch {
        setFeeding(null);
      }

      try {
        const latestMealLog = await getLatestMealLog(selectedDogId);
        setMealAmount(latestMealLog.amountEaten);
        setMealName(latestMealLog.mealName);
        setMealLogs(await getRecentMealLogs(selectedDogId, 7));
        setMealMessage('Default is All if you skip it.');
      } catch {
        setMealAmount('All');
        setMealName('Breakfast');
        setMealLogs([]);
        setMealMessage('Default is All if you skip it.');
      }

      try {
        setNotes(await getDogNotes(selectedDogId));
      } catch {
        setNotes([]);
      }
    } catch (error) {
      console.error(error);
      setWeights([]);
      setFeeding(null);
      setMealAmount('All');
      setMealLogs([]);
      setNotes([]);
    } finally {
      setLoadingStats(false);
    }
  }, [selectedDogId]);

  useFocusEffect(
    useCallback(() => {
      loadDogs();
    }, [loadDogs])
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const chartData = useMemo(() => {
    if (!selectedDog) {
      // Fallback-data gør at grafkomponenten altid får et gyldigt datasæt.
      return { labels: ['NOW', 'NOW'], values: [0, 0] };
    }

    // Grafen skal altid have mindst to punkter, ellers kan chart-biblioteket se tomt ud.
    const records = weights.slice(-6);
    if (records.length === 0) {
      return {
        labels: ['NOW', 'NOW'],
        values: [selectedDog.currentWeight, selectedDog.currentWeight],
      };
    }

    if (records.length === 1) {
      return {
        labels: [formatChartLabel(records[0].recordedAt), 'NOW'],
        values: [Number(records[0].weight), selectedDog.currentWeight],
      };
    }

    return {
      labels: records.map((record) => formatChartLabel(record.recordedAt)),
      values: records.map((record) => Number(record.weight)),
    };
  }, [selectedDog, weights]);

  const recommendations = useMemo(
    // Race- og aldersbaserede anbefalinger beregnes kun igen, når hunden ændrer sig.
    () => (selectedDog ? getDogRecommendations(selectedDog) : []),
    [selectedDog]
  );

  // Disse tal bruges i den korte måltidsstatus på kortet.
  const notAllMeals = mealLogs.filter((log) => log.amountEaten !== 'All').length;
  const todayMealCount = mealLogs.filter((log) => {
    const date = new Date(log.loggedAt);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  }).length;

  const openWeightModal = () => {
    if (!selectedDog) return;
    // Modal starter med den aktuelle vægt, så små rettelser er hurtige.
    setWeightInput(String(selectedDog.currentWeight));
    setShowWeightModal(true);
  };

  const saveWeight = async () => {
    if (!selectedDog) return;
    const newWeight = parseWeight(weightInput);

    if (!Number.isFinite(newWeight) || newWeight <= 0) {
      alert('Weight must be a number above 0');
      return;
    }

    try {
      setSavingWeight(true);
      await addWeight({ dogId: selectedDog.id, weight: newWeight });
      setShowWeightModal(false);
      // Hundeliste og stats genhentes, fordi vægt både påvirker profilkort og graf.
      await loadDogs();
      await loadStats();
    } catch (error) {
      console.error(error);
      alert('Could not save weight');
    } finally {
      setSavingWeight(false);
    }
  };

  const openEditModal = () => {
    if (!selectedDog) return;
    // Den valgte hund kopieres ind i formular-state, så modal kan annulleres uden ændringer.
    const age = splitAge(selectedDog.ageInMonths);
    setEditName(selectedDog.name);
    setEditBreed(selectedDog.breed);
    setEditYears(age.years);
    setEditMonths(age.months);
    setEditWeight(String(selectedDog.currentWeight));
    setEditActivity(selectedDog.dailyActivityDuration);
    setShowEditModal(true);
  };

  const saveProfile = async () => {
    if (!selectedDog) return;
    const months = Number(editMonths) || 0;
    const totalMonths = (Number(editYears) || 0) * 12 + months;
    const newWeight = parseWeight(editWeight);

    if (!editName.trim()) {
      alert('Dog name is required');
      return;
    }

    if (months > 11) {
      alert('Months must be between 0-11');
      return;
    }

    if (!Number.isFinite(newWeight) || newWeight <= 0) {
      alert('Weight must be a number above 0');
      return;
    }

    try {
      setSavingProfile(true);
      const updatedDog = await updateDog(selectedDog.id, {
        name: editName,
        breed: editBreed,
        ageInMonths: totalMonths,
        currentWeight: newWeight,
        dailyActivityDuration: editActivity,
      });

      setDogs((currentDogs) =>
        // Optimistisk opdatering holder UI'et frisk, mens fuld reload sker bagefter.
        currentDogs.map((dog) => (dog.id === updatedDog.id ? updatedDog : dog))
      );

      // Når vægt/alder/aktivitet ændres, beregnes fodringsforslaget igen.
      try {
        await calculateFeeding(selectedDog.id);
      } catch {}

      setShowEditModal(false);
      Alert.alert('Profile saved', 'The dog profile was updated.');
      await loadDogs();
      await loadStats();
    } catch (error) {
      console.error(error);
      alert('Could not save dog profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const confirmMeal = async () => {
    if (!selectedDog) return;

    try {
      setSavingMeal(true);
      await logMeal(selectedDog.id, mealAmount, mealName);
      // Efter registrering hentes de seneste måltider igen, så tællere og historik opdateres.
      setMealLogs(await getRecentMealLogs(selectedDog.id, 7));
      setMealMessage(`Saved ${mealName}: ${mealAmount}`);
    } catch (error) {
      console.error(error);
      setMealMessage('Could not save meal.');
    } finally {
      setSavingMeal(false);
    }
  };

  const saveNote = async () => {
    if (!selectedDog) return;

    if (!noteText.trim()) {
      alert('Write a note first');
      return;
    }

    try {
      setSavingNote(true);
      const createdNote = await addDogNote(selectedDog.id, noteText);
      setNotes((currentNotes) => [createdNote, ...currentNotes]);
      setNoteText('');
    } catch (error) {
      console.error(error);
      alert('Could not save note');
    } finally {
      setSavingNote(false);
    }
  };

  const removeNote = async (noteId: number) => {
    if (!selectedDog) return;

    try {
      await deleteDogNote(selectedDog.id, noteId);
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error(error);
      alert('Could not delete note');
    }
  };

  const handleDelete = async () => {
    if (!selectedDog) return;

    // Sletning kræver confirmation, fordi backend også fjerner historik og noter.
    Alert.alert('Delete dog?', `Delete ${selectedDog.name} and all their logs?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDog(selectedDog.id);
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: HungryDogColors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loadingDogs && (
          <View style={styles.card}>
            <ActivityIndicator color={HungryDogColors.primary} />
          </View>
        )}

        {!loadingDogs && dogs.length === 0 && (
          <View style={styles.card}>
            <ThemedText style={styles.title}>No dogs yet</ThemedText>
            <ThemedText style={styles.muted}>Add a dog first, then stats will show here.</ThemedText>
          </View>
        )}

        {dogs.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selector}>
            {dogs.map((dog) => {
              const active = dog.id === selectedDogId;

              return (
                <TouchableOpacity
                  key={dog.id}
                  style={[styles.selectorButton, active && styles.selectorButtonActive]}
                  onPress={() => setSelectedDogId(dog.id)}
                >
                  <ThemedText style={[styles.selectorText, active && styles.selectorTextActive]}>
                    {dog.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {selectedDog && (
          <>
            <View style={styles.profileCard}>
              <View style={styles.profileIcon}>
                <MaterialIcons name="pets" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.profileText}>
                <ThemedText style={styles.profileName}>{selectedDog.name}</ThemedText>
                <ThemedText style={styles.profileBreed}>{selectedDog.breed}</ThemedText>
              </View>
            </View>

            <View style={styles.weightCard}>
              <View style={styles.cardLabelRow}>
                <MaterialIcons name="scale" size={22} color="#0B6FB8" />
                <ThemedText style={styles.smallCaps}>WEIGHT</ThemedText>
              </View>

              <View style={styles.weightRow}>
                <ThemedText style={styles.weightNumber}>{selectedDog.currentWeight}</ThemedText>
                <ThemedText style={styles.kg}>kg</ThemedText>
              </View>

              <View style={styles.blueTrack}>
                <View style={styles.blueFill} />
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.smallCard}>
                <ThemedText style={styles.smallCaps}>AGE</ThemedText>
                <ThemedText style={styles.bigText}>{getAgeText(selectedDog.ageInMonths)}</ThemedText>
              </View>

              <View style={styles.smallCard}>
                <ThemedText style={styles.smallCaps}>ACTIVITY</ThemedText>
                <ThemedText style={styles.bigText}>{getActivityText(selectedDog.dailyActivityDuration)}</ThemedText>
              </View>
            </View>

            <View style={styles.foodCard}>
              <ThemedText style={styles.foodLabel}>RECOMMENDED FOOD</ThemedText>
              <ThemedText style={styles.foodText}>
                {feeding ? `${Math.round(feeding.dailyCaloriesNeeded)} kcal daily` : 'Calculate feeding to see kcal'}
              </ThemedText>
              <MaterialIcons name="restaurant" size={26} color={HungryDogColors.primary} style={styles.foodIcon} />
            </View>

            <View style={styles.mealCard}>
              <View style={styles.cardLabelRow}>
                <MaterialIcons name="restaurant-menu" size={22} color={HungryDogColors.primary} />
                <ThemedText style={styles.smallCaps}>MEAL TODAY</ThemedText>
              </View>

              <ThemedText style={styles.mealHint}>
                Most dogs eat 2 times a day. Choose meal and confirm.
              </ThemedText>

              <View style={styles.segmentRow}>
                {mealNames.map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={[styles.segmentButton, mealName === name && styles.segmentButtonActive]}
                    onPress={() => setMealName(name)}
                  >
                    <ThemedText style={[styles.segmentText, mealName === name && styles.segmentTextActive]}>
                      {name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.mealOptions}>
                {mealOptions.map((option) => {
                  const active = mealAmount === option.value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.mealButton, active && styles.mealButtonActive]}
                      onPress={() => setMealAmount(option.value)}
                      disabled={savingMeal}
                    >
                      <ThemedText style={[styles.mealButtonText, active && styles.mealButtonTextActive]}>
                        {option.label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.confirmMealButton} onPress={confirmMeal} disabled={savingMeal}>
                <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
                <ThemedText style={styles.confirmMealText}>
                  {savingMeal ? 'Saving...' : 'Confirm Eating Status'}
                </ThemedText>
              </TouchableOpacity>

              <ThemedText style={styles.mealSummary}>
                {mealMessage} Today: {todayMealCount}/2 meals logged. Last 7 days: {notAllMeals} not-all meals.
              </ThemedText>
            </View>

            <View style={styles.recommendationCard}>
              <View style={styles.cardLabelRow}>
                <MaterialIcons name="tips-and-updates" size={22} color="#0B6FB8" />
                <ThemedText style={styles.smallCaps}>RECOMMENDATIONS</ThemedText>
              </View>
              {recommendations.map((item) => (
                <View key={item} style={styles.recommendationRow}>
                  <View style={styles.dot} />
                  <ThemedText style={styles.recommendationText}>{item}</ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.notesCard}>
              <View style={styles.cardLabelRow}>
                <MaterialIcons name="sticky-note-2" size={22} color={HungryDogColors.primary} />
                <ThemedText style={styles.smallCaps}>NOTES</ThemedText>
              </View>

              <ThemedText style={styles.notesHint}>
                Add things you want to remember for {selectedDog.name}.
              </ThemedText>

              <TextInput
                multiline
                onChangeText={setNoteText}
                placeholder="Example: Remember flea treatment next Monday"
                placeholderTextColor="#94A3B8"
                style={styles.noteInput}
                value={noteText}
              />

              <TouchableOpacity style={styles.saveNoteButton} onPress={saveNote} disabled={savingNote}>
                <MaterialIcons name="add-circle" size={18} color="#FFFFFF" />
                <ThemedText style={styles.saveNoteText}>
                  {savingNote ? 'Saving...' : 'Add Note'}
                </ThemedText>
              </TouchableOpacity>

              {notes.length === 0 ? (
                <ThemedText style={styles.noNotesText}>No notes yet.</ThemedText>
              ) : (
                <View style={styles.noteList}>
                  {notes.map((note) => (
                    <View key={note.id} style={styles.noteItem}>
                      <View style={styles.noteTextWrap}>
                        <ThemedText style={styles.noteText}>{note.text}</ThemedText>
                        <ThemedText style={styles.noteDate}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </ThemedText>
                      </View>
                      <TouchableOpacity style={styles.noteDeleteButton} onPress={() => removeNote(note.id)}>
                        <MaterialIcons name="delete-outline" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View>
                  <ThemedText style={styles.historyTitle}>Weight History</ThemedText>
                  <ThemedText style={styles.muted}>New weights appear here after saving</ThemedText>
                </View>
                <View style={styles.goalBadge}>
                  <ThemedText style={styles.goalText}>LAST 6</ThemedText>
                </View>
              </View>

              {loadingStats ? (
                <ActivityIndicator color={HungryDogColors.primary} style={styles.chartLoader} />
              ) : (
                <LineChart
                  data={{
                    labels: chartData.labels,
                    datasets: [{ data: chartData.values }],
                  }}
                  width={Math.max(280, Math.min(520, screenWidth - 44))}
                  height={210}
                  chartConfig={chartConfig}
                  bezier
                  withInnerLines={false}
                  withOuterLines={false}
                  style={styles.chart}
                />
              )}
            </View>

            <TouchableOpacity style={styles.logButton} onPress={openWeightModal}>
              <MaterialIcons name="add-circle" size={21} color="#FFFFFF" />
              <ThemedText style={styles.logText}>Log New Weight</ThemedText>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={openEditModal}>
                <MaterialIcons name="edit" size={16} color={HungryDogColors.textDark} />
                <ThemedText style={styles.secondaryText}>Edit Profile</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <MaterialIcons name="delete-outline" size={17} color="#DC2626" />
                <ThemedText style={styles.deleteText}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={showWeightModal} transparent animationType="fade" onRequestClose={() => setShowWeightModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>Log New Weight</ThemedText>
            <ThemedText style={styles.modalText}>Save a new weight and it will show in the graph.</ThemedText>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setWeightInput}
              placeholder="Weight in kg"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={weightInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowWeightModal(false)}>
                <ThemedText style={styles.cancelText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveWeight} disabled={savingWeight}>
                <ThemedText style={styles.saveText}>{savingWeight ? 'Saving...' : 'Save Weight'}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.editModalWrap}>
            <View style={styles.modalCard}>
              <ThemedText style={styles.modalTitle}>Edit Dog Profile</ThemedText>

              <ThemedText style={styles.inputLabel}>Name</ThemedText>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholderTextColor="#94A3B8" />

              <ThemedText style={styles.inputLabel}>Breed</ThemedText>
              <TextInput style={styles.input} value={editBreed} onChangeText={setEditBreed} placeholderTextColor="#94A3B8" />

              <ThemedText style={styles.inputLabel}>Age</ThemedText>
              <View style={styles.inputRow}>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={setEditYears}
                  placeholder="Years"
                  placeholderTextColor="#94A3B8"
                  style={[styles.input, styles.halfInput]}
                  value={editYears}
                />
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={setEditMonths}
                  placeholder="Months"
                  placeholderTextColor="#94A3B8"
                  style={[styles.input, styles.halfInput]}
                  value={editMonths}
                />
              </View>

              <ThemedText style={styles.inputLabel}>Weight (kg)</ThemedText>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setEditWeight}
                placeholder="Weight"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={editWeight}
              />

              <ThemedText style={styles.inputLabel}>Activity</ThemedText>
              <View style={styles.activityWrap}>
                {activityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.activityButton, editActivity === option.value && styles.activityButtonActive]}
                    onPress={() => setEditActivity(option.value)}
                  >
                    <ThemedText style={[styles.activityButtonText, editActivity === option.value && styles.activityButtonTextActive]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                  <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={savingProfile}>
                  <ThemedText style={styles.saveText}>{savingProfile ? 'Saving...' : 'Save Profile'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: () => '#047857',
  decimalPlaces: 1,
  labelColor: () => '#94A3B8',
  propsForBackgroundLines: {
    strokeWidth: 0,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#047857',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 14,
    padding: 12,
    paddingBottom: 34,
  },
  selector: {
    gap: 8,
    paddingHorizontal: 2,
  },
  selectorButton: {
    backgroundColor: '#FFFFFF',
    borderColor: HungryDogColors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  selectorButtonActive: {
    backgroundColor: HungryDogColors.primary,
    borderColor: HungryDogColors.primary,
  },
  selectorText: {
    color: HungryDogColors.textPrimary,
    fontWeight: '800',
  },
  selectorTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  title: {
    color: HungryDogColors.textDark,
    fontSize: 22,
    fontWeight: '900',
  },
  muted: {
    color: HungryDogColors.textSecondary,
    fontSize: 13,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  profileIcon: {
    alignItems: 'center',
    backgroundColor: HungryDogColors.primary,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    color: HungryDogColors.textDark,
    fontSize: 24,
    fontWeight: '900',
  },
  profileBreed: {
    color: HungryDogColors.secondary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  weightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  cardLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  smallCaps: {
    color: HungryDogColors.textDark,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  weightRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  weightNumber: {
    color: '#020617',
    fontSize: 36,
    fontWeight: '900',
  },
  kg: {
    color: '#020617',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  blueTrack: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 7,
    marginTop: 18,
    overflow: 'hidden',
  },
  blueFill: {
    backgroundColor: '#0B6FB8',
    borderRadius: 999,
    height: 7,
    width: '82%',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 14,
  },
  smallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flex: 1,
    padding: 20,
  },
  bigText: {
    color: '#020617',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 16,
  },
  foodCard: {
    backgroundColor: '#EAF8F0',
    borderColor: '#CFECDC',
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 112,
    padding: 20,
  },
  foodLabel: {
    color: HungryDogColors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  foodText: {
    color: '#143D27',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 29,
    marginTop: 10,
    paddingRight: 32,
  },
  foodIcon: {
    bottom: 18,
    position: 'absolute',
    right: 20,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  mealHint: {
    color: HungryDogColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
  segmentRow: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    marginTop: 14,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    paddingVertical: 10,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    color: HungryDogColors.textSecondary,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: HungryDogColors.textDark,
  },
  mealOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  mealButton: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  mealButtonActive: {
    backgroundColor: '#058B2D',
    borderColor: '#058B2D',
  },
  mealButtonText: {
    color: HungryDogColors.textDark,
    fontSize: 13,
    fontWeight: '900',
  },
  mealButtonTextActive: {
    color: '#FFFFFF',
  },
  confirmMealButton: {
    alignItems: 'center',
    backgroundColor: '#058B2D',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 13,
  },
  confirmMealText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  mealSummary: {
    color: HungryDogColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    gap: 12,
    padding: 20,
  },
  recommendationRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    backgroundColor: HungryDogColors.primary,
    borderRadius: 4,
    height: 8,
    marginTop: 5,
    width: 8,
  },
  recommendationText: {
    color: HungryDogColors.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  notesHint: {
    color: HungryDogColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  noteInput: {
    backgroundColor: '#F8FAFC',
    borderColor: HungryDogColors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: '#020617',
    fontSize: 15,
    minHeight: 84,
    marginTop: 12,
    padding: 12,
    textAlignVertical: 'top',
  },
  saveNoteButton: {
    alignItems: 'center',
    backgroundColor: '#058B2D',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 13,
  },
  saveNoteText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  noNotesText: {
    color: HungryDogColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },
  noteList: {
    gap: 10,
    marginTop: 14,
  },
  noteItem: {
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderColor: HungryDogColors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  noteTextWrap: {
    flex: 1,
  },
  noteText: {
    color: HungryDogColors.textDark,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  noteDate: {
    color: HungryDogColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  noteDeleteButton: {
    alignItems: 'center',
    backgroundColor: '#FDE2E2',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  historyHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: '#020617',
    fontSize: 24,
    fontWeight: '900',
  },
  goalBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  goalText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '900',
  },
  chart: {
    marginLeft: -18,
    marginTop: 22,
  },
  chartLoader: {
    height: 210,
  },
  logButton: {
    alignItems: 'center',
    backgroundColor: '#058B2D',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 18,
  },
  logText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryText: {
    color: HungryDogColors.textDark,
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#FDE2E2',
    borderRadius: 999,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: '900',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  editModalWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    width: '100%',
  },
  modalCard: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    gap: 12,
    maxWidth: 460,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    color: HungryDogColors.textDark,
    fontSize: 22,
    fontWeight: '900',
  },
  modalText: {
    color: HungryDogColors.textSecondary,
    fontSize: 13,
  },
  inputLabel: {
    color: HungryDogColors.textDark,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderColor: HungryDogColors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: '#020617',
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  activityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    backgroundColor: '#F1F5F9',
    borderColor: HungryDogColors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  activityButtonActive: {
    backgroundColor: '#058B2D',
    borderColor: '#058B2D',
  },
  activityButtonText: {
    color: HungryDogColors.textDark,
    fontWeight: '900',
  },
  activityButtonTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    flex: 1,
    paddingVertical: 13,
  },
  cancelText: {
    color: HungryDogColors.textDark,
    fontWeight: '900',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#058B2D',
    borderRadius: 999,
    flex: 1,
    paddingVertical: 13,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
