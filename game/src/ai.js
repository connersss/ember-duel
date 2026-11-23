// Ember Duel: Cinder's brain. One job: pick the enemy's moves.
// Readable on purpose: it takes a kill when it sees one, guards when hurt,
// and otherwise plays its biggest hit. A player can read it and counter it.
export function chooseMoves(enemy, player) {
  const moves = [];
  let embers = enemy.embers;
  const hand = enemy.hand.slice();
  const affordable = () => hand.filter((c) => c.cost <= embers && !moves.includes(c));
  const damageCards = () => affordable().filter((c) => c.kind === 'damage' || c.kind === 'damage-draw');
  const guardCards = () => affordable().filter((c) => c.kind === 'block');
  const healCards = () => affordable().filter((c) => c.kind === 'heal' || c.kind === 'heal-draw');

  for (let plays = 0; plays < 3; plays += 1) {
    // 1. Lethal: a hit that ends the duel now.
    const lethal = damageCards().find((c) => c.power >= player.life + player.block);
    if (lethal) { moves.push(lethal); embers -= lethal.cost; continue; }
    // 2. Hurt and low: mend or guard before hitting.
    if (enemy.life <= 12) {
      const heal = healCards().sort((a, b) => b.power - a.power)[0];
      if (heal) { moves.push(heal); embers -= heal.cost; continue; }
      const guard = guardCards().sort((a, b) => b.power - a.power)[0];
      if (guard) { moves.push(guard); embers -= guard.cost; continue; }
    }
    // 3. Biggest hit it can afford.
    const hit = damageCards().sort((a, b) => b.power - a.power)[0];
    if (hit) { moves.push(hit); embers -= hit.cost; continue; }
    // 4. Nothing to hit with: draw, then stop.
    const draw = affordable().find((c) => c.kind === 'draw');
    if (draw) { moves.push(draw); embers -= draw.cost; }
    break;
  }
  return moves;
}
