import { Redirect } from 'expo-router';

// Deep-link compatibility: 오늘의 운세 now lives inside the 운세 tab (/fortune,
// default period = 오늘). Preserve the earlier /today entry point by redirecting.
export default function TodayRedirect() {
  return <Redirect href="/fortune" />;
}
