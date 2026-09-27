#!/usr/bin/env bash
# Make JDK 21 available for _tooling/prove.py in a fresh Linux environment (a cloud session).
# The proofs need JDK 21 itself: launcher messages differ between versions.
set -euo pipefail

if ls -d /usr/lib/jvm/*21*/bin/javac >/dev/null 2>&1 || [ -n "${JAVA21_HOME:-}" ]; then
  echo "JDK 21 already present."
else
  SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"
  $SUDO apt-get update -qq
  $SUDO apt-get install -y -qq openjdk-21-jdk-headless
fi

home="${JAVA21_HOME:-$(ls -d /usr/lib/jvm/*21* | head -1)}"
"$home/bin/javac" -version
"$home/bin/java" -version 2>&1 | head -1
echo "prove.py will find it at $home (or export JAVA21_HOME=$home)."
