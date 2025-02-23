/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `src/lib/solana/decentralized_lottery.json`.
 */
export type DecentralizedLottery = {
  "address": "7MTSfGTiXNH4ZGztQPdvzpkKivUEUzQhJvsccJFDEMyt",
  "metadata": {
    "name": "decentralizedLottery",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyTicket",
      "discriminator": [
        11,
        24,
        17,
        193,
        168,
        116,
        164,
        169
      ],
      "accounts": [
        {
          "name": "lotteryAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "lottery_account.lottery_type",
                "account": "lotteryAccount"
              },
              {
                "kind": "account",
                "path": "lottery_account.draw_time",
                "account": "lotteryAccount"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "lotteryTokenAccount",
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "numberOfTickets",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createLottery",
      "discriminator": [
        242,
        165,
        247,
        119,
        17,
        203,
        21,
        42
      ],
      "accounts": [
        {
          "name": "lotteryAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "lotteryTypeEnum"
              },
              {
                "kind": "arg",
                "path": "drawTime"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "lotteryTypeEnum",
          "type": {
            "defined": {
              "name": "lotteryType"
            }
          }
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "drawTime",
          "type": "i64"
        },
        {
          "name": "prizePool",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "globalConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "globalConfig",
      "discriminator": [
        149,
        8,
        156,
        202,
        160,
        252,
        176,
        217
      ]
    },
    {
      "name": "lotteryAccount",
      "discriminator": [
        1,
        165,
        125,
        59,
        215,
        12,
        246,
        7
      ]
    }
  ],
  "events": [
    {
      "name": "lotteryCreated",
      "discriminator": [
        162,
        18,
        70,
        148,
        241,
        124,
        57,
        74
      ]
    },
    {
      "name": "ticketPurchased",
      "discriminator": [
        108,
        59,
        246,
        95,
        84,
        145,
        13,
        71
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unsupportedLotteryType",
      "msg": "Lottery type not supported"
    },
    {
      "code": 6001,
      "name": "invalidTicketPrice",
      "msg": "Invalid ticket price"
    },
    {
      "code": 6002,
      "name": "invalidPrizePool",
      "msg": "Invalid prize pool"
    },
    {
      "code": 6003,
      "name": "invalidDrawTime",
      "msg": "Lottery draw time invalid"
    },
    {
      "code": 6004,
      "name": "invalidTicketAmount",
      "msg": "Ticket purchase amount invalid"
    },
    {
      "code": 6005,
      "name": "ticketPurchaseLimitReached",
      "msg": "Ticket purchase limit reached"
    },
    {
      "code": 6006,
      "name": "lotteryNotOpen",
      "msg": "Lottery is not open"
    },
    {
      "code": 6007,
      "name": "lotteryDrawing",
      "msg": "Lottery is drawing"
    },
    {
      "code": 6008,
      "name": "lotteryCompleted",
      "msg": "Lottery is completed"
    },
    {
      "code": 6009,
      "name": "lotteryExpired",
      "msg": "Lottery is expired"
    },
    {
      "code": 6010,
      "name": "invalidLotteryState",
      "msg": "Invalid lottery state"
    },
    {
      "code": 6011,
      "name": "invalidAccountOwner",
      "msg": "Invalid account owner"
    },
    {
      "code": 6012,
      "name": "invalidInstructionInput",
      "msg": "Invalid instruction input"
    },
    {
      "code": 6013,
      "name": "safeMathError",
      "msg": "Safe Math Error"
    },
    {
      "code": 6014,
      "name": "prizeClaimTimeExpired",
      "msg": "Prize claim time expired"
    },
    {
      "code": 6015,
      "name": "invalidPrizeTier",
      "msg": "Invalid prize tier"
    },
    {
      "code": 6016,
      "name": "treasuryWithdrawalTimeLockNotReached",
      "msg": "Treasury withdrawal time lock not yet reached"
    },
    {
      "code": 6017,
      "name": "invalidTreasuryMultisig",
      "msg": "Invalid treasury multisig"
    },
    {
      "code": 6018,
      "name": "tokenTransferFailed",
      "msg": "Token transfer failed"
    },
    {
      "code": 6019,
      "name": "invalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6020,
      "name": "oraclePriceFeedError",
      "msg": "Oracle price feed error"
    },
    {
      "code": 6021,
      "name": "randomnessGenerationFailed",
      "msg": "Randomness generation failed"
    },
    {
      "code": 6022,
      "name": "unauthorizedAccess",
      "msg": "Unauthorized access"
    }
  ],
  "types": [
    {
      "name": "globalConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "treasuryFeePercentage",
            "type": "u16"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "usdcMint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "lotteryAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryType",
            "type": {
              "defined": {
                "name": "lotteryType"
              }
            }
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "drawTime",
            "type": "i64"
          },
          {
            "name": "prizePool",
            "type": "u64"
          },
          {
            "name": "totalTickets",
            "type": "u64"
          },
          {
            "name": "winningNumbers",
            "type": {
              "option": "bytes"
            }
          },
          {
            "name": "state",
            "type": {
              "defined": {
                "name": "lotteryState"
              }
            }
          },
          {
            "name": "createdBy",
            "type": "pubkey"
          },
          {
            "name": "globalConfig",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "lotteryCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "pubkey"
          },
          {
            "name": "lotteryType",
            "type": "string"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "drawTime",
            "type": "i64"
          },
          {
            "name": "prizePool",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lotteryState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "created"
          },
          {
            "name": "open"
          },
          {
            "name": "drawing"
          },
          {
            "name": "completed"
          },
          {
            "name": "expired"
          }
        ]
      }
    },
    {
      "name": "lotteryType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "daily"
          },
          {
            "name": "weekly"
          },
          {
            "name": "monthly"
          }
        ]
      }
    },
    {
      "name": "ticketPurchased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "pubkey"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "numberOfTickets",
            "type": "u64"
          },
          {
            "name": "totalCost",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
