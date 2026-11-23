# Ember Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/connersss/ember-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/connersss/ember-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

A duel of cunning cards against Cinder, the Ash Warden.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080.

---

<sub>Entered on [make.fun](https://make.fun/?ref=2ywg2db9&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>

Ember Duel is an original 2D canvas card battler. You and Cinder each hold 30 life and a hand of ember cards: Flame strikes, Frost guards, Leaf mends and Spark tricks. Each turn your embers refill and you play what you can afford; Cinder answers with moves you can read and counter. Bring Cinder to 0 life before yours runs out.

- Click a card to play it, or press keys 1–7. Enter ends your turn. R starts a new duel.
- Cards are told apart by colour and shape both: Flame is a red triangle, Frost a blue diamond, Leaf a green circle, Spark a yellow star.
- No network requests, no assets: static files only, with tiny WebAudio bleeps.

`main.ts` hands the game in: it copies `game/` and `screenshots/` to `/output` and writes `dossier.json`. Check it with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.
