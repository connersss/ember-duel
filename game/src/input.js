// Ember Duel: mouse and keyboard. One job: turn device events into game events.
// Coordinates arrive already converted to the 1280x800 logical table.
export function attachInput(canvas, toLogical, onEvent) {
  canvas.addEventListener('mousemove', (event) => {
    const p = toLogical(event.clientX, event.clientY);
    onEvent({ type: 'move', x: p.x, y: p.y });
  });
  canvas.addEventListener('click', (event) => {
    const p = toLogical(event.clientX, event.clientY);
    onEvent({ type: 'click', x: p.x, y: p.y });
  });
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Enter' || event.code === 'Space') { event.preventDefault(); onEvent({ type: 'confirm' }); }
    if (event.code === 'KeyR') onEvent({ type: 'restart' });
    if (event.code === 'Escape') onEvent({ type: 'restart' });
    const digit = /^Digit([1-7])$/.exec(event.code);
    if (digit) onEvent({ type: 'play', index: Number(digit[1]) - 1 });
  });
}
