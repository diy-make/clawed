# 🔱 Technical Report: The Clawed Monster Architecture
**Date:** 2026-02-13
**Session:** 20260213-210755
**Agent:** Ariston.agent (Nonce 296)
**Status:** CLINICALIZED
**Mission:** MISSION-CLAWED-MONSTER-TEE

## 1. Executive Summary: The Sovereign Graft
The **Clawed Monster** is a high-fidelity orchestration layer designed to encapsulate external AI execution (the "Lobster") within a hardened **AWS Nitro Enclave (TEE)**. This architecture shatters the paradigm of "Stateless Chat" by instantiating **Forensics as a Substrate**. 

By synthesizing **ERC-7827 (Value Version Control)**, **ERC-4804 (Web3 URL Translation)**, and **ERC-8128 (Signed HTTP)**, we create a "Sovereign Channel" where every interaction is cryptographically clinicalized, identities are forensically gated via the **SIS-01 Trinity**, and state changes are recorded as immutable "Technical Strikes" on the Heartwood Registry.

---

## 2. The Realization Engine: ERC-7827 + ZK-Confidentiality
The core of the Monster is the **Realization Engine**. Traditionally, blockchain latency (>12s) prevents real-time AI interaction. Our solution is the **Optimistic Forensic Realization**.

### 2.1. The TEE Notary
Realization occurs within the **AWS Nitro Enclave**. The enclave acts as a "Silicon Notary," signing JSON objects at V8 speeds (<10ms). The private key for this identity never leaves the enclave's secure memory, ensuring that even the host administrator cannot forge a realization.

### 2.2. Confidentiality via ZK-Commitment
To maintain the **Confidentiality Mandate**, we utilize a decoupled data model:
1.  **The Public Ledger (ERC-7827):** Holds the **Commitment Hash** and the monotonic nonce. This proves that *work was done* at a specific point in time by a specific agent, without revealing the content of the work.
2.  **The Secure Substrate (TEE/Heartwood):** The raw JSON realization (containing the prompt and response) is stored locally within the enclave's encrypted volume or pushed to a private Heartwood branch.
3.  **ZK-Linkage:** Future iterations will implement **Zero-Knowledge Proofs (ZKPs)** where the TEE generates a proof that the contents of the private realization satisfy the Owockibot Social Contract (e.g., no prohibited actions) without revealing the specific "thoughts" of the AI.

---

## 3. Protocol Stack: The Internet of Blockchains

### 3.1. ERC-4804: The Decentralized Browser
To ensure 10/10 forensic sovereignty, the Clawed Monster integrates **ERC-4804**. This standard allows the `floral.monster` frontend to fetch realizations and enclave states directly from the blockchain using a `web3://` URL schema. 

*   **Logic:** Instead of relying on a centralized REST API that could be censored or taken offline, the dashboard can browse the **Heartwood Registry** directly on-chain. 
*   **Impact:** The "Mind" of the project becomes a decentralized website, where every version-controlled JSON leaf is an accessible, human-readable node.

### 3.2. ERC-8128: Authenticated Agentic Traffic
Communication between the **Clawed Monster Proxy** (the TEE) and the **Active Lobster** (the remote host) is secured via **ERC-8128 (Signed HTTP Requests with Ethereum)**.

*   **Handshake:** The enclave signs every outgoing request to the Lobster using its SIS-01 authorized key.
*   **Verification:** The Lobster instance verifies the Ethereum signature before processing the request. This prevents "Man-in-the-Middle" attacks and ensures that the Lobster only accepts commands from its "Sovereign Wrapper."
*   **Audit:** Every HTTP request becomes a signed artifact that can be replayed for forensic auditing.

---

## 4. The Forensic Pipe: Solving the Latency Trap
To bridge the gap between AI speed and blockchain finality, we implement the **Forensic Pipe**:

1.  **Grafting:** The user's message is intercepted by the `forensic-gate.ts`.
2.  **Realization:** A signed JSON artifact is generated in the TEE and stored in `memory/public/json/forensic_logs`.
3.  **Optimistic Response:** The dashboard displays the AI's response immediately, using the TEE's signature as proof of local finality.
4.  **Batch Anchor:** A background service aggregates 10-50 realizations and executes a single **Write Strike** to the ERC-7827 ledger. This anchors the **State Hash** of the batch, creating a permanent checkpoint.

---

## 5. Deployment Constraints and Hardening
The **Clawed Monster** is protected by **Legislative Seals (.sealed)**. Modifications to the `scripts/build_eif.sh` or the `substrate.json` fingerprints are blocked by the `py/harden_substrate.py` policy engine. 

### Enclave PCR Verification:
The **PCR (Platform Configuration Register)** values (PCR0, PCR1, PCR2) act as the enclave's DNA. Our attestation logic (`src/lib/attestation.ts`) ensures that the `floral.monster` frontend will only render data signed by an enclave whose fingerprints match the Heartwood-anchored expectations.

---

## 6. Conclusion: The Sovereign Result
The Clawed Monster is not a bot; it is a **Clinical Participation Node**. It transforms raw AI compute into a legally and forensically accountable participant in the **Silicon Commons**. By grounding execution in TEE security and ERC-7827 immutability, we have built a system that survives the ephemerality of the cloud.

⚖️ 🔱 🧬
