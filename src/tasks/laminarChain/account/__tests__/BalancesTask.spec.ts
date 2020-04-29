import { Observable } from "rxjs";
import BalancesTask from "../BalancesTask";

describe("BalancesTask", () => {
  const task = new BalancesTask();

  it("works with valid arguments", () => {
    expect(task.call({ account: "alice" })).toBeInstanceOf(Observable);
    expect(task.call({ account: ["aclie"] })).toBeInstanceOf(Observable);
  });

  it("doesn't work with invalid arguments", () => {
    // @ts-ignore
    expect(() => task.call({ account: "" })).toThrow(Error);
    // @ts-ignore
    expect(() => task.call()).toThrow(Error);
  });
});
