use anchor_lang::prelude::*;

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub total_deposited: u64,
    pub total_shares: u64,
    pub paused: bool,
    pub bump: u8,
}

impl Vault {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 1 + 1;
}
