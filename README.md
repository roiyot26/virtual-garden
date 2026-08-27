# Virtual Garden

A Chrome extension: a zen garden that thrives with your productivity.

Time on sites you mark productive (code, docs, design) grows it. Time on the rest lets it wilt. Five phases (Thriving to Neglected) with hysteresis, so it does not flicker at the edges. A quiet zen dish sits on the page. The popup shows today's score. Options lets you edit domain lists.

The four garden types (zen, cosmic, ocean, pixel) play here: https://roiyot26.github.io/virtual-garden/

## Load unpacked

npm i
npm run build

Chrome → Extensions → Developer mode → Load unpacked → `.output/chrome-mv3`.

## Tests

npm test

Scoring: productive / (productive + non-productive). Neutral sites do not dilute it. Under five minutes of tracked time the garden stays at 50.

MIT
