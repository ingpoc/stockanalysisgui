import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { 
  LOTTERY_PROGRAM_ID, 
  ROULETTE_PROGRAM_ID,
  GLOBAL_CONFIG_SEED,
  ROULETTE_GLOBAL_CONFIG_SEED,
  LOTTERY_SEED,
  ROULETTE_SEED,
  ROULETTE_BET_SEED,
  TICKET_SEED,
} from '@/lib/constants';

// Lottery PDAs
export function getLotteryGlobalConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_CONFIG_SEED)],
    new PublicKey(LOTTERY_PROGRAM_ID)
  );
}

export function getLotteryPDA(creator: PublicKey, nonce: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(LOTTERY_SEED),
      creator.toBuffer(),
      new BN(nonce).toArrayLike(Buffer, 'le', 8)
    ],
    new PublicKey(LOTTERY_PROGRAM_ID)
  );
}

export function getTicketPDA(lottery: PublicKey, ticketId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(TICKET_SEED),
      lottery.toBuffer(),
      new BN(ticketId).toArrayLike(Buffer, 'le', 8)
    ],
    new PublicKey(LOTTERY_PROGRAM_ID)
  );
}

// Roulette PDAs
export function getRouletteGlobalConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ROULETTE_GLOBAL_CONFIG_SEED)],
    new PublicKey(ROULETTE_PROGRAM_ID)
  );
}

export function getRoulettePDA(creator: PublicKey, nonce: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(ROULETTE_SEED),
      creator.toBuffer(),
      new BN(nonce).toArrayLike(Buffer, 'le', 8)
    ],
    new PublicKey(ROULETTE_PROGRAM_ID)
  );
}

export function getBetPDA(roulette: PublicKey, betId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(ROULETTE_BET_SEED),
      roulette.toBuffer(),
      new BN(betId).toArrayLike(Buffer, 'le', 8)
    ],
    new PublicKey(ROULETTE_PROGRAM_ID)
  );
}

// Associated Token Account helpers
export async function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
  programId: PublicKey = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
): Promise<PublicKey> {
  const [address] = await PublicKey.findProgramAddress(
    [
      owner.toBuffer(),
      programId.toBuffer(),
      mint.toBuffer(),
    ],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  );
  return address;
}

// Validation helpers
export function validatePubkey(pubkey: string): boolean {
  try {
    new PublicKey(pubkey);
    return true;
  } catch {
    return false;
  }
}

export function validatePDA(pda: [PublicKey, number]): boolean {
  return pda[0] instanceof PublicKey && typeof pda[1] === 'number' && pda[1] >= 0 && pda[1] <= 255;
}