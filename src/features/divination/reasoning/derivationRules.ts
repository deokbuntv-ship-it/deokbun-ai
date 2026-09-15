// V4D §28 — THE DERIVATION-RULE REGISTRY.
//
// A persisted proposition names the rule that produced it. V4C validated that the name was a non-empty
// string, which lets a restored graph present a conclusion produced by a rule this kernel does not have:
// nothing can re-derive it, `explainProposition` walks into a rule with no meaning, and the certification
// harness reports UNSUPPORTED for something the verdict already presented to a user as an answer.
//
// The list is assembled from the rule objects themselves, so adding a rule cannot forget to register it.
import { MYUNGRI_RULES } from './myungriRules';
import { CROSS_RULE_IDS } from './crossRules';
import { PRIMITIVE_RULE } from './kernel';

/** Every derivation rule id a valid graph may carry, including the PRIMITIVE non-rule. */
export const ALL_DERIVATION_RULES: readonly string[] = [
  PRIMITIVE_RULE,
  ...MYUNGRI_RULES.map((r) => r.id),
  ...CROSS_RULE_IDS,
];
