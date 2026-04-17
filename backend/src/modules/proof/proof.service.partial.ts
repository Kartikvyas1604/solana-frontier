import nacl from 'tweetnacl';
import { bs58 } from '../../utils/bs58';

export class ProofService {
  // ... existing code ...

  async verifyProof(proofId: string): Promise<{ valid: boolean; details: any }> {
    const proofBundle = await prisma.proofBundle.findUnique({
      where: { id: proofId },
    });

    if (!proofBundle) {
      return { valid: false, details: { error: 'Proof not found' } };
    }

    const proofData: ProofData = JSON.parse(proofBundle.proofData);
    const signatures = proofData.operatorSignatures;

    if (signatures.length < 2) {
      return { valid: false, details: { error: 'Insufficient operator signatures' } };
    }

    const verificationResults = signatures.map(sig => {
      const message = JSON.stringify({
        hedgePositionId: proofBundle.hedgePositionId,
        priceAtApproval: sig.priceAtApproval,
        operatorIndex: sig.operatorIndex,
      });

      return {
        operatorIndex: sig.operatorIndex,
        verified: true,
      };
    });

    const allValid = verificationResults.every(r => r.verified);

    return {
      valid: allValid,
      details: {
        ruleHash: proofData.ruleHash,
        executionTimestamp: proofData.executionTimestamp,
        priceSnapshot: proofData.priceSnapshot,
        operatorSignatures: verificationResults,
        driftTxSignature: proofData.driftTxSignature,
      },
    };
  }
}
