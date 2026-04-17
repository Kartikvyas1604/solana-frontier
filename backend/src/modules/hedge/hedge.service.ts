import { prisma } from '../../db/client';
import { DriftService } from './drift.service';
import { OperatorService } from '../operator/operator.service';
import { PolicyService } from '../policy/policy.service';
import { ProofService } from '../proof/proof.service';
import { ConsensusService } from '../price/consensus.service';
import { logger } from '../../utils/logger';

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export class HedgeService {
  private driftService: DriftService;
  private operatorService: OperatorService;
  private policyService: PolicyService;
  private proofService: ProofService;
  private consensusService: ConsensusService;

  constructor() {
    this.driftService = new DriftService();
    this.operatorService = new OperatorService();
    this.policyService = new PolicyService();
    this.proofService = new ProofService();
    this.consensusService = new ConsensusService();
  }

  async initialize(): Promise<void> {
    await this.driftService.initialize();
  }

  async openHedge(walletAddress: string): Promise<Result<string>> {
    try {
      const ruleData = await this.policyService.getActiveRule(walletAddress);
      if (!ruleData) {
        return { ok: false, error: new Error('RULE_NOT_FOUND') };
      }

      const priceSnapshot = await this.consensusService.getCurrentPrice();
      if (!priceSnapshot || !priceSnapshot.isValid) {
        return { ok: false, error: new Error('PRICE_CONSENSUS_FAILED') };
      }

      const vaultPosition = await prisma.vaultPosition.findFirst({
        where: { walletAddress, status: 'ACTIVE' },
      });

      if (!vaultPosition) {
        return { ok: false, error: new Error('VAULT_NOT_FOUND') };
      }

      const shortSize = vaultPosition.solAmount * (ruleData.rule.hedgePercent / 100);

      const hedgePosition = await prisma.hedgePosition.create({
        data: {
          ruleId: ruleData.id,
          walletAddress,
          entryPrice: priceSnapshot.consensusPrice,
          shortSizeSol: shortSize,
          status: 'OPEN',
        },
      });

      const hasQuorum = await this.operatorService.requestApprovals(
        hedgePosition.id,
        priceSnapshot.consensusPrice,
        walletAddress
      );

      if (!hasQuorum) {
        await prisma.hedgePosition.update({
          where: { id: hedgePosition.id },
          data: { status: 'FAILED', closeReason: 'APPROVAL_TIMEOUT' },
        });
        return { ok: false, error: new Error('APPROVAL_TIMEOUT') };
      }

      const driftResult = await this.driftService.openShortPosition(shortSize);
      if (!driftResult.ok) {
        await prisma.hedgePosition.update({
          where: { id: hedgePosition.id },
          data: { status: 'FAILED', closeReason: 'DRIFT_EXECUTION_FAILED' },
        });
        return { ok: false, error: new Error('DRIFT_EXECUTION_FAILED') };
      }

      await prisma.hedgePosition.update({
        where: { id: hedgePosition.id },
        data: { driftPositionId: driftResult.value },
      });

      await this.proofService.generateProof(hedgePosition.id);

      await prisma.protectionRule.update({
        where: { id: ruleData.id },
        data: { status: 'TRIGGERED' },
      });

      logger.info({ hedgePositionId: hedgePosition.id, walletAddress }, 'Hedge opened successfully');

      return { ok: true, value: hedgePosition.id };
    } catch (error: any) {
      logger.error({ error, walletAddress }, 'Failed to open hedge');
      return { ok: false, error };
    }
  }

  async closeHedge(hedgePositionId: string, reason: string): Promise<Result<void>> {
    try {
      const hedgePosition = await prisma.hedgePosition.findUnique({
        where: { id: hedgePositionId },
      });

      if (!hedgePosition || hedgePosition.status !== 'OPEN') {
        return { ok: false, error: new Error('Hedge position not found or already closed') };
      }

      if (hedgePosition.driftPositionId) {
        const closeResult = await this.driftService.closePosition(hedgePosition.driftPositionId);
        if (!closeResult.ok) {
          logger.error({ hedgePositionId }, 'Failed to close Drift position');
        }
      }

      const fundingResult = await this.getFundingAccrued(hedgePositionId);
      const fundingCost = fundingResult.ok ? fundingResult.value : 0;

      const currentPrice = await this.consensusService.getCurrentPrice();
      const pnl = currentPrice
        ? (hedgePosition.entryPrice - currentPrice.consensusPrice) * hedgePosition.shortSizeSol
        : 0;

      await prisma.hedgePosition.update({
        where: { id: hedgePositionId },
        data: {
          status: 'CLOSED',
          closeReason: reason,
          closeTimestamp: new Date(),
          fundingPaidTotal: fundingCost,
          realizedPnl: pnl - fundingCost,
        },
      });

      logger.info({ hedgePositionId, reason, pnl }, 'Hedge closed successfully');

      return { ok: true, value: undefined };
    } catch (error: any) {
      logger.error({ error, hedgePositionId }, 'Failed to close hedge');
      return { ok: false, error };
    }
  }

  async getFundingAccrued(hedgePositionId: string): Promise<Result<number>> {
    try {
      const hedgePosition = await prisma.hedgePosition.findUnique({
        where: { id: hedgePositionId },
      });

      if (!hedgePosition || !hedgePosition.driftPositionId) {
        return { ok: false, error: new Error('Hedge position not found') };
      }

      return await this.driftService.getFundingCost(hedgePosition.driftPositionId);
    } catch (error: any) {
      logger.error({ error, hedgePositionId }, 'Failed to get funding accrued');
      return { ok: false, error };
    }
  }

  async disconnect(): Promise<void> {
    await this.driftService.disconnect();
    await this.consensusService.disconnect();
  }
}
