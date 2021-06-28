import { calculateBid } from '../calculateBid';

describe('calculateBid', () => {
  it('should calculate bid', async () => {
    const price = 10_000 * 1e18;

    let bid1 = await calculateBid({ amount: 1e8 }, price, 0.1, 8);
    expect(bid1.toString()).toBe((9_000 * 1e12).toString());

    const bid2 = await calculateBid({ amount: 0.1 * 1e8 }, price, 0.2, 8);
    expect(bid2.toString()).toBe((800 * 1e12).toString());
  });

  it('should throw because of last bid is greater', async () => {
    const price = 10_000 * 1e18;
    expect(calculateBid({ amount: 1e8, lastBid: 9_000 * 1e12 }, price, 0.1, 8))
    .rejects.toEqual(new Error('Last bid is greater or equal to our bid'));
  });
});
