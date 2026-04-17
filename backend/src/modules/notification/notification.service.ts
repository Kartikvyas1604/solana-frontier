import { logger } from '../utils/logger';

interface NotificationPayload {
  walletAddress: string;
  event: string;
  data: any;
}

export class NotificationService {
  async notify(payload: NotificationPayload): Promise<void> {
    logger.info({ payload }, 'Notification sent');
  }

  async notifyHedgeOpened(walletAddress: string, hedgePositionId: string, entryPrice: number): Promise<void> {
    await this.notify({
      walletAddress,
      event: 'HEDGE_OPENED',
      data: { hedgePositionId, entryPrice },
    });
  }

  async notifyHedgeClosed(walletAddress: string, hedgePositionId: string, pnl: number): Promise<void> {
    await this.notify({
      walletAddress,
      event: 'HEDGE_CLOSED',
      data: { hedgePositionId, pnl },
    });
  }

  async notifyRuleTriggered(walletAddress: string, ruleId: string, currentPrice: number): Promise<void> {
    await this.notify({
      walletAddress,
      event: 'RULE_TRIGGERED',
      data: { ruleId, currentPrice },
    });
  }
}
