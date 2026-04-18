use anchor_lang::prelude::*;

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub usdc_mint: Pubkey,
    pub vault_usdc_account: Pubkey,
    pub share_mint: Pubkey,
    pub total_assets: u64,
    pub total_shares: u64,
    pub strategy_hash: [u8; 32],
    pub last_execution_ts: i64,
    pub active_hedge: bool,
    pub hedge_position_size: u64,
    pub peak_nav: u64,
    pub current_nav: u64,
    pub operator_1: Pubkey,
    pub operator_2: Pubkey,
    pub operator_3: Pubkey,
    pub required_signatures: u8,
    pub emergency_exit_enabled: bool,
    pub bump: u8,
}

impl Vault {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 8 + 8 + 32 + 8 + 1 + 8 + 8 + 8 + 32 + 32 + 32 + 1 + 1 + 1;
}
