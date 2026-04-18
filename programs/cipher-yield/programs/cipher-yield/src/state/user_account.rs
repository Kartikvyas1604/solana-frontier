use anchor_lang::prelude::*;

#[account]
pub struct UserAccount {
    pub owner: Pubkey,
    pub vault: Pubkey,
    pub shares: u64,
    pub deposited_amount: u64,
    pub bump: u8,
}

impl UserAccount {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1;
}
