import { prisma } from '../../db/client';
import { encrypt, decrypt, hash } from '../../utils/crypto';
import { config } from '../../config';
import { logger } from '../../utils/logger';

interface RuleParams {
  triggerPercent: number;
  hedgePercent: number;
  timeoutMinutes: number;
  referencePrice: number;
}

interface Rule extends RuleParams {
  createdAt: number;
}

export class PolicyService {
  async createRule(walletAddress: string, params: RuleParams): Promise<string> {
    const rule: Rule = {
      ...params,
      createdAt: Date.now(),
    };

    const ruleJson = JSON.stringify(rule);
    const encryptedRule = encrypt(ruleJson, config.ENCRYPTION_KEY);
    const ruleHash = hash(ruleJson);

    await prisma.user.upsert({
      where: { walletAddress },
      create: { walletAddress },
      update: { lastSeen: new Date() },
    });

    await prisma.protectionRule.updateMany({
      where: { walletAddress, status: 'ACTIVE' },
      data: { status: 'INACTIVE' },
    });

    const protectionRule = await prisma.protectionRule.create({
      data: {
        walletAddress,
        encryptedRule,
        ruleHash,
        triggerPercent: params.triggerPercent,
        hedgePercent: params.hedgePercent,
        timeoutMinutes: params.timeoutMinutes,
        status: 'ACTIVE',
      },
    });

    logger.info({ walletAddress, ruleId: protectionRule.id }, 'Protection rule created');

    return protectionRule.id;
  }

  async getActiveRule(walletAddress: string): Promise<{ id: string; rule: Rule } | null> {
    const protectionRule = await prisma.protectionRule.findFirst({
      where: { walletAddress, status: 'ACTIVE' },
    });

    if (!protectionRule) {
      return null;
    }

    try {
      const decryptedRule = decrypt(protectionRule.encryptedRule, config.ENCRYPTION_KEY);
      const rule = JSON.parse(decryptedRule) as Rule;

      return { id: protectionRule.id, rule };
    } catch (error) {
      logger.error({ error, ruleId: protectionRule.id }, 'Failed to decrypt rule');
      return null;
    }
  }

  async deactivateRule(walletAddress: string): Promise<void> {
    await prisma.protectionRule.updateMany({
      where: { walletAddress, status: 'ACTIVE' },
      data: { status: 'INACTIVE' },
    });

    logger.info({ walletAddress }, 'Protection rule deactivated');
  }

  hashRule(params: RuleParams): string {
    const rule: Rule = {
      ...params,
      createdAt: Date.now(),
    };
    return hash(JSON.stringify(rule));
  }
}
