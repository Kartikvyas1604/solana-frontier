use anchor_lang::prelude::*;

#[account]
pub struct UserPosition {
    pub owner: Pubkey,
    pub vault: Pubkey,
    pub shares: u64,
    pub deposited_amount: u64,
    pub deposit_timestamp: i64,
    pub strategy_rule_hash: [u8; 32],
    pub bump: u8,
}

impl UserPosition {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 32 + 1;
}
