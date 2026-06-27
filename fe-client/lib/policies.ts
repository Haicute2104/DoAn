import { policies } from "@/content/policies";
import { Policy } from "@/types/policy.type";

export function getAllPolicies(): Policy[] {
  return policies;
}

export function getPolicyBySlug(slug: string): Policy | undefined {
  return policies.find((policy) => policy.slug === slug);
}

export function getAllPolicySlugs(): string[] {
  return policies.map((policy) => policy.slug);
}
