use anchor_lang::prelude::*;

#[error_code]
pub enum CipherYieldError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Vault is paused")]
    VaultPaused,
}
