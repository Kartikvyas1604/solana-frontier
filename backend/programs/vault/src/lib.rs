use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("VauLt11111111111111111111111111111111111111");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.total_deposits = 0;
        vault.total_shares = 0;
        vault.bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::InvalidAmount);

        let vault = &mut ctx.accounts.vault;

        let shares = if vault.total_shares == 0 {
            amount
        } else {
            (amount as u128)
                .checked_mul(vault.total_shares as u128)
                .unwrap()
                .checked_div(vault.total_deposits as u128)
                .unwrap() as u64
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.vault_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        let user_position = &mut ctx.accounts.user_position;
        user_position.owner = ctx.accounts.user.key();
        user_position.shares = user_position.shares.checked_add(shares).unwrap();
        user_position.deposited_amount = user_position.deposited_amount.checked_add(amount).unwrap();

        vault.total_deposits = vault.total_deposits.checked_add(amount).unwrap();
        vault.total_shares = vault.total_shares.checked_add(shares).unwrap();

        emit!(DepositEvent {
            user: ctx.accounts.user.key(),
            amount,
            shares,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, shares: u64) -> Result<()> {
        require!(shares > 0, VaultError::InvalidAmount);

        let user_position = &mut ctx.accounts.user_position;
        require!(user_position.shares >= shares, VaultError::InsufficientShares);

        let vault = &ctx.accounts.vault;
        let amount = (shares as u128)
            .checked_mul(vault.total_deposits as u128)
            .unwrap()
            .checked_div(vault.total_shares as u128)
            .unwrap() as u64;

        let seeds = &[
            b"vault",
            vault.authority.as_ref(),
            &[vault.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        user_position.shares = user_position.shares.checked_sub(shares).unwrap();

        let vault = &mut ctx.accounts.vault;
        vault.total_deposits = vault.total_deposits.checked_sub(amount).unwrap();
        vault.total_shares = vault.total_shares.checked_sub(shares).unwrap();

        emit!(WithdrawEvent {
            user: ctx.accounts.user.key(),
            amount,
            shares,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn get_user_balance(ctx: Context<GetUserBalance>) -> Result<u64> {
        let user_position = &ctx.accounts.user_position;
        let vault = &ctx.accounts.vault;

        if vault.total_shares == 0 {
            return Ok(0);
        }

        let balance = (user_position.shares as u128)
            .checked_mul(vault.total_deposits as u128)
            .unwrap()
            .checked_div(vault.total_shares as u128)
            .unwrap() as u64;

        Ok(balance)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserPosition::INIT_SPACE,
        seeds = [b"position", vault.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [b"position", vault.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct GetUserBalance<'info> {
    pub vault: Account<'info, Vault>,
    pub user_position: Account<'info, UserPosition>,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub authority: Pubkey,
    pub total_deposits: u64,
    pub total_shares: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserPosition {
    pub owner: Pubkey,
    pub shares: u64,
    pub deposited_amount: u64,
}

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub shares: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub shares: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum VaultError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient shares")]
    InsufficientShares,
}
