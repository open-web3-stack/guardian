import { calculateBid } from '../calculateBid';

describe('calculateBid', () => {
  it('should calculate bid', () => {
    const price = 10_000 * 1e18;
    const balance = 10_000 * 1e18;

    let bid1 = calculateBid({ amount: 1e18 }, price, balance, 0.1);
    expect(bid1.toString()).toBe((9_000 * 1e18).toString());

    const bid2 = calculateBid({ amount: 0.1 * 1e18 }, price, balance, 0.2);
    expect(bid2.toString()).toBe((800 * 1e18).toString());
  });

  it('should throw because of not enough balance', () => {
    const price = 10_000 * 1e18;
    const balance = 8_999 * 1e18;
    expect(() => calculateBid({ amount: 1e18 }, price, balance, 0.1)).toThrow('Not enough balance to place the bid');
  });

  it('should throw because of last bid is greater', () => {
    const price = 10_000 * 1e18;
    const balance = 10_000 * 1e18;
    expect(() => calculateBid({ amount: 1e18, lastBid: 9_000 * 1e18 }, price, balance, 0.1)).toThrow(
      'Last bid is greater or equal to our bid'
    );
  });
});
