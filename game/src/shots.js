// Ember Duel: the screenshot scenes behind ?shot=start|play|win|end.
// Each one stages a real game state through the real rules, then freezes it,
// so the frame is what a played game really looks like and the same seed
// always gives the same frame.
import { startGame, playPlayerCard, endPlayerTurn, update } from './world.js';
import { cardById } from './cards.js';

function forceHand(side, ids) {
  side.hand = ids.map((id) => cardById(id));
}

// Play the cheapest damage card the player can afford, if any.
function playerHit(world) {
  const idx = world.player.hand.findIndex((c) => (c.kind === 'damage' || c.kind === 'damage-draw') && c.cost <= world.player.embers);
  if (idx >= 0) playPlayerCard(world, idx);
}

// Run the AI turn to completion in fixed steps.
function runAi(world) {
  for (let i = 0; i < 400 && world.phase === 'ai' && !world.over; i += 1) update(world, 0.25);
}

export function stageShot(name, world) {
  startGame(world);
  if (name === 'play') {
    // Three real turns: hit, let Cinder answer, hit again.
    playerHit(world);
    endPlayerTurn(world);
    runAi(world);
    playerHit(world);
    endPlayerTurn(world);
    runAi(world);
    playerHit(world);
    // Let the played card land and the numbers fade before freezing.
    for (let i = 0; i < 12; i += 1) update(world, 0.1);
    world.frozen = true;
    return 'play';
  }
  if (name === 'win') {
    // Cinder down to a last few life; you hold the burst that ends it.
    world.enemy.life = 4;
    forceHand(world.player, ['ember-burst', 'flame-strike', 'leaf-mend', 'spark-draw', 'frost-guard']);
    world.player.embers = 6;
    const idx = world.player.hand.findIndex((c) => c.id === 'ember-burst');
    playPlayerCard(world, idx);
    // Let the confetti fall into view before freezing.
    for (let i = 0; i < 8; i += 1) update(world, 0.1);
    world.frozen = true;
    return 'win';
  }
  if (name === 'end') {
    // You are one hit from the end; Cinder holds the burst that lands it.
    world.player.life = 4;
    forceHand(world.enemy, ['ember-burst', 'frostbite', 'spark-zap', 'leaf-mend']);
    endPlayerTurn(world);
    runAi(world);
    for (let i = 0; i < 12; i += 1) update(world, 0.1);
    world.frozen = true;
    return 'loss';
  }
  world.screen = 'title';
  world.frozen = true;
  return 'title';
}
