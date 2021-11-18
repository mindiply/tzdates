
export function intDiv(x: number, y: number) {
  const r = roundDown(x/y);
  return safeZero(r);
}

export function intMod(x: number, y: number) {
  return safeZero(roundDown(x - intDiv(x, y) * y));
}

export function roundDown(r: number){
  if (r < 0) {
    return Math.ceil(r);
  } else {
    return Math.floor(r);
  }
}

export function safeZero(value: number){
  return value === 0 ? 0 : +value;
}
