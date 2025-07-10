/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/decentralized_roulette.json`.
 */
export type DecentralizedRoulette = {
  address: '4ZVg5wU59Tr6pKAfxkTFsF2cffGrVRM2xqt1WbPUJrUB';
  metadata: {
    name: 'decentralizedRoulette';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Decentralized Roulette Game';
  };
  instructions: [
    {
      name: 'initialize';
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: 'globalConfig';
          writable: true;
        },
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'usdcMint';
        },
        {
          name: 'treasuryTokenAccount';
        },
        {
          name: 'systemProgram';
        },
      ];
      args: [];
    },
    {
      name: 'createRoulette';
      discriminator: [76, 240, 229, 18, 219, 48, 208, 12];
      accounts: [
        {
          name: 'roulette';
          writable: true;
        },
        {
          name: 'globalConfig';
        },
        {
          name: 'creator';
          writable: true;
          signer: true;
        },
        {
          name: 'usdcMint';
        },
        {
          name: 'creatorTokenAccount';
        },
        {
          name: 'rouletteTokenAccount';
          writable: true;
        },
        {
          name: 'tokenProgram';
        },
        {
          name: 'systemProgram';
        },
        {
          name: 'rent';
        },
      ];
      args: [
        {
          name: 'rouletteType';
          type: {
            defined: {
              name: 'RouletteType';
            };
          };
        },
        {
          name: 'minBet';
          type: 'u64';
        },
        {
          name: 'maxBet';
          type: 'u64';
        },
        {
          name: 'gameDuration';
          type: 'i64';
        },
        {
          name: 'nonce';
          type: 'u64';
        },
      ];
    },
    {
      name: 'placeBet';
      discriminator: [123, 45, 67, 89, 12, 34, 56, 78];
      accounts: [
        {
          name: 'roulette';
          writable: true;
        },
        {
          name: 'bet';
          writable: true;
        },
        {
          name: 'globalConfig';
        },
        {
          name: 'bettor';
          writable: true;
          signer: true;
        },
        {
          name: 'usdcMint';
        },
        {
          name: 'bettorTokenAccount';
          writable: true;
        },
        {
          name: 'rouletteTokenAccount';
          writable: true;
        },
        {
          name: 'tokenProgram';
        },
        {
          name: 'systemProgram';
        },
      ];
      args: [
        {
          name: 'betType';
          type: {
            defined: {
              name: 'BetType';
            };
          };
        },
        {
          name: 'betAmount';
          type: 'u64';
        },
        {
          name: 'betNumbers';
          type: {
            vec: 'u8';
          };
        },
      ];
    },
    {
      name: 'lockBetting';
      discriminator: [123, 45, 67, 89, 12, 34, 56, 78];
      accounts: [
        {
          name: 'roulette';
          writable: true;
        },
        {
          name: 'globalConfig';
        },
        {
          name: 'caller';
          signer: true;
        },
      ];
      args: [];
    },
    {
      name: 'claimWinnings';
      discriminator: [187, 230, 54, 100, 23, 145, 67, 89];
      accounts: [
        {
          name: 'roulette';
          writable: true;
        },
        {
          name: 'bet';
          writable: true;
        },
        {
          name: 'globalConfig';
        },
        {
          name: 'claimer';
          writable: true;
          signer: true;
        },
        {
          name: 'claimerTokenAccount';
          writable: true;
        },
        {
          name: 'rouletteTokenAccount';
          writable: true;
        },
        {
          name: 'tokenProgram';
        },
      ];
      args: [];
    },
    {
      name: 'cancelRoulette';
      discriminator: [49, 134, 191, 126, 36, 130, 7, 145];
      accounts: [
        {
          name: 'roulette';
          writable: true;
        },
        {
          name: 'globalConfig';
        },
        {
          name: 'authority';
          signer: true;
        },
      ];
      args: [
        {
          name: 'reason';
          type: 'string';
        },
      ];
    },
    {
      name: 'processGameLifecycle';
      discriminator: [48, 156, 192, 208, 251, 26, 129, 87];
      accounts: [
        {
          name: 'roulette';
          writable: true;
        },
        {
          name: 'globalConfig';
        },
        {
          name: 'caller';
          signer: true;
        },
      ];
      args: [];
    },
    {
      name: 'createNextGame';
      discriminator: [254, 203, 41, 48, 208, 12, 135, 205];
      accounts: [
        {
          name: 'newRoulette';
          writable: true;
        },
        {
          name: 'globalConfig';
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'usdcMint';
        },
        {
          name: 'rouletteTokenAccount';
          writable: true;
        },
        {
          name: 'tokenProgram';
        },
        {
          name: 'systemProgram';
        },
        {
          name: 'rent';
        },
      ];
      args: [
        {
          name: 'nonce';
          type: 'u64';
        },
      ];
    },
    {
      name: 'processAutomation';
      discriminator: [39, 37, 141, 84, 96, 46, 228, 253];
      accounts: [
        {
          name: 'globalConfig';
        },
        {
          name: 'caller';
          signer: true;
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'BetAccount';
      discriminator: [117, 187, 195, 89, 124, 167, 83, 89];
    },
    {
      name: 'GlobalConfig';
      discriminator: [34, 78, 123, 156, 190, 234, 45, 67];
    },
    {
      name: 'RouletteAccount';
      discriminator: [89, 123, 167, 201, 78, 134, 189, 223];
    },
  ];
  types: [
    {
      name: 'RouletteType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'european';
          },
          {
            name: 'american';
          },
        ];
      };
    },
    {
      name: 'BetType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'straight';
          },
          {
            name: 'split';
          },
          {
            name: 'street';
          },
          {
            name: 'corner';
          },
          {
            name: 'sixLine';
          },
          {
            name: 'red';
          },
          {
            name: 'black';
          },
          {
            name: 'even';
          },
          {
            name: 'odd';
          },
          {
            name: 'low';
          },
          {
            name: 'high';
          },
          {
            name: 'firstTwelve';
          },
          {
            name: 'secondTwelve';
          },
          {
            name: 'thirdTwelve';
          },
          {
            name: 'firstColumn';
          },
          {
            name: 'secondColumn';
          },
          {
            name: 'thirdColumn';
          },
        ];
      };
    },
  ];
};
