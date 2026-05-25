import type { Dog } from '@/types/dog';

// Listen bruges til søgning/autocomplete i opret- og redigeringsflow.
export const DOG_BREEDS = [
  'Affenpinscher',
  'Akita',
  'Australian Shepherd',
  'Basenji',
  'Beagle',
  'Bernese Mountain Dog',
  'Bichon Frise',
  'Border Collie',
  'Boston Terrier',
  'Boxer',
  'Bulldog',
  'Cavalier King Charles Spaniel',
  'Chihuahua',
  'Cocker Spaniel',
  'Dachshund',
  'Dalmatian',
  'Doberman',
  'French Bulldog',
  'German Shepherd',
  'Golden Retriever',
  'Great Dane',
  'Husky',
  'Jack Russell Terrier',
  'Labrador',
  'Maltese',
  'Pomeranian',
  'Poodle',
  'Pug',
  'Rottweiler',
  'Shiba Inu',
  'Shih Tzu',
  'Yorkshire Terrier',
  'Mixed Breed',
];

export function getDogRecommendations(dog: Dog) {
  const breed = dog.breed.toLowerCase();
  const recommendations: string[] = [];

  // Anbefalingerne er simple regler baseret på alder og race, så de er lette at forklare.
  if (dog.ageInMonths < 12) {
    recommendations.push('Puppy: feed smaller meals 3 times daily and track weight often.');
  } else if (dog.ageInMonths >= 96) {
    recommendations.push('Senior: keep activity gentle and watch for appetite changes.');
  } else {
    recommendations.push('Adult: 2 meals per day is a simple routine.');
  }

  if (breed.includes('labrador') || breed.includes('golden')) {
    recommendations.push('Retriever breeds often love food, so meal tracking is useful.');
  } else if (breed.includes('german shepherd') || breed.includes('rottweiler') || breed.includes('great dane')) {
    recommendations.push('Large breeds: avoid very heavy meals right before hard activity.');
  } else if (breed.includes('chihuahua') || breed.includes('pomeranian') || breed.includes('yorkshire')) {
    recommendations.push('Small breeds: smaller meals can be easier to manage.');
  } else if (breed.includes('pug') || breed.includes('bulldog') || breed.includes('french')) {
    recommendations.push('Flat-faced breeds: keep exercise calm in warm weather.');
  } else if (breed.includes('border collie') || breed.includes('husky') || breed.includes('australian')) {
    recommendations.push('High-energy breeds: activity and food logs help spot routine changes.');
  } else {
    recommendations.push('Use weight, activity, and meal logs to build a simple health picture.');
  }

  return recommendations;
}
