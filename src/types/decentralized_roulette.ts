/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/decentralized_roulette.json`.
 */
export type DecentralizedRoulette = {
  "address": "4ZVg5wU59Tr6pKAfxkTFsF2cffGrVRM2xqt1WbPUJrUB",
  "metadata": {
    "name": "decentralizedRoulette",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Decentralized Roulette Game"
  },
  "instructions": [
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
          "writable": true
        },
        {
          "name": "authority",
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
          "name": "systemProgram"
        }
      ],
      "args": []
    },
    {
      "name": "createRoulette",
      "discriminator": [
        101,
        245,
        184,
        13,
        187,
        206,
        27,
        229
      ],
      "accounts": [
        {
          "name": "roulette",
          "writable": true
        },
        {
          "name": "globalConfig"
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "rouletteTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "rent"
        }
      ],
      "args": [
        {
          "name": "rouletteType",
          "type": {
            "defined": {
              "name": "rouletteType"
            }
          }
        },
        {
          "name": "minBet",
          "type": "u64"
        },
        {
          "name": "maxBet",
          "type": "u64"
        },
        {
          "name": "gameDuration",
          "type": "i64"
        },
        {
          "name": "nonce",
          "type": "u64"
        }
      ]
    },
    {
      "name": "placeBet",
      "discriminator": [
        45,
        110,
        214,
        12,
        60,
        102,
        123,
        37
      ],
      "accounts": [
        {
          "name": "roulette",
          "writable": true
        },
        {
          "name": "bet",
          "writable": true
        },
        {
          "name": "globalConfig"
        },
        {
          "name": "bettor",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "bettorTokenAccount",
          "writable": true
        },
        {
          "name": "rouletteTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "betType",
          "type": {
            "defined": {
              "name": "betType"
            }
          }
        },
        {
          "name": "betAmount",
          "type": "u64"
        },
        {
          "name": "betNumbers",
          "type": {
            "vec": "u8"
          }
        }
      ]
    },
    {
      "name": "lockBetting",
      "discriminator": [
        123,
        45,
        67,
        89,
        12,
        34,
        56,
        78
      ],
      "accounts": [
        {
          "name": "roulette",
          "writable": true
        },
        {
          "name": "globalConfig"
        },
        {
          "name": "caller",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "claimWinnings",
      "discriminator": [
        187,
        230,
        54,
        100,
        23,
        145,
        67,
        89
      ],
      "accounts": [
        {
          "name": "roulette",
          "writable": true
        },
        {
          "name": "bet",
          "writable": true
        },
        {
          "name": "globalConfig"
        },
        {
          "name": "claimer",
          "writable": true,
          "signer": true
        },
        {
          "name": "claimerTokenAccount",
          "writable": true
        },
        {
          "name": "rouletteTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "rouletteAccount",
      "discriminator": [
        22,
        33,
        44,
        55,
        66,
        77,
        88,
        99
      ]
    },
    {
      "name": "betAccount",
      "discriminator": [
        11,
        22,
        33,
        44,
        55,
        66,
        77,
        88
      ]
    },
    {
      "name": "globalConfig",
      "discriminator": [
        99,
        88,
        77,
        66,
        55,
        44,
        33,
        22
      ]
    }
  ],
  "events": [
    {
      "name": "rouletteCreated",
      "discriminator": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ]
    },
    {
      "name": "betPlaced",
      "discriminator": [
        10,
        20,
        30,
        40,
        50,
        60,
        70,
        80
      ]
    },
    {
      "name": "bettingLocked",
      "discriminator": [
        15,
        25,
        35,
        45,
        55,
        65,
        75,
        85
      ]
    },
    {
      "name": "winningsClaimed",
      "discriminator": [
        90,
        80,
        70,
        60,
        50,
        40,
        30,
        20
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidBetType",
      "msg": "Invalid bet type"
    },
    {
      "code": 6001,
      "name": "betBelowMinimum",
      "msg": "Bet amount below minimum"
    },
    {
      "code": 6002,
      "name": "betExceedsMaximum",
      "msg": "Bet amount exceeds maximum"
    }
  ],
  "types": [
    {
      "name": "rouletteType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "european"
          },
          {
            "name": "american"
          }
        ]
      }
    },
    {
      "name": "rouletteState",
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
            "name": "spinning"
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
      "name": "betType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "straight"
          },
          {
            "name": "split"
          },
          {
            "name": "street"
          },
          {
            "name": "corner"
          },
          {
            "name": "sixLine"
          },
          {
            "name": "red"
          },
          {
            "name": "black"
          },
          {
            "name": "even"
          },
          {
            "name": "odd"
          },
          {
            "name": "low"
          },
          {
            "name": "high"
          },
          {
            "name": "firstTwelve"
          },
          {
            "name": "secondTwelve"
          },
          {
            "name": "thirdTwelve"
          },
          {
            "name": "firstColumn"
          },
          {
            "name": "secondColumn"
          },
          {
            "name": "thirdColumn"
          }
        ]
      }
    }
  ]
};
