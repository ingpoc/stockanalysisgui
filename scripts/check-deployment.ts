import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
// Load IDLs to get authoritative program IDs
// Note: paths are relative to project root
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LOTTERY_IDL = require('../src/lib/solana/decentralized_lottery.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ROULETTE_IDL = require('../src/lib/solana/decentralized_roulette.json');

const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet');

async function exists(connection: Connection, pubkey: PublicKey): Promise<boolean> {
  const info = await connection.getAccountInfo(pubkey);
  return !!info;
}

async function main() {
  const connection = new Connection(RPC, 'confirmed');

  const lotteryProgramId = new PublicKey(LOTTERY_IDL.address);
  const rouletteProgramId = new PublicKey(ROULETTE_IDL.address);

  const [lotteryGlobalConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from('global_config_v2')],
    lotteryProgramId
  );
  const [rouletteGlobalConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from('global_config_v2')],
    rouletteProgramId
  );

  const [lotteryProgramExists, rouletteProgramExists, lotteryConfigExists, rouletteConfigExists] = await Promise.all([
    exists(connection, lotteryProgramId),
    exists(connection, rouletteProgramId),
    exists(connection, lotteryGlobalConfig),
    exists(connection, rouletteGlobalConfig),
  ]);

  const report = {
    rpc: RPC,
    lottery: {
      programId: lotteryProgramId.toBase58(),
      programAccountExists: lotteryProgramExists,
      globalConfigPDA: lotteryGlobalConfig.toBase58(),
      initialized: lotteryConfigExists,
    },
    roulette: {
      programId: rouletteProgramId.toBase58(),
      programAccountExists: rouletteProgramExists,
      globalConfigPDA: rouletteGlobalConfig.toBase58(),
      initialized: rouletteConfigExists,
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error('check-deployment failed:', e);
  process.exit(1);
});
