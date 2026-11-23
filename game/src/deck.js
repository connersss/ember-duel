// Ember Duel: decks, hands and drawing. One job: the piles.
import { DECK_LIST, cardById } from './cards.js';
import { shuffle } from './random.js';
import { HAND_MAX } from './config.js';

export function makeSide(rng) {
  return {
    life: 30,
    maxLife: 30,
    block: 0,
    embers: 0,
    maxEmbers: 10,
    deck: shuffle(rng, DECK_LIST),
    hand: [],
    discard: [],
  };
}

export function drawCards(side, count) {
  for (let i = 0; i < count; i += 1) {
    if (side.hand.length >= HAND_MAX) return;
    if (side.deck.length === 0) {
      if (side.discard.length === 0) return;
      side.deck = shuffle(Math.random, side.discard);
      side.discard = [];
    }
    const id = side.deck.pop();
    side.hand.push(cardById(id));
  }
}

export function reshuffleDiscardIntoDeck(side, rng) {
  side.deck = shuffle(rng, side.deck.concat(side.discard));
  side.discard = [];
}
