use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("Insufficient funds in vault")]
    InsufficientFunds,

    #[msg("Invalid shares amount")]
    InvalidShares,

    #[msg("Insufficient operator signatures")]
    InsufficientSignatures,

    #[msg("Invalid operator")]
    InvalidOperator,

    #[msg("Hedge already active")]
    HedgeAlreadyActive,

    #[msg("No active hedge")]
    NoActiveHedge,

    #[msg("Invalid price data")]
    InvalidPrice,

    #[msg("Slippage exceeded maximum threshold")]
    SlippageExceeded,

    #[msg("Emergency mode is active")]
    EmergencyModeActive,

    #[msg("Invalid strategy hash")]
    InvalidStrategyHash,

    #[msg("Execution window has expired")]
    ExecutionWindowExpired,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Invalid vault authority")]
    InvalidAuthority,
}
