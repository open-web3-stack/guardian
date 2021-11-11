import conditionBuilder from '../condition-builder';

const config = [
  {
    collateralRatio: '< 1.1'
  },
  {
    $and: [
      {
        $or: [
          {
            currencyId: 'FEUR'
          },
          {
            currencyId: 'FJPY'
          }
        ]
      },
      {
        collateralRatio: '< 120%'
      }
    ]
  }
];

describe('condition builder', () => {
  it('works', () => {
    expect(conditionBuilder(config)).toBeTruthy();

    const expr = conditionBuilder(config);
    expect(expr({ collateralRatio: 1.0, currencyId: 'FUSD' })).toBe(true);
    expect(expr({ collateralRatio: 1.0, currencyId: 'FEUR' })).toBe(true);
    expect(expr({ collateralRatio: 1.2, currencyId: 'FEUR' })).toBe(false);
    expect(expr({ collateralRatio: 1.3, currencyId: 'FUSD' })).toBe(false);
  });
});
