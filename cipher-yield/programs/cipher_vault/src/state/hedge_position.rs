use anchor_lang::prelude::*;

#[account]
pub struct HedgePosition {
    pub vault: Pubkey,
    pub size: u64,
    pub entry_price: u64,
    pub opened_at: i64,
    pub closed_at: i64,
    pub pnl: i64,
    pub is_active: bool,
    pub bump: u8,
}

impl HedgePosition {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 1;
}
