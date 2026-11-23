// Ember Duel: boot and the one loop. One job: wire input, world and renderer.
// ?seed=N fixes the deal. ?shot=start|play|win|end (with &seed=N) stages that
// scene instead of running the loop, paints it and sets window.__shotReady.
import { VIEW } from './config.js';
import { createWorld, startGame, playPlayerCard, endPlayerTurn, update } from './world.js';
import { attachInput } from './input.js';
import { drawWorld, handCardRects, endTurnRect } from './render.js';
import { stageShot } from './shots.js';
import { ensureAudio, sfxPlay, sfxDeal, sfxHit, sfxHeal, sfxWin, sfxLoss } from './audio.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');
const world = createWorld(seed);
let lastStatus = '';
let lastScreen = world.screen;

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.style.width = `${VIEW.width * scale}px`;
  canvas.style.height = `${VIEW.height * scale}px`;
  canvas.style.left = `${(window.innerWidth - VIEW.width * scale) / 2}px`;
  canvas.style.top = `${(window.innerHeight - VIEW.height * scale) / 2}px`;
  canvas.width = VIEW.width * dpr;
  canvas.height = VIEW.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

function toLogical(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return { x: (clientX - rect.left) / rect.width * VIEW.width, y: (clientY - rect.top) / rect.height * VIEW.height };
}

function hit(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function playCardSound(card) {
  if (card.kind === 'damage' || card.kind === 'damage-draw') sfxHit();
  else if (card.kind === 'heal' || card.kind === 'heal-draw') sfxHeal();
  else sfxPlay();
}

function onEvent(event) {
  if (event.type === 'move') {
    world.hoverCard = -1;
    if (world.screen === 'play' && world.phase === 'player') {
      const rects = handCardRects(world.player.hand.length);
      for (let i = 0; i < rects.length; i += 1) {
        if (hit(rects[i], event.x, event.y)) { world.hoverCard = i; break; }
      }
    }
    return;
  }
  if (event.type === 'click') {
    ensureAudio();
    if (world.screen === 'title') { startGame(world); sfxDeal(); return; }
    if (world.screen === 'win' || world.screen === 'loss') { startGame(world); sfxDeal(); return; }
    if (world.screen === 'play' && world.phase === 'player') {
      const rects = handCardRects(world.player.hand.length);
      for (let i = 0; i < rects.length; i += 1) {
        if (hit(rects[i], event.x, event.y)) {
          const card = world.player.hand[i];
          if (card && playPlayerCard(world, i)) playCardSound(card);
          return;
        }
      }
      if (hit(endTurnRect(), event.x, event.y)) endPlayerTurn(world);
    }
    return;
  }
  if (event.type === 'confirm') {
    ensureAudio();
    if (world.screen === 'title') { startGame(world); sfxDeal(); }
    else if (world.screen === 'win' || world.screen === 'loss') { startGame(world); sfxDeal(); }
    else if (world.screen === 'play') endPlayerTurn(world);
    return;
  }
  if (event.type === 'restart') {
    if (world.screen !== 'title') { ensureAudio(); startGame(world); sfxDeal(); }
    return;
  }
  if (event.type === 'play') {
    ensureAudio();
    const card = world.player && world.player.hand[event.index];
    if (card && playPlayerCard(world, event.index)) playCardSound(card);
  }
}

attachInput(canvas, toLogical, onEvent);

function announce() {
  let text = world.message;
  if (world.screen === 'play') text += ` You have ${world.player.life} life, Cinder has ${world.enemy.life}.`;
  if (text !== lastStatus) { statusEl.textContent = text; lastStatus = text; }
}

if (shot) {
  stageShot(shot, world);
  drawWorld(ctx, world);
  drawWorld(ctx, world);
  window.__shotReady = true;
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!world.frozen) update(world, dt);
    if (world.screen === 'win' && lastScreen !== 'win') sfxWin();
    if (world.screen === 'loss' && lastScreen !== 'loss') sfxLoss();
    lastScreen = world.screen;
    drawWorld(ctx, world);
    announce();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
