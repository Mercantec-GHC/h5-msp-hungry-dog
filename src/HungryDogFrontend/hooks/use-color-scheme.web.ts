import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Ved static rendering skal farvetemaet beregnes igen på klienten for web.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    // Efter hydration kan web trygt bruge browserens aktuelle color scheme.
    return colorScheme;
  }

  return 'light';
}
