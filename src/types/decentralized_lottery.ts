/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/decentralized_lottery.json`.
 */
/**
 * Auto-generated Program IDL types in camelCase format.
 *
 * Note that this is auto-generated from the IDL. For comprehensive
 * types with UI helpers, use lottery_types.ts instead.
 */
export type DecentralizedLottery = {
  "address": "7my34Pj4c96UfSieKESvNZ8napKonpZAiBxUum1VbGS3",
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
              }
            ]
          }
        },
        {
          "name": "ticketAccount",
          "writable": true
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
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
              }
            ]
          }
        },
        {
          "name": "ticketAccount",
          "writable": true
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
          "name": "winner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
          "name": "creator",
          "writable": true,
          "signer": true
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
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "selectWinner",
      "discriminator": [
        119,
        66,
        44,
        236,
        79,
        158,
        82,
        51
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
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
      "name": "drawingStarted",
      "discriminator": [
        105,
        108,
        34,
        253,
        27,
        204,
        35,
        5
      ]
    },
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
      "name": "randomnessConsumed",
      "discriminator": [
        90,
        36,
        18,
        118,
        153,
        234,
        93,
        144
      ]
    },
    {
      "name": "randomnessRequested",
      "discriminator": [
        10,
        64,
        183,
        29,
        104,
        63,
        90,
        149
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
      "name": "treasuryWithdrawal",
      "discriminator": [
        244,
        117,
        175,
        46,
        187,
        109,
        20,
        16
      ]
    },
    {
      "name": "vrfClientInitialized",
      "discriminator": [
        0,
        118,
        216,
        155,
        30,
        123,
        193,
        166
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
      "name": "invalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6021,
      "name": "oraclePriceFeedError",
      "msg": "Oracle price feed error"
    },
    {
      "code": 6022,
      "name": "randomnessGenerationFailed",
      "msg": "Randomness generation failed"
    },
    {
      "code": 6023,
      "name": "unauthorizedAccess",
      "msg": "Unauthorized access"
    },
    {
      "code": 6024,
      "name": "invalidStateTransition",
      "msg": "Invalid state transition"
    },
    {
      "code": 6025,
      "name": "invalidCancellation",
      "msg": "Lottery cannot be cancelled in current state"
    },
    {
      "code": 6026,
      "name": "adminRequired",
      "msg": "Only admin can perform this action"
    },
    {
      "code": 6027,
      "name": "lotteryCancelled",
      "msg": "Lottery is cancelled"
    },
    {
      "code": 6028,
      "name": "lotteryNotOpenForTicketPurchases",
      "msg": "Lottery is not open for ticket purchases."
    },
    {
      "code": 6029,
      "name": "lotteryAlreadyClaimed",
      "msg": "Lottery prize has already been claimed."
    },
    {
      "code": 6030,
      "name": "pdaDerivationError",
      "msg": "Failed to derive PDA."
    },
    {
      "code": 6031,
      "name": "invalidWinningTicket",
      "msg": "Provided ticket PDA does not match the winning ticket stored in the lottery."
    },
    {
      "code": 6032,
      "name": "ticketAlreadyClaimed",
      "msg": "The provided ticket has already been claimed or refunded."
    },
    {
      "code": 6033,
      "name": "invalidStateForRefund",
      "msg": "Lottery is not in a state where refunds can be claimed (must be Cancelled or Expired)."
    },
    {
      "code": 6034,
      "name": "invalidInput",
      "msg": "The input parameters are invalid."
    },
    {
      "code": 6035,
      "name": "ticketSaleEnded",
      "msg": "The ticket sale has ended."
    },
    {
      "code": 6036,
      "name": "lotteryAlreadyDrawn",
      "msg": "The lottery has already been drawn."
    },
    {
      "code": 6037,
      "name": "noTickets",
      "msg": "There are no tickets in this lottery."
    },
    {
      "code": 6038,
      "name": "insufficientTicketsSold",
      "msg": "Insufficient tickets sold to proceed with the draw."
    },
    {
      "code": 6039,
      "name": "lotteryNotDrawn",
      "msg": "The lottery has not been drawn yet."
    },
    {
      "code": 6040,
      "name": "ticketNotEligibleForRefund",
      "msg": "The specified ticket is not eligible for refund."
    },
    {
      "code": 6041,
      "name": "lotteryNotExpired",
      "msg": "The lottery has not expired yet."
    },
    {
      "code": 6042,
      "name": "invalidVrfAccount",
      "msg": "VRF account is invalid."
    },
    {
      "code": 6043,
      "name": "insufficientFunds",
      "msg": "Insufficient funds for this operation."
    },
    {
      "code": 6044,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow error."
    },
    {
      "code": 6045,
      "name": "ticketNotForThisLottery",
      "msg": "Ticket does not belong to this lottery."
    },
    {
      "code": 6046,
      "name": "noWinnerSelected",
      "msg": "No winner has been selected yet."
    },
    {
      "code": 6047,
      "name": "emptyPrizePool",
      "msg": "The prize pool is empty."
    },
    {
      "code": 6048,
      "name": "insufficientPrizeFunds",
      "msg": "Insufficient funds in the prize pool."
    }
  ],
  "types": [
    {
      "name": "drawingStarted",
      "docs": [
        "Event emitted when a lottery drawing begins.",
        "- Purpose: Signals the start of the lottery draw process.",
        "- Context: Triggered when a lottery transitions to the Drawing state."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "totalTickets",
            "type": "u64"
          },
          {
            "name": "prizePool",
            "type": "u64"
          },
          {
            "name": "vrfClient",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
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
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "vrfClient",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "vrfRandomness",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "vrfRequestAccount",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "oraclePubkey",
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
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "completedAt",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "lotteryCreated",
      "docs": [
        "Event emitted when a new lottery is created.",
        "- Purpose: Signals the initialization of a new lottery with its configuration details.",
        "- Context: Triggered by the `create_lottery` instruction after successfully setting up a lottery account."
      ],
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
            "name": "locked"
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
      "docs": [
        "Event emitted when a lottery's state changes.",
        "- Purpose: Tracks the lifecycle progression of a lottery through its various states (e.g., Created, Open, AwaitingRandomness, Completed, Expired).",
        "- Context: Triggered by instructions like `transition_state` or `settle_randomness` when the lottery state is updated."
      ],
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
      "docs": [
        "Event emitted when a prize is claimed by the winner.",
        "- Purpose: Records the distribution of the prize pool, including any treasury fees deducted, to the winner.",
        "- Context: Triggered by the `claim_prize` instruction after successfully transferring funds to the winner's token account."
      ],
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
      "name": "randomnessConsumed",
      "docs": [
        "Event emitted when randomness is consumed from Switchboard.",
        "- Purpose: Indicates that VRF randomness has been received and processed.",
        "- Context: Triggered by the `consume_randomness` instruction after verifying and extracting the randomness."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "pubkey"
          },
          {
            "name": "vrfClient",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "diceResult",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "randomnessRequested",
      "docs": [
        "Event emitted when randomness is requested from Switchboard.",
        "- Purpose: Records when a lottery initiates a request for randomness from Switchboard VRF.",
        "- Context: Triggered by the `request_randomness` instruction when making a CPI call to Switchboard."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "pubkey"
          },
          {
            "name": "vrfClient",
            "type": "pubkey"
          },
          {
            "name": "vrfAccount",
            "type": "pubkey"
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
      "docs": [
        "Event emitted when a ticket is purchased for a lottery.",
        "- Purpose: Records the purchase details, linking a buyer to a specific ticket in a lottery.",
        "- Context: Triggered by the `buy_ticket` instruction upon successful token transfer and ticket account creation."
      ],
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
      "docs": [
        "Event emitted when a ticket is refunded.",
        "- Purpose: Indicates a refund has been issued for a ticket, typically when a lottery expires without a draw.",
        "- Context: Triggered by the `claim_refund` instruction after returning the ticket cost to the buyer."
      ],
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
      "name": "treasuryWithdrawal",
      "docs": [
        "Event emitted when funds are withdrawn from the treasury.",
        "- Purpose: Records treasury withdrawals for transparency and audit purposes.",
        "- Context: Triggered by treasury withdrawal instructions when funds are transferred out."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "destination",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "isEmergency",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "vrfClientInitialized",
      "docs": [
        "Event emitted when a VRF client is initialized for a lottery.",
        "- Purpose: Signals the creation of a new VRF client for a specific lottery.",
        "- Context: Triggered by the `init_vrf_client` instruction when setting up the VRF client state account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryId",
            "type": "pubkey"
          },
          {
            "name": "vrfClient",
            "type": "pubkey"
          },
          {
            "name": "vrfAccount",
            "type": "pubkey"
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
      "docs": [
        "Event emitted when a winner is selected for a lottery.",
        "- Purpose: Announces the winning ticket and the randomness value used to determine the winner, ensuring transparency.",
        "- Context: Triggered by the `settle_randomness` instruction after verifying the oracle-provided randomness and calculating the winning ticket ID."
      ],
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
