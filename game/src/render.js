// Ember Duel: drawing only. One job: pixels out, state in.
// The 1280x800 table is scaled to fit the window; every layout number below
// is in that logical space, so screenshots and play look the same.
import { VIEW, CARD, COLORS, ELEMENTS } from './config.js';

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawShape(ctx, shape, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (shape === 'triangle') {
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y + r * 0.8);
    ctx.lineTo(x - r, y + r * 0.8);
  } else if (shape === 'diamond') {
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
  } else if (shape === 'star') {
    for (let i = 0; i < 10; i += 1) {
      const ang = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? r : r * 0.45;
      const px = x + Math.cos(ang) * rad;
      const py = y + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
  } else {
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }
  ctx.closePath();
  ctx.fill();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

/** Player hand card rects, in the same order as world.player.hand. */
export function handCardRects(count) {
  const overlap = 38;
  const total = count * CARD.width - (count - 1) * overlap;
  const x0 = (VIEW.width - total) / 2;
  const rects = [];
  for (let i = 0; i < count; i += 1) rects.push({ x: x0 + i * (CARD.width - overlap), y: 566, w: CARD.width, h: CARD.height });
  return rects;
}

export function endTurnRect() {
  return { x: 1080, y: 700, w: 170, h: 56 };
}

function drawCardBack(ctx, x, y, w, h) {
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#5a1f1a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.gold;
  ctx.stroke();
  drawShape(ctx, 'triangle', x + w / 2, y + h / 2 - 6, Math.min(w, h) * 0.22, COLORS.gold);
  ctx.fillStyle = COLORS.gold;
  ctx.font = `bold ${Math.round(w * 0.11)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('EMBER', x + w / 2, y + h - 14);
}

function drawCardFace(ctx, card, x, y, w, h, opts = {}) {
  const el = ELEMENTS[card.element];
  const scale = w / CARD.width;
  ctx.save();
  if (opts.dim) ctx.globalAlpha = 0.55;
  if (opts.lift) { ctx.shadowColor = 'rgba(232,185,60,0.9)'; ctx.shadowBlur = 22; }
  rr(ctx, x, y, w, h, 12 * scale);
  ctx.fillStyle = COLORS.cream;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 3 * scale;
  ctx.strokeStyle = el.color;
  ctx.stroke();
  rr(ctx, x + 6 * scale, y + 6 * scale, w - 12 * scale, h - 12 * scale, 8 * scale);
  ctx.lineWidth = 1 * scale;
  ctx.strokeStyle = '#d8cbb0';
  ctx.stroke();
  // Cost orb, top left.
  ctx.beginPath();
  ctx.arc(x + 24 * scale, y + 24 * scale, 17 * scale, 0, Math.PI * 2);
  ctx.fillStyle = opts.dim ? '#a33' : COLORS.gold;
  ctx.fill();
  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = '#7a5a10';
  ctx.stroke();
  ctx.fillStyle = '#241f1a';
  ctx.font = `bold ${Math.round(22 * scale)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(card.cost), x + 24 * scale, y + 25 * scale);
  // Element icon, top right: colour AND shape.
  drawShape(ctx, el.shape, x + w - 26 * scale, y + 26 * scale, 13 * scale, el.color);
  ctx.fillStyle = el.color;
  ctx.font = `bold ${Math.round(11 * scale)}px ${FONT}`;
  ctx.fillText(el.name.toUpperCase(), x + w - 26 * scale, y + 48 * scale);
  // Name.
  ctx.fillStyle = COLORS.ink;
  ctx.font = `bold ${Math.round(17 * scale)}px ${FONT}`;
  ctx.fillText(card.name, x + w / 2, y + 78 * scale);
  // Power: big number with its kind.
  const kindLabel = { damage: 'DAMAGE', block: 'BLOCK', heal: 'HEAL', draw: 'DRAW', 'damage-draw': 'DAMAGE + DRAW', 'heal-draw': 'HEAL + DRAW' }[card.kind];
  ctx.fillStyle = el.color;
  ctx.font = `bold ${Math.round(46 * scale)}px ${FONT}`;
  ctx.fillText(String(card.power), x + w / 2, y + 122 * scale);
  ctx.fillStyle = COLORS.muted;
  ctx.font = `bold ${Math.round(10 * scale)}px ${FONT}`;
  ctx.fillText(kindLabel, x + w / 2, y + 146 * scale);
  // Rules text.
  ctx.fillStyle = COLORS.ink;
  ctx.font = `${Math.round(13 * scale)}px ${FONT}`;
  const lines = wrapText(ctx, card.text, w - 24 * scale);
  lines.forEach((line, i) => ctx.fillText(line, x + w / 2, y + (168 + i * 16) * scale));
  ctx.restore();
}

function drawLifeBar(ctx, x, y, w, life, maxLife, label) {
  rr(ctx, x, y, w, 26, 13);
  ctx.fillStyle = '#0c0f0d';
  ctx.fill();
  const frac = Math.max(0, life / maxLife);
  if (frac > 0) {
    rr(ctx, x + 2, y + 2, (w - 4) * frac, 22, 11);
    ctx.fillStyle = frac > 0.5 ? '#4da34d' : frac > 0.25 ? '#d8a03c' : '#d8442e';
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.font = `bold 15px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label}  ${life} / ${maxLife}`, x + w / 2, y + 14);
}

function drawEmberPips(ctx, x, y, embers, maxEmbers) {
  ctx.fillStyle = '#eaf3fb';
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('EMBERS', x, y);
  for (let i = 0; i < maxEmbers; i += 1) {
    const cx = x + 78 + i * 24;
    ctx.beginPath();
    ctx.arc(cx, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < embers ? COLORS.gold : '#234d38';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0c0f0d';
    ctx.stroke();
    if (i < embers) drawShape(ctx, 'triangle', cx, y, 4, '#7a4a00');
  }
}

function drawBlockBadge(ctx, x, y, block) {
  if (block <= 0) return;
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x + 11, y - 7);
  ctx.lineTo(x + 11, y + 6);
  ctx.quadraticCurveTo(x + 11, y + 14, x, y + 18);
  ctx.quadraticCurveTo(x - 11, y + 14, x - 11, y + 6);
  ctx.lineTo(x - 11, y - 7);
  ctx.closePath();
  ctx.fillStyle = '#2f8fe0';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(block), x, y + 2);
}

function drawTable(ctx) {
  const grad = ctx.createRadialGradient(640, 400, 100, 640, 400, 760);
  grad.addColorStop(0, COLORS.table);
  grad.addColorStop(1, COLORS.tableDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.strokeStyle = COLORS.feltLine;
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, VIEW.width - 28, VIEW.height - 28);
  // Centre emblem: a big ember flame behind the play zone.
  ctx.save();
  ctx.globalAlpha = 0.16;
  drawShape(ctx, 'triangle', 640, 380, 90, COLORS.gold);
  ctx.restore();
}

function drawSideHeader(ctx, world, isPlayer) {
  const side = isPlayer ? world.player : world.enemy;
  const name = isPlayer ? 'YOU' : 'CINDER';
  const y = isPlayer ? 512 : 66;
  ctx.fillStyle = '#eaf3fb';
  ctx.font = `bold 20px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 40, y);
  drawLifeBar(ctx, 300, y - 13, 340, side.life, side.maxLife, isPlayer ? 'LIFE' : 'LIFE');
  drawBlockBadge(ctx, 668, y, side.block);
  drawEmberPips(ctx, 740, y, side.embers, side.maxEmbers);
}

function drawPlayScreen(ctx, world) {
  drawTable(ctx);
  // Top bar.
  ctx.fillStyle = '#eaf3fb';
  ctx.font = `bold 15px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('EMBER DUEL', 40, 30);
  ctx.textAlign = 'center';
  ctx.fillText(`TURN ${world.turn}`, 640, 30);
  ctx.textAlign = 'right';
  ctx.fillText(`Your deck ${world.player.deck.length}  ·  Cinder's deck ${world.enemy.deck.length}`, 1240, 30);
  // Enemy hand, face down.
  const backs = world.enemy.hand.length;
  const bw = CARD.smallWidth;
  const overlap = 26;
  const totalW = backs * bw - (backs - 1) * overlap;
  const bx0 = (VIEW.width - totalW) / 2;
  for (let i = 0; i < backs; i += 1) drawCardBack(ctx, bx0 + i * (bw - overlap), 108, bw, CARD.smallHeight);
  drawSideHeader(ctx, world, false);
  // Centre: last played card, sliding in, or the log.
  if (world.playAnim) {
    const t = world.playAnim.t;
    const slide = Math.min(1, t / 0.25);
    const alpha = t < 0.65 ? 1 : Math.max(0, 1 - (t - 0.65) / 0.25);
    const fromY = world.playAnim.who === 'player' ? 620 : 140;
    const y = fromY + (300 - fromY) * slide;
    ctx.save();
    ctx.globalAlpha = alpha;
    drawCardFace(ctx, world.playAnim.card, 565, y, CARD.width, CARD.height);
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(234,243,251,0.85)';
    ctx.font = `15px ${FONT}`;
    ctx.textAlign = 'center';
    world.log.forEach((line, i) => ctx.fillText(line, 640, 330 + i * 22));
  }
  drawSideHeader(ctx, world, true);
  // Player hand.
  const rects = handCardRects(world.player.hand.length);
  world.player.hand.forEach((card, i) => {
    const r = rects[i];
    const hover = world.hoverCard === i && world.phase === 'player';
    const afford = card.cost <= world.player.embers;
    drawCardFace(ctx, card, r.x, r.y - (hover ? 20 : 0), r.w, r.h, { dim: !afford && world.phase === 'player', lift: hover });
  });
  // End turn button.
  const b = endTurnRect();
  const yourTurn = world.phase === 'player' && !world.over;
  rr(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fillStyle = yourTurn ? COLORS.button : '#3a4a42';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0c0f0d';
  ctx.stroke();
  ctx.fillStyle = yourTurn ? '#241f1a' : '#9fb3a8';
  ctx.font = `bold 19px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(yourTurn ? 'END TURN' : 'CINDER…', b.x + b.w / 2, b.y + b.h / 2 + 1);
  // Hint / message line.
  ctx.fillStyle = '#cfe3d4';
  ctx.font = `14px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(world.message, 640, 772);
  // Floating damage numbers.
  for (const f of world.floats) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
    ctx.fillStyle = f.color;
    ctx.font = `bold ${f.big ? 34 : 17}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y - f.t * 46);
    ctx.restore();
  }
}

function drawTitleScreen(ctx, world) {
  drawTable(ctx);
  ctx.save();
  ctx.fillStyle = 'rgba(10,20,14,0.72)';
  rr(ctx, 190, 90, 900, 620, 24);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = COLORS.gold;
  ctx.font = `bold 84px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EMBER DUEL', 640, 190);
  drawShape(ctx, 'triangle', 640, 258, 16, '#d8442e');
  ctx.fillStyle = '#eaf3fb';
  ctx.font = `22px ${FONT}`;
  ctx.fillText('A duel of cunning cards against Cinder, the Ash Warden.', 640, 300);
  ctx.font = `16px ${FONT}`;
  ctx.fillStyle = '#cfe3d4';
  ctx.fillText('Spend embers. Play strikes, guards and mends. Bring Cinder to 0 life.', 640, 334);
  // Three sample cards, fanned.
  const samples = [
    { id: 'x', name: 'Ember Burst', element: 'flame', cost: 4, kind: 'damage', power: 9, text: 'Deal 9 damage.' },
    { id: 'x', name: 'Leaf Mend', element: 'leaf', cost: 3, kind: 'heal', power: 7, text: 'Restore 7 life.' },
    { id: 'x', name: 'Frost Guard', element: 'frost', cost: 1, kind: 'block', power: 6, text: 'Gain 6 block.' },
  ];
  samples.forEach((card, i) => {
    const x = 415 + i * 165;
    ctx.save();
    ctx.translate(x + 75, 455);
    ctx.rotate((i - 1) * 0.07);
    drawCardFace(ctx, card, -75, -105, CARD.width, CARD.height);
    ctx.restore();
  });
  ctx.fillStyle = COLORS.gold;
  ctx.font = `bold 26px ${FONT}`;
  ctx.fillText('Click or press Enter to duel', 640, 640);
  ctx.fillStyle = '#9fb3a8';
  ctx.font = `14px ${FONT}`;
  ctx.fillText('Mouse or keys 1–7 to play a card · Enter to end turn · R to restart', 640, 676);
}

function drawEndScreen(ctx, world, won) {
  drawTable(ctx);
  for (const c of world.confetti) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
    ctx.restore();
  }
  ctx.save();
  ctx.fillStyle = won ? 'rgba(20,26,10,0.78)' : 'rgba(20,10,10,0.78)';
  rr(ctx, 290, 220, 700, 360, 24);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = won ? COLORS.gold : '#d8442e';
  ctx.font = `bold 76px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(won ? 'VICTORY!' : 'DEFEAT', 640, 320);
  ctx.fillStyle = '#eaf3fb';
  ctx.font = `21px ${FONT}`;
  ctx.fillText(won ? 'Cinder is beaten. The embers are yours.' : 'Your embers fade. Cinder takes the table.', 640, 392);
  ctx.fillStyle = '#cfe3d4';
  ctx.font = `17px ${FONT}`;
  ctx.fillText(`The duel lasted ${world.turn} turn${world.turn === 1 ? '' : 's'}.`, 640, 432);
  ctx.fillStyle = COLORS.gold;
  ctx.font = `bold 22px ${FONT}`;
  ctx.fillText('Press R to duel again', 640, 500);
}

export function drawWorld(ctx, world) {
  ctx.textBaseline = 'middle';
  if (world.screen === 'title') drawTitleScreen(ctx, world);
  else if (world.screen === 'win') drawEndScreen(ctx, world, true);
  else if (world.screen === 'loss') drawEndScreen(ctx, world, false);
  else drawPlayScreen(ctx, world);
}
