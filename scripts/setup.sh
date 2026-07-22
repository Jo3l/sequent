#!/bin/bash
# Sequent setup — ensures system dependencies are installed.
# Run with: bash scripts/setup.sh
set -e

MISSING=""

# unar (for CBR/CBZ extraction)
if ! command -v unar &>/dev/null; then
  MISSING="$MISSING unar"
fi

# poppler-utils (for PDF to image conversion via pdftoppm)
if ! command -v pdftoppm &>/dev/null; then
  MISSING="$MISSING poppler-utils"
fi

# libvips with PDF support (needed if sharp is used for PDF)
# This is optional — pdftoppm handles PDFs if sharp can't.
if ! ldconfig -p 2>/dev/null | grep -q libvips; then
  MISSING="$MISSING libvips42"
fi

if [ -n "$MISSING" ]; then
  echo "⚠️  Missing system packages:$MISSING"
  echo ""
  echo "Run the following command to install them:"
  echo "  sudo apt-get install -y$MISSING"
  echo ""
  read -p "Install now? [y/N] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo apt-get install -y$MISSING
    echo "✅ System dependencies installed."
  else
    echo "⚠️  Skipping. Some features may not work (PDF rendering, CBR/CBZ extraction)."
  fi
else
  echo "✅ All system dependencies found."
fi
