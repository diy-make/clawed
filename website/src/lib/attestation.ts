import substrate from "../../substrate.json";

export interface EnclaveAttestation {
  pcr0: string;
  pcr1: string;
  pcr2: string;
}

export function verifyEnclaveAttestation(current: EnclaveAttestation): boolean {
  const expected = (substrate as any).substrate.attestation;
  
  if (!expected) {
    console.error("[ATTESTATION] No expected PCRs found in substrate.json");
    return false;
  }

  const matches = 
    current.pcr0 === expected.pcr0 &&
    current.pcr1 === expected.pcr1 &&
    current.pcr2 === expected.pcr2;

  if (!matches) {
    console.warn("[ATTESTATION] PCR Mismatch detected!");
    console.warn("Expected:", expected);
    console.warn("Received:", current);
  } else {
    console.log("[ATTESTATION] Enclave fingerprint verified.");
  }

  return matches;
}
