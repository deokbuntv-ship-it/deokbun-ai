import { Redirect } from 'expo-router';

// Deep-link compatibility only. The FINAL 4-tab IA has no standalone 오늘의 운세
// screen; personalized fortune surfaces live under 운세우편함. Redirect to Home.
export default function TodayRedirect() {
  return <Redirect href="/" />;
}
