import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { HungryDogColors } from '@/constants/colors';
import { DOG_BREEDS } from '@/data/breeds';

import { createDog } from '@/services/dogService';
import { calculateFeeding } from '@/services/feedingService';

export default function AddDogScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState(0);

  // Bruges til at åbne/lukke race-listen.
  const [showBreeds, setShowBreeds] = useState(false);

  const filteredBreeds = DOG_BREEDS.filter((b) =>
    b.toLowerCase().includes(breed.toLowerCase())
  );

  // Value gemmes i backend, mens label kun bruges i UI'et.
  const activityOptions = [
    { label: 'Sedentary', value: '0m' },
    { label: '30 min', value: '30m' },
    { label: '60 min', value: '60m' },
    { label: '90 min', value: '90m' },
    { label: '120 min', value: '120m' },
    { label: '150+ min', value: '150m' },
  ];

  const getTotalMonths = () => {
    // Backend gemmer alder som måneder, så år og måneder samles her.
    return (Number(years) || 0) * 12 + (Number(months) || 0);
  };

  // Dansk komma accepteres i vægtfeltet og laves om til punktum.
  const parseWeight = (value: string) => Number(value.replace(',', '.'));

  const handleSubmit = async () => {
    try {
      if (!name || !weight) {
        alert('Please fill required fields');
        return;
      }

      if (Number(months) > 11) {
        alert('Months must be between 0-11');
        return;
      }

      const totalMonths = getTotalMonths();
      const currentWeight = parseWeight(weight);

      if (!Number.isFinite(currentWeight) || currentWeight <= 0) {
        alert('Weight must be a number above 0');
        return;
      }

      const dogData = {
        name,
        breed,
        ageInMonths: totalMonths,
        currentWeight,
        dailyActivityDuration: activityOptions[activityLevel].value,
      };

      const createdDog = await createDog(dogData);

      try {
        // Første foderberegning laves automatisk, men hunden oprettes stadig hvis den fejler.
        await calculateFeeding(createdDog.id);
      } catch {}

      setName('');
      setYears('');
      setMonths('');
      setBreed('');
      setWeight('');
      setActivityLevel(0);
      router.replace('/(tabs)');

    } catch (error) {
      console.error(error);
      alert('Error creating dog');
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: HungryDogColors.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <ThemedText style={styles.blackText}>
            NEW COMPANION
          </ThemedText>

          <ThemedText style={styles.mainTitle}>
            Start your health tracking
          </ThemedText>
        </View>

        <View style={styles.form}>

          <ThemedText style={styles.label}>
            Dog Name
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Enter dog name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

          <ThemedText style={styles.label}>
            Age
          </ThemedText>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Years"
              placeholderTextColor="#999"
              value={years}
              onChangeText={setYears}
              keyboardType="number-pad"
            />

            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Months"
              placeholderTextColor="#999"
              value={months}
              onChangeText={setMonths}
              keyboardType="number-pad"
            />
          </View>

          <ThemedText style={styles.smallText}>
            Total: {getTotalMonths()} months
          </ThemedText>

          <ThemedText style={styles.label}>
            Breed
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Search breed"
            placeholderTextColor="#999"
            value={breed}
            onChangeText={(text) => {
              setBreed(text);
              setShowBreeds(true);
            }}
          />

          {showBreeds && breed.length > 0 && (
            <View style={styles.dropdown}>
              {filteredBreeds.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setBreed(item);
                    setShowBreeds(false);
                  }}
                >
                  <ThemedText style={styles.blackText}>
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <ThemedText style={styles.label}>
            Weight (kg)
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Enter weight"
            placeholderTextColor="#999"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />

          <ThemedText style={styles.label}>
            Daily Activity
          </ThemedText>

          <View style={styles.rowWrap}>
            {activityOptions.map((option, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActivityLevel(i)}
                style={[
                  styles.activityButton,
                  {
                    backgroundColor:
                      activityLevel === i
                        ? HungryDogColors.primary
                        : '#eee',
                  },
                ]}
              >
                <ThemedText style={styles.blackText}>
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            <ThemedText style={{ color: '#fff' }}>
              Save Dog
            </ThemedText>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: { padding: 20 },

  header: { marginBottom: 20 },

  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },

  form: { gap: 10 },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
  },

  smallText: {
    fontSize: 12,
    color: 'black',
  },

  blackText: {
    color: 'black',
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: 'black',
    backgroundColor: 'white',
  },

  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: 'white',
    maxHeight: 180,
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  activityButton: {
    padding: 10,
    borderRadius: 8,
  },

  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
});
