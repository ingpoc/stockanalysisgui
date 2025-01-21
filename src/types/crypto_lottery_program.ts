/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/crypto_lottery_program.json`.
 */
export type CryptoLotteryProgram = {
  "address": "DRmPDrBUrF1R4Y7tdKRfjFKQPsdQdtvTEbQY5Qp9GzqY",
  "metadata": {
    "name": "cryptoLotteryProgram",
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
          "name": "lottery",
          "writable": true
        },
        {
          "name": "player",
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
      "name": "drawWinner",
      "discriminator": [
        250,
        103,
        118,
        147,
        219,
        235,
        169,
        220
      ],
      "accounts": [
        {
          "name": "lottery",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "winner",
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
      "name": "initializeLottery",
      "discriminator": [
        113,
        199,
        243,
        247,
        73,
        217,
        33,
        11
      ],
      "accounts": [
        {
          "name": "lottery",
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
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "startTime"
              }
            ]
          }
        },
        {
          "name": "authority",
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
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
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
  "errors": [
    {
      "code": 6000,
      "name": "lotteryNotActive",
      "msg": "Lottery is not active"
    },
    {
      "code": 6001,
      "name": "lotteryNotStarted",
      "msg": "Lottery has not started yet"
    },
    {
      "code": 6002,
      "name": "lotteryEnded",
      "msg": "Lottery has ended"
    },
    {
      "code": 6003,
      "name": "lotteryNotEnded",
      "msg": "Lottery has not ended yet"
    },
    {
      "code": 6004,
      "name": "noPlayers",
      "msg": "No players in the lottery"
    }
  ],
  "types": [
    {
      "name": "lotteryAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "pot",
            "type": "u64"
          },
          {
            "name": "players",
            "type": {
              "vec": {
                "defined": {
                  "name": "playerTicket"
                }
              }
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          },
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
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "lotteryStatus"
              }
            }
          },
          {
            "name": "lastTicketId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lotteryStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "completed"
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
      "name": "playerTicket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "ticketId",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
