import { Redirect } from 'expo-router';

export default function Index() {
  // Start-ruten er kun en videresendelse til login-flowet.
  return <Redirect href="/login" />;
}
