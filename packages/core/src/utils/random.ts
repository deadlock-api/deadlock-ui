// Port of Valve's CUniformRandomStream (Source SDK, vstdlib/random.cpp), the
// seeded generator the game uses to roll corrupted items.

const IA = 16807;
const IM = 2147483647;
const IQ = 127773;
const IR = 2836;
const NTAB = 32;
const NDIV = 1 + Math.trunc((IM - 1) / NTAB);
const AM = 1 / IM;
const RNMX = Math.fround(1 - 1.2e-7);

export class UniformRandomStream {
  private idum: number;
  private iy = 0;
  private iv = new Array<number>(NTAB).fill(0);

  constructor(seed: number) {
    seed |= 0;
    this.idum = seed < 0 ? seed : -seed;
  }

  private next(): number {
    if (this.idum <= 0 || !this.iy) {
      this.idum = -this.idum < 1 ? 1 : -this.idum;
      for (let j = NTAB + 7; j >= 0; j--) {
        this.step();
        if (j < NTAB) this.iv[j] = this.idum;
      }
      this.iy = this.iv[0];
    }
    this.step();
    const j = Math.trunc(this.iy / NDIV);
    this.iy = this.iv[j];
    this.iv[j] = this.idum;
    return this.iy;
  }

  private step() {
    const k = Math.trunc(this.idum / IQ);
    this.idum = IA * (this.idum - k * IQ) - IR * k;
    if (this.idum < 0) this.idum += IM;
  }

  /** Float in [low, high), computed in single precision like the game. */
  randomFloat(low: number, high: number): number {
    let fl = Math.fround(AM * this.next());
    if (fl > RNMX) fl = RNMX;
    return Math.fround(Math.fround(fl * Math.fround(high - low)) + low);
  }
}
