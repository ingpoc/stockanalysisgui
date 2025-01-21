import { Program, AnchorProvider, Idl, IdlTypes, IdlAccounts } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { LotteryInfo, LotteryStatus, LotteryType } from '@/types/lottery'
import { AnchorWallet } from '@solana/wallet-adapter-react'

// This will be replaced with actual IDL
const IDL = require('./crypto_lottery_program.json') as ProgramIDL

const PROGRAM_ID = new PublicKey('DRmPDrBUrF1R4Y7tdKRfjFKQPsdQdtvTEbQY5Qp9GzqY')

// Define program types
type ProgramIDL = {
  version: "0.1.0"
  name: "crypto_lottery_program"
  instructions: [
    {
      name: "initializeLottery"
      accounts: [
        { name: "lottery"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ]  
      args: [
        { name: "lotteryType"; type: { defined: "LotteryType" } },
        { name: "ticketPrice"; type: "u64" },
        { name: "startTime"; type: "i64" },
        { name: "endTime"; type: "i64" }
      ]
    },
    {
      name: "buyTicket"
      accounts: [
        { name: "lottery"; isMut: true; isSigner: false },
        { name: "player"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ]
      args: []
    },
    {
      name: "drawWinner"
      accounts: [
        { name: "lottery"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true },
        { name: "winner"; isMut: true; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ]
      args: []
    }
  ]
  accounts: [
    {
      name: "LotteryAccount"
      type: {
        kind: "struct"
        fields: [
          { name: "authority"; type: "publicKey" },
          { name: "pot"; type: "u64" },
          { name: "players"; type: { vec: { defined: "PlayerTicket" } } },
          { name: "winner"; type: { option: "publicKey" } },
          { name: "lotteryType"; type: { defined: "LotteryType" } },
          { name: "ticketPrice"; type: "u64" },
          { name: "startTime"; type: "i64" },
          { name: "endTime"; type: "i64" },
          { name: "status"; type: { defined: "LotteryStatus" } }
        ]
      }
    }
  ]
  types: [
    {
      name: "LotteryType"
      type: {
        kind: "enum"
        variants: [
          { name: "Daily" },
          { name: "Weekly" },
          { name: "Monthly" }
        ]
      }
    },
    {
      name: "LotteryStatus"
      type: {
        kind: "enum"
        variants: [
          { name: "Active" },
          { name: "Completed" }
        ]
      }
    }
  ]
} & Idl

type ProgramAccountTypes = IdlTypes<ProgramIDL>
type LotteryAccount = IdlAccounts<ProgramIDL>["LotteryAccount"]

type ProgramType = Program<ProgramIDL>

type ProgramAccounts = {
  lotteryAccount: {
    type: LotteryAccount;
    name: "LotteryAccount";
  };
};

export class LotteryProgram {
  private program: Program<ProgramIDL>

  constructor(connection: Connection, wallet: AnchorWallet) {
    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    )
    this.program = new Program<ProgramIDL>(IDL, PROGRAM_ID, provider)
  }

  async createLottery(
    type: LotteryType,
    ticketPrice: number,
    startTime: number,
    endTime: number
  ) {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    const [lottery] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('lottery'),
        this.program.provider.publicKey.toBuffer(),
        Buffer.from(startTime.toString())
      ],
      this.program.programId
    )

    return await this.program.methods
      .initializeLottery(type, BigInt(ticketPrice), BigInt(startTime), BigInt(endTime))
      .accounts({
        lottery,
        authority: this.program.provider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  }

  async buyTicket(lotteryAddress: PublicKey) {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    return await this.program.methods
      .buyTicket()
      .accounts({
        lottery: lotteryAddress,
        player: this.program.provider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  }

  async drawWinner(lotteryAddress: PublicKey) {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    return await this.program.methods
      .drawWinner()
      .accounts({
        lottery: lotteryAddress,
        authority: this.program.provider.publicKey,
        winner: this.program.provider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  }

  async getLotteries(): Promise<LotteryInfo[]> {
    const accounts = await (this.program.account as any as ProgramAccounts).lotteryAccount.all()
    return accounts.map((account: { publicKey: PublicKey; account: LotteryAccount }) => ({
      address: account.publicKey.toString(),
      authority: account.account.authority.toString(),
      pot: Number(account.account.pot),
      ticketPrice: Number(account.account.ticketPrice),
      startTime: Number(account.account.startTime),
      endTime: Number(account.account.endTime),
      status: account.account.status,
      type: account.account.lotteryType,
      playerCount: account.account.players.length,
      winner: account.account.winner?.toString(),
    }))
  }
} 