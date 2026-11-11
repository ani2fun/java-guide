// Shared helpers for the Deep Dives labs.
//
// A JavaScript `number` is the same IEEE 754 binary64 value as a Java `double`, and `+` rounds
// the same way in both languages, so every double the labs compute is bit-for-bit what Java
// computes. Two things differ and are rebuilt here:
//   * printing: Java's Double.toString formats differently from JavaScript's (`300000.0` vs
//     `300000`, `1.0E-4` vs `0.0001`), so javaDouble() reproduces Java's rules;
//   * exact decimals: JavaScript has no BigDecimal, so exact values are BigInt digit strings
//     with a scale, which is exactly how BigDecimal stores them (unscaled value + scale).
(function () {
  "use strict";

  // ── Theme: follow the Synapse reader's light/dark choice ────────────────────────────────
  // The lab is framed same-origin, so it can read the parent's <html class="dark">. Standalone
  // (opened directly), it falls back to the operating system's preference.
  function theme() {
    let dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    try {
      const root = window.parent && window.parent !== window ? window.parent.document.documentElement : null;
      if (root) {
        dark = root.classList.contains("dark");
        if (!theme.watching) {
          theme.watching = true;
          new MutationObserver(theme).observe(root, { attributes: true, attributeFilter: ["class"] });
        }
      }
    } catch (e) {
      // Not same-origin: keep the media query.
    }
    document.documentElement.classList.toggle("dark", dark);
  }
  theme();
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", theme);
  }

  // ── The 64 bits of a double ─────────────────────────────────────────────────────────────
  const view = new DataView(new ArrayBuffer(8));

  /** The raw IEEE 754 fields, as Double.doubleToRawLongBits would see them. */
  function fields(d) {
    view.setFloat64(0, d);
    const bits = view.getBigUint64(0);
    const sign = Number(bits >> 63n);
    const exponent = Number((bits >> 52n) & 0x7ffn);
    const fraction = bits & ((1n << 52n) - 1n);
    const text = bits.toString(2).padStart(64, "0");
    return { bits, sign, exponent, fraction, text, hex: bits.toString(16).toUpperCase().padStart(16, "0") };
  }

  /** The double as an exact dyadic rational: value = (-1)^sign · m · 2^e, with m a BigInt. */
  function dyadic(d) {
    const f = fields(d);
    if (f.exponent === 0x7ff) throw new Error("not a finite double");
    let m = f.fraction;
    let e;
    if (f.exponent === 0) {
      e = -1074; // subnormal: no hidden 1
    } else {
      m |= 1n << 52n; // the hidden leading 1
      e = f.exponent - 1075;
    }
    return { sign: f.sign, m, e };
  }

  // ── Exact decimals: { n: BigInt unscaled value, s: scale }, value = n / 10^s ───────────────
  /** The exact decimal a double holds: what `new BigDecimal(d)` stores. */
  function exact(d) {
    const { sign, m, e } = dyadic(d);
    let n;
    let s;
    if (e >= 0) {
      n = m << BigInt(e);
      s = 0;
    } else {
      // m / 2^k = m · 5^k / 10^k
      n = m * 5n ** BigInt(-e);
      s = -e;
    }
    return strip({ n: sign ? -n : n, s });
  }

  /** Parse a decimal literal such as "0.10" exactly, keeping its scale: new BigDecimal("0.10"). */
  function parse(text) {
    const t = String(text).trim();
    const m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(t);
    if (!m || (m[2] === "" && (m[3] === undefined || m[3] === ""))) return null;
    const frac = m[3] || "";
    const n = BigInt((m[2] || "0") + frac);
    return { n: m[1] === "-" ? -n : n, s: frac.length };
  }

  function rescale(x, s) {
    return x.s >= s ? x : { n: x.n * 10n ** BigInt(s - x.s), s };
  }

  /** Remove trailing zeros (BigDecimal.stripTrailingZeros, but never below scale 0). */
  function strip(x) {
    let { n, s } = x;
    while (s > 0 && n % 10n === 0n) {
      n /= 10n;
      s -= 1;
    }
    return { n, s };
  }

  function add(a, b) {
    const s = Math.max(a.s, b.s);
    return { n: rescale(a, s).n + rescale(b, s).n, s };
  }
  function sub(a, b) {
    return add(a, { n: -b.n, s: b.s });
  }
  function mul(a, k) {
    return { n: a.n * BigInt(k), s: a.s };
  }
  function cmp(a, b) {
    const s = Math.max(a.s, b.s);
    const x = rescale(a, s).n;
    const y = rescale(b, s).n;
    return x < y ? -1 : x > y ? 1 : 0;
  }

  /** BigDecimal.toPlainString: every digit of the scale, no exponent. */
  function plain(x) {
    const neg = x.n < 0n;
    let digits = (neg ? -x.n : x.n).toString();
    if (x.s === 0) return (neg ? "-" : "") + digits;
    digits = digits.padStart(x.s + 1, "0");
    return (neg ? "-" : "") + digits.slice(0, digits.length - x.s) + "." + digits.slice(digits.length - x.s);
  }

  // ── Java's Double.toString ──────────────────────────────────────────────────────────────
  // JDK 19+ prints the shortest decimal that rounds back to the same double. JavaScript does
  // the same, with one difference: when the shortest has a single digit, Java may print a
  // two-digit decimal that is closer to the double (Double.MIN_VALUE is 4.9E-324, not 5E-324).
  function javaDouble(d) {
    if (Number.isNaN(d)) return "NaN";
    if (d === Infinity) return "Infinity";
    if (d === -Infinity) return "-Infinity";
    if (d === 0) return Object.is(d, -0) ? "-0.0" : "0.0";
    const neg = d < 0;
    const a = Math.abs(d);
    let [mant, expText] = a.toExponential().split("e");
    let digits = mant.replace(".", "");
    if (digits.length === 1) {
      const two = a.toPrecision(2);
      if (Number(two) === a) {
        const [m2, e2] = Number(two).toExponential(1).split("e");
        const d2 = m2.replace(".", "").replace(/0$/, "");
        if (d2 !== digits || e2 !== expText) {
          digits = d2;
          expText = e2;
        }
      }
    }
    const k = Number(expText);
    let out;
    if (a >= 1e-3 && a < 1e7) {
      if (k >= 0) {
        const intPart = digits.slice(0, k + 1).padEnd(k + 1, "0");
        const frac = digits.slice(k + 1) || "0";
        out = intPart + "." + frac;
      } else {
        out = "0." + "0".repeat(-k - 1) + digits;
      }
    } else {
      out = digits[0] + "." + (digits.slice(1) || "0") + "E" + k;
    }
    return (neg ? "-" : "") + out;
  }

  // ── Binary expansion of a positive rational, from its leading 1 ─────────────────────────
  // Returns the power of two of the leading bit (E) and up to `count` bits starting with it,
  // and whether the expansion ended (a remainder of zero) within those bits.
  function binary(num, den, count) {
    if (num === 0n) return { E: 0, bits: "0", ended: true };
    let E = 0;
    while (num >= 2n * den) {
      den *= 2n;
      E += 1;
    }
    while (num < den) {
      num *= 2n;
      E -= 1;
    }
    let bits = "";
    let ended = false;
    for (let i = 0; i < count; i++) {
      if (num >= den) {
        bits += "1";
        num -= den;
      } else {
        bits += "0";
      }
      if (num === 0n) {
        ended = true;
        break;
      }
      num *= 2n;
    }
    return { E, bits, ended };
  }

  /** A decimal { n, s } as the rational num/den the binary expansion needs. */
  function ratio(x) {
    return { num: x.n < 0n ? -x.n : x.n, den: 10n ** BigInt(x.s) };
  }

  function thousands(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  window.Lab = { theme, fields, dyadic, exact, parse, strip, add, sub, mul, cmp, plain, rescale, javaDouble, binary, ratio, thousands };
})();
