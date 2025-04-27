/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/decentralized_lottery.json`.
 */
/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/decentralized_lottery.json`.
 */
export type DecentralizedLottery = {
  "address": "F1pffGp4n5qyNRcCnpoTH5CEfVKQEGxAxmRuRScUw4tz",
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
          "name": "ticketAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  99,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "lotteryAccount"
              },
              {
                "kind": "account",
                "path": "lottery_account.last_ticket_id",
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
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "cancelLottery",
      "discriminator": [
        85,
        35,
        29,
        73,
        218,
        192,
        9,
        166
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
          "name": "admin",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "claimPrize",
      "discriminator": [
        157,
        233,
        139,
        121,
        246,
        62,
        234,
        235
      ],
      "accounts": [
        {
          "name": "lotteryAccount",
          "writable": true
        },
        {
          "name": "ticketAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  99,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "lotteryAccount"
              },
              {
                "kind": "account",
                "path": "ticket_account.id",
                "account": "ticketAccount"
              }
            ]
          }
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
          },
          "relations": [
            "lotteryAccount"
          ]
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "lotteryTokenAccount",
          "writable": true
        },
        {
          "name": "winnerTokenAccount",
          "writable": true
        },
        {
          "name": "winner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "claimRefund",
      "discriminator": [
        15,
        16,
        30,
        161,
        255,
        228,
        97,
        60
      ],
      "accounts": [
        {
          "name": "lotteryAccount"
        },
        {
          "name": "ticketAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  99,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "lotteryAccount"
              },
              {
                "kind": "account",
                "path": "ticket_account.id",
                "account": "ticketAccount"
              }
            ]
          }
        },
        {
          "name": "lotteryTokenAccount",
          "writable": true
        },
        {
          "name": "buyerTokenAccount",
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
      "args": []
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
          "name": "tokenMint",
          "docs": [
            "The mint for the token being used (USDC)"
          ]
        },
        {
          "name": "creatorTokenAccount",
          "docs": [
            "The creator's token account (no longer needed for funding, but kept for consistency)"
          ]
        },
        {
          "name": "lotteryTokenAccount",
          "docs": [
            "The lottery's token account for prize pool"
          ],
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
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "lotteryAccount"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
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
          "name": "targetPrizePool",
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
          "name": "treasuryTokenAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "settleRandomness",
      "discriminator": [
        209,
        111,
        84,
        239,
        14,
        4,
        26,
        251
      ],
      "accounts": [
        {
          "name": "lotteryAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "transitionState",
      "discriminator": [
        52,
        205,
        208,
        34,
        155,
        130,
        12,
        18
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
          "name": "lotteryTokenAccount",
          "docs": [
            "The lottery's token account for prize pool"
          ],
          "writable": true
        },
        {
          "name": "admin",
          "docs": [
            "Placeholder: Depending on the VRF provider, specific accounts (VRF account, Oracle queue, etc.)",
            "would be needed here when transitioning to Drawing/AwaitingRandomness.",
            "pub vrf: AccountInfo<'info>,",
            "pub oracle_queue: AccountInfo<'info>,",
            "pub vrf_request_account: AccountInfo<'info>, // The account to store request state"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nextState",
          "type": {
            "defined": {
              "name": "lotteryState"
            }
          }
        }
      ]
    },
    {
      "name": "updateConfig",
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
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
          "signer": true,
          "relations": [
            "globalConfig"
          ]
        },
        {
          "name": "usdcMint"
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
    },
    {
      "name": "ticketAccount",
      "discriminator": [
        231,
        93,
        13,
        18,
        239,
        66,
        21,
        45
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
      "name": "lotteryStateChanged",
      "discriminator": [
        116,
        62,
        184,
        135,
        124,
        90,
        153,
        26
      ]
    },
    {
      "name": "prizeClaimed",
      "discriminator": [
        213,
        150,
        192,
        76,
        199,
        33,
        212,
        38
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
    },
    {
      "name": "ticketRefunded",
      "discriminator": [
        46,
        173,
        213,
        43,
        145,
        205,
        132,
        218
      ]
    },
    {
      "name": "winnerSelected",
      "discriminator": [
        245,
        110,
        152,
        173,
        193,
        48,
        133,
        5
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
    },
    {
      "code": 6023,
      "name": "invalidStateTransition",
      "msg": "Invalid state transition"
    },
    {
      "code": 6024,
      "name": "invalidCancellation",
      "msg": "Lottery cannot be cancelled in current state"
    },
    {
      "code": 6025,
      "name": "adminRequired",
      "msg": "Only admin can perform this action"
    },
    {
      "code": 6026,
      "name": "lotteryCancelled",
      "msg": "Lottery is cancelled"
    },
    {
      "code": 6027,
      "name": "lotteryNotOpenForTicketPurchases",
      "msg": "Lottery is not open for ticket purchases."
    },
    {
      "code": 6028,
      "name": "lotteryAlreadyClaimed",
      "msg": "Lottery prize has already been claimed."
    },
    {
      "code": 6029,
      "name": "pdaDerivationError",
      "msg": "Failed to derive PDA."
    },
    {
      "code": 6030,
      "name": "invalidWinningTicket",
      "msg": "Provided ticket PDA does not match the winning ticket stored in the lottery."
    },
    {
      "code": 6031,
      "name": "ticketAlreadyClaimed",
      "msg": "The provided ticket has already been claimed or refunded."
    },
    {
      "code": 6032,
      "name": "invalidStateForRefund",
      "msg": "Lottery is not in a state where refunds can be claimed (must be Cancelled or Expired)."
    }
  ],
  "types": [
    {
      "name": "globalConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "treasuryTokenAccount",
            "type": "pubkey"
          },
          {
            "name": "treasuryFeePercentage",
            "type": "u16"
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
            "name": "winningTicket",
            "type": {
              "option": "pubkey"
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
          },
          {
            "name": "autoTransition",
            "type": "bool"
          },
          {
            "name": "lastTicketId",
            "type": "u64"
          },
          {
            "name": "oraclePubkey",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "vrfRequestAccount",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "isPrizePoolLocked",
            "type": "bool"
          },
          {
            "name": "targetPrizePool",
            "type": "u64"
          },
          {
            "name": "isClaimed",
            "type": "bool"
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
            "name": "targetPrizePool",
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
            "name": "awaitingRandomness"
          },
          {
            "name": "completed"
          },
          {
            "name": "expired"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "lotteryStateChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "pubkey"
          },
          {
            "name": "previousState",
            "type": {
              "defined": {
                "name": "lotteryState"
              }
            }
          },
          {
            "name": "newState",
            "type": {
              "defined": {
                "name": "lotteryState"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "totalTicketsSold",
            "type": "u64"
          },
          {
            "name": "currentPrizePool",
            "type": "u64"
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
      "name": "prizeClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "pubkey"
          },
          {
            "name": "ticketId",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "prizePool",
            "type": "u64"
          },
          {
            "name": "treasuryFee",
            "type": "u64"
          },
          {
            "name": "winnerPayout",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ticketAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lottery",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "isClaimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
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
            "name": "ticketId",
            "type": "u64"
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
    },
    {
      "name": "ticketRefunded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "pubkey"
          },
          {
            "name": "ticketId",
            "type": "u64"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "refundAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "winnerSelected",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "pubkey"
          },
          {
            "name": "winningTicketId",
            "type": "u64"
          },
          {
            "name": "winningTicketPda",
            "type": "pubkey"
          },
          {
            "name": "randomnessValue",
            "type": "string"
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
