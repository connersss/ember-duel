// Ember Duel: every card in the game. One job: the card list.
// A card is { id, name, element, cost, kind, power, text }.
// kind: 'damage' | 'block' | 'heal' | 'damage-draw' | 'heal-draw' | 'draw'.
// Element is told by colour AND shape (see render.js): flame triangle,
// frost diamond, leaf circle, spark star.
export const CARDS = {
  'flame-strike': { id: 'flame-strike', name: 'Flame Strike', element: 'flame', cost: 2, kind: 'damage', power: 5, text: 'Deal 5 damage.' },
  'ember-burst': { id: 'ember-burst', name: 'Ember Burst', element: 'flame', cost: 4, kind: 'damage', power: 9, text: 'Deal 9 damage.' },
  'cinder-wall': { id: 'cinder-wall', name: 'Cinder Wall', element: 'flame', cost: 2, kind: 'block', power: 8, text: 'Gain 8 block.' },
  'frost-guard': { id: 'frost-guard', name: 'Frost Guard', element: 'frost', cost: 1, kind: 'block', power: 6, text: 'Gain 6 block.' },
  'frostbite': { id: 'frostbite', name: 'Frostbite', element: 'frost', cost: 3, kind: 'damage', power: 6, text: 'Deal 6 damage.' },
  'leaf-mend': { id: 'leaf-mend', name: 'Leaf Mend', element: 'leaf', cost: 3, kind: 'heal', power: 7, text: 'Restore 7 life.' },
  'thorn-volley': { id: 'thorn-volley', name: 'Thorn Volley', element: 'leaf', cost: 2, kind: 'damage-draw', power: 3, text: 'Deal 3 damage. Draw 1.' },
  'spark-zap': { id: 'spark-zap', name: 'Spark Zap', element: 'spark', cost: 2, kind: 'damage', power: 4, text: 'Deal 4 damage.' },
  'spark-draw': { id: 'spark-draw', name: 'Spark Draw', element: 'spark', cost: 1, kind: 'draw', power: 2, text: 'Draw 2 cards.' },
  'overgrowth': { id: 'overgrowth', name: 'Overgrowth', element: 'leaf', cost: 4, kind: 'heal-draw', power: 5, text: 'Restore 5 life. Draw 1.' },
};

// The 20-card deck every duellist shuffles: 3+2+2+2+2+2+2+2+2+1.
export const DECK_LIST = [
  'flame-strike', 'flame-strike', 'flame-strike',
  'ember-burst', 'ember-burst',
  'cinder-wall', 'cinder-wall',
  'frost-guard', 'frost-guard',
  'frostbite', 'frostbite',
  'leaf-mend', 'leaf-mend',
  'thorn-volley', 'thorn-volley',
  'spark-zap', 'spark-zap',
  'spark-draw', 'spark-draw',
  'overgrowth',
];

export function cardById(id) {
  return CARDS[id];
}
