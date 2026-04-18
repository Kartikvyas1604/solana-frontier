use anchor_lang::prelude::*;

#[account]
pub struct Operator {
    pub pubkey: Pubkey,
    pub index: u8,
    pub is_active: bool,
    pub bump: u8,
}

impl Operator {
    pub const LEN: usize = 8 + 32 + 1 + 1 + 1;
}
