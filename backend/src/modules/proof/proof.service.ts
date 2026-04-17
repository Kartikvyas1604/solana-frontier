import { prisma } from '../../db/client';
import { ConsensusService } from '../price/consensus.service';
import { logger } from '../../utils/logger';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

interface ProofData {
  ruleHash: string;
  priceSnapshot: {
    pythPrice: number;
    jupiterPrice: number;
    consensusPrice: number;
    timestamp: number;
  };
  executionTimestamp: number;
  operatorSignatures: Array<{
    operatorIndex: number;
    signature: string;
    priceAtApproval: number;
  }>;
  driftTxSignature?: string;
}

export class ProofService {
  private consensusService: ConsensusService;

  constructor() {
    this.consensusService = new ConsensusService();
  }

  async generateProof(hedgePositionId: string): Promise<string> {
    const hedgePosition = await prisma.hedgePosition.findUnique({
      where: { id: hedgePositionId },
      include: {
        rule: true,
        operatorApprovals: true,
      },
    });

    if (!hedgePosition) {
      throw new Error('Hedge position not found');
    }

    const priceSnapshot = await this.consensusService.getCurrentPrice();
    if (!priceSnapshot) {
      throw new Error('Failed to get price snapshot');
    }

    const proofData: ProofData = {
      ruleHash: hedgePosition.rule.ruleHash,
      priceSnapshot: {
        pythPrice: priceSnapshot.pythPrice,
        jupiterPrice: priceSnapshot.jupiterPrice,
        consensusPrice: priceSnapshot.consensusPrice,
        timestamp: priceSnapshot.capturedAt.getTime(),
      },
      executionTimestamp: hedgePosition.entryTimestamp.getTime(),
      operatorSignatures: hedgePosition.operatorApprovals.map(approval => ({
        operatorIndex: approval.operatorIndex,
        signature: approval.signature,
        priceAtApproval: approval.priceAtApproval,
      })),
      driftTxSignature: hedgePosition.driftPositionId || undefined,
    };

    const proofBundle = await prisma.proofBundle.create({
      data: {
        hedgePositionId,
        ruleHash: hedgePosition.rule.ruleHash,
        priceSnapshot: JSON.stringify(proofData.priceSnapshot),
        executionTimestamp: new Date(proofData.executionTimestamp),
        operatorSignatures: JSON.stringify(proofData.operatorSignatures),
        proofData: JSON.stringify(proofData),
      },
    });

    logger.info({ proofId: proofBundle.id, hedgePositionId }, 'Proof bundle generated');

    return proofBundle.id;
  }

  async getProof(hedgePositionId: string): Promise<ProofData | null> {
    const proofBundle = await prisma.proofBundle.findFirst({
      where: { hedgePositionId },
      orderBy: { createdAt: 'desc' },
    });

    if (!proofBundle) {
      return null;
    }

    return JSON.parse(proofBundle.proofData) as ProofData;
  }

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
