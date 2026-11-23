// Ember Duel: the duel itself. One job: rules and turn flow.
import { makeSide, drawCards } from './deck.js';
import { mulberry32 } from './random.js';
import { START_HAND } from './config.js';
import { chooseMoves } from './ai.js';

export function createWorld(seed) {
  return {
    seed,
    rng: mulberry32(seed),
    screen: 'title',
    turn: 1,
    phase: 'player',
    player: null,
    enemy: null,
    log: [],
    floats: [],
    playAnim: null,
    aiQueue: [],
    aiTimer: 0,
    confetti: [],
    frozen: false,
    hoverCard: -1,
    message: 'Click a card to play it. End your turn when you are done.',
    over: false,
  };
}

export function startGame(world) {
  world.rng = mulberry32(world.seed);
  world.player = makeSide(world.rng);
  world.enemy = makeSide(world.rng);
  drawCards(world.player, START_HAND);
  drawCards(world.enemy, START_HAND);
  world.turn = 1;
  world.phase = 'player';
  world.screen = 'play';
  world.over = false;
  world.log = ['The duel begins. Your move, duellist.'];
  world.floats = [];
  world.playAnim = null;
  world.aiQueue = [];
  world.confetti = [];
  beginTurn(world, world.player);
}

function embersForTurn(turn) {
  return Math.min(10, turn + 2);
}

function beginTurn(world, side) {
  side.block = 0;
  side.embers = embersForTurn(world.turn);
  drawCards(side, 1);
}

export function canPlayCard(world, card) {
  return world.screen === 'play' && world.phase === 'player' && !world.over
    && card.cost <= world.player.embers;
}

export function dealDamage(world, side, amount, x, y) {
  const absorbed = Math.min(side.block, amount);
  side.block -= absorbed;
  const through = amount - absorbed;
  side.life -= through;
  world.floats.push({ x, y, text: `-${through}`, color: '#ff5a3c', t: 0, big: true });
  if (absorbed > 0) world.floats.push({ x, y: y + 26, text: `blocked ${absorbed}`, color: '#9fd8ff', t: 0, big: false });
  if (side.life <= 0) side.life = 0;
}

export function healSide(world, side, amount, x, y) {
  const healed = Math.min(side.maxLife - side.life, amount);
  side.life += healed;
  if (healed > 0) world.floats.push({ x, y, text: `+${healed}`, color: '#7ddc7d', t: 0, big: true });
}

export function applyCard(world, side, foe, card, fx, fy) {
  side.embers -= card.cost;
  const fromHand = side.hand.indexOf(card);
  if (fromHand >= 0) side.hand.splice(fromHand, 1);
  side.discard.push(card);
  world.playAnim = { card, who: side === world.player ? 'player' : 'enemy', t: 0 };
  if (card.kind === 'damage') dealDamage(world, foe, card.power, fx, fy);
  if (card.kind === 'damage-draw') { dealDamage(world, foe, card.power, fx, fy); drawCards(side, 1); }
  if (card.kind === 'block') { side.block += card.power; world.floats.push({ x: fx, y: fy, text: `+${card.power} block`, color: '#9fd8ff', t: 0, big: true }); }
  if (card.kind === 'heal') healSide(world, side, card.power, fx, fy);
  if (card.kind === 'heal-draw') { healSide(world, side, card.power, fx, fy); drawCards(side, 1); }
  if (card.kind === 'draw') drawCards(side, card.power);
  const who = side === world.player ? 'You play' : 'Cinder plays';
  world.log.push(`${who} ${card.name}.`);
  if (world.log.length > 3) world.log.shift();
  checkEnd(world);
}

export function playPlayerCard(world, handIndex) {
  if (world.phase !== 'player' || world.screen !== 'play' || world.over) return false;
  const card = world.player.hand[handIndex];
  if (!card || card.cost > world.player.embers) return false;
  applyCard(world, world.player, world.enemy, card, 640, 330);
  return true;
}

export function endPlayerTurn(world) {
  if (world.phase !== 'player' || world.screen !== 'play' || world.over) return;
  world.phase = 'ai';
  world.enemy.block = 0;
  world.enemy.embers = embersForTurn(world.turn);
  drawCards(world.enemy, 1);
  world.aiQueue = chooseMoves(world.enemy, world.player, world.rng);
  world.aiTimer = 0.7;
  world.message = 'Cinder is thinking…';
}

function checkEnd(world) {
  if (world.over) return;
  if (world.enemy.life <= 0) {
    world.over = true;
    world.screen = 'win';
    world.message = 'Cinder is beaten. The embers are yours.';
    burstConfetti(world);
  } else if (world.player.life <= 0) {
    world.over = true;
    world.screen = 'loss';
    world.message = 'Your embers fade. Cinder takes the table.';
  }
}

function burstConfetti(world) {
  const colors = ['#e8b93c', '#d8442e', '#2f8fe0', '#3da33d', '#f6efdc'];
  for (let i = 0; i < 90; i += 1) {
    world.confetti.push({
      x: 80 + world.rng() * 1120,
      y: -20 - world.rng() * 160,
      vx: (world.rng() - 0.5) * 60,
      vy: 90 + world.rng() * 140,
      size: 6 + world.rng() * 8,
      color: colors[i % colors.length],
      rot: world.rng() * Math.PI,
      vr: (world.rng() - 0.5) * 4,
    });
  }
}

export function update(world, dt) {
  for (let i = world.floats.length - 1; i >= 0; i -= 1) {
    world.floats[i].t += dt;
    if (world.floats[i].t > 1.1) world.floats.splice(i, 1);
  }
  if (world.playAnim) {
    world.playAnim.t += dt;
    if (world.playAnim.t > 0.9) world.playAnim = null;
  }
  for (const c of world.confetti) {
    c.y += c.vy * dt;
    c.x += c.vx * dt;
    c.rot += c.vr * dt;
    if (c.y > 820) { c.y = -20; c.x = 80 + world.rng() * 1120; }
  }
  if (world.frozen || world.over || world.screen !== 'play') return;
  if (world.phase === 'ai') {
    world.aiTimer -= dt;
    if (world.aiTimer <= 0) {
      const next = world.aiQueue.shift();
      if (next) {
        const idx = world.enemy.hand.indexOf(next);
        if (idx >= 0 && next.cost <= world.enemy.embers) {
          applyCard(world, world.enemy, world.player, next, 640, 470);
        }
        world.aiTimer = 0.75;
      } else {
        world.turn += 1;
        world.phase = 'player';
        beginTurn(world, world.player);
        world.message = `Turn ${world.turn} — your move.`;
      }
    }
  }
}
