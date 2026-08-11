import { Redirect } from 'expo-router';

// Deep-link compatibility: the former 운세 우편함 (/records) is now the
// 운세우편함 bottom tab (/inbox) in the FINAL 4-tab IA. Redirect to preserve it.
export default function RecordsRedirect() {
  return <Redirect href="/inbox" />;
}
