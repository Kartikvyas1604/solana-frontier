use anchor_lang::prelude::*;

use crate::state::Vault;
use crate::events::{HedgeOpened, NAVUpdated};
use crate::errors::VaultError;

#[derive(Accounts)]
pub struct OpenHedge<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    pub authority: Signer<'info>,
}

pub fn handler(
    ctx: Context<OpenHedge>,
    size: u64,
    trigger_price: u64,
    _operator_sigs: [[u8; 64]; 3],
) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let clock = Clock::get()?;

    require!(!vault.active_hedge, VaultError::HedgeAlreadyActive);
    require!(size > 0, VaultError::InvalidShares);

    let mut valid_sigs = 0;
    for sig in _operator_sigs.iter() {
        if sig != &[0u8; 64] {
            valid_sigs += 1;
        }
    }

    require!(
        valid_sigs >= vault.required_signatures,
        VaultError::InsufficientSignatures
    );

    let old_nav = vault.current_nav;
    vault.active_hedge = true;
    vault.hedge_position_size = size;
    vault.last_execution_ts = clock.unix_timestamp;

    emit!(HedgeOpened {
        size,
        trigger_price,
        timestamp: clock.unix_timestamp,
    });

    emit!(NAVUpdated {
        old_nav,
        new_nav: vault.current_nav,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
