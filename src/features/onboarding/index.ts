export { OnboardingProvider, useOnboarding } from './OnboardingContext';
export { OnboardingGate } from './OnboardingGate';
export {
  deriveOnboardingState,
  isOnboarded,
  type OnboardingState,
  type OnboardingFacts,
  type OnboardingFactsStatus,
} from './onboardingState';
export {
  classifyConsumerPath,
  resolveGateDecision,
  pickPostOnboardingDestination,
  normalizePath,
  LOGIN_PATH,
  HOME_PATH,
  ONBOARDING_RESOLVER_PATH,
  ONBOARDING_TERMS_PATH,
  ONBOARDING_BIRTH_PATH,
  type GateDecision,
  type PathClass,
  type PostOnboardingDestination,
} from './entryRouting';
export {
  TERMS_VERSION,
  REQUIRED_CONSENTS,
  OPTIONAL_CONSENTS,
  isTermsAccepted,
  type ConsentItem,
  type ConsentFacts,
} from './terms';
