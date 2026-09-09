// Which string the hero's field plays next, when it is playing itself.
//
// Straight randomness clumps: the same string three times running, another one
// silent for half a minute. A fixed order is worse — it stops being worth
// listening to after two turns round, and the whole point of the resting pulse
// is that it never quite repeats. So the strings are dealt from a bag rather
// than rolled for. Every string goes in twice, the bag is shuffled, and it is
// emptied before it is refilled: over any twelve plucks every string is heard
// exactly twice, and the order they come in is new each time.
//
// One extra condition. The beats come in pairs — a beat and its answer — and a
// pair that lands on the same string twice is a stutter rather than a
// heartbeat, so no pair is dealt the same string twice.

/** Deals one full round: every string twice, shuffled, with no group of `pair`
 *  holding the same string more than once.
 *
 *  The condition is met by reshuffling rather than by repairing the shuffle in
 *  place. A repair has to choose what to swap, and whatever it chooses it
 *  quietly favours; reshuffling leaves the result uniform over the orders that
 *  are allowed. About three shuffles in five come out clean at six strings, so
 *  this settles on the first or second attempt almost every time. The cap is
 *  there only so a freak run cannot hang a frame — a deal that reaches it is
 *  still every string twice, just possibly with one stuttering pair. */
export function dealPlucks(strings: number, pair: number) {
  const bag: number[] = []

  for (let string = 0; string < strings; string += 1) {
    bag.push(string, string)
  }

  const paired = () => {
    for (let index = 0; index + 1 < bag.length; index += pair) {
      for (let step = 1; step < pair && index + step < bag.length; step += 1) {
        if (bag[index] === bag[index + step]) {
          return false
        }
      }
    }

    return true
  }

  for (let attempt = 0; attempt < 32; attempt += 1) {
    for (let index = bag.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1))
      const held = bag[index]

      bag[index] = bag[other]
      bag[other] = held
    }

    if (paired()) {
      break
    }
  }

  return bag
}
