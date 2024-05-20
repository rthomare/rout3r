#! /bin/bash

# Check for --full flag
if [ "$1" == "--full" ]; then
  if lsof -i :5173 -sTCP:LISTEN >/dev/null; then
    echo "Vite frontend running already, check other tabs."
  fi

  if lsof -i :8545 -sTCP:LISTEN >/dev/null; then
    echo "Anvil chain is running, check other tabs."
  fi

  echo "Starting (full) dev environment..."

  # Start ANVIL
  echo "Starting Anvil chain..."
  anvil & ANVIL_PID=$!
  echo "Anvil chain started."

  # Start VITE after small delay (with env var for full dev mode)
  echo "Starting Vite frontend..."
  sleep 2 && VITE_FULL_DEV=1 yarn run vite & VITE_PID=$!
  echo "Vite frontend started."
  echo "Start building! 🍻"

  # Make sure processes end when script ends
  trap "kill -TERM $ANVIL_PID $VITE_PID; exit 0" EXIT

  # Wait until ctrl-c or subprocess killed
  wait
else
  if lsof -i :5173 -sTCP:LISTEN >/dev/null; then
    echo "Vite frontend running already, check other tabs."
  fi

  echo "Starting (shallow) dev environment..."

  # Start VITE
  echo "Starting Vite frontend..."
  yarn run vite & VITE_PID=$!
  echo "Vite frontend started."
  echo "Start building! 🍻"

  # Make sure processes end when script ends
  trap "kill -TERM $VITE_PID; exit 0" EXIT

  # Wait until ctrl-c or subprocess killed
  wait
fi



