// Shared helpers for the labs that work with Java's whole-number types.
//
// JavaScript's bitwise operators (`&`, `|`, `~`, `<<`, `>>`, `>>>`) work on 32-bit two's-complement
// integers, which is exactly a Java `int`. So `(v << 24) >> 24` here is Java's `(byte) v`, and
// `v | 0` is Java's `(int) v` for any whole number in range. No other emulation is needed.
(function () {
  "use strict";

  /** Java's narrowing cast `(byte) v`: keep the low 8 bits, then read bit 7 as -128. */
  function toByte(v) {
    return (v << 24) >> 24;
  }

  /** The low 8 bits read as an unsigned number 0..255: Java's `v & 0xFF`. */
  function u8(v) {
    return v & 0xff;
  }

  /** The bits of a value, most significant first, as an array of 0/1. */
  function bitsOf(v, width) {
    const out = [];
    for (let i = width - 1; i >= 0; i--) out.push((v >>> i) & 1);
    return out;
  }

  /** "1000 0010" style text: groups of `group` bits separated by a space. */
  function bitText(v, width, group) {
    const bits = bitsOf(v, width).join("");
    const size = group || 4;
    const parts = [];
    for (let i = 0; i < bits.length; i += size) parts.push(bits.slice(i, i + size));
    return parts.join(" ");
  }

  /** Java's Integer.toHexString(v): the 32 bits as unsigned hex, no leading zeros. */
  function hexInt(v) {
    return (v >>> 0).toString(16);
  }

  /** Two-digit upper-case hex of the low 8 bits, as in 0x82. */
  function hex8(v) {
    return (v & 0xff).toString(16).toUpperCase().padStart(2, "0");
  }

  /** A signed number with an explicit sign for positives: "+5", "-126", "0". */
  function signed(v) {
    return v > 0 ? "+" + v : String(v).replace("-", "−");
  }

  /** A number with a real minus sign (U+2212), so it lines up and reads well. */
  function num(v) {
    return String(v).replace("-", "−");
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  window.Bits = { toByte, u8, bitsOf, bitText, hexInt, hex8, signed, num, reducedMotion };
})();
