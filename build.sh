#!/bin/bash
TARGET_BUILD_FILE=build-$(date +%Y%m%d-%H%M%S).zip

if [ ! -d "node_modules" ]; then
  npm install
fi

zip --quiet --recurse-paths $TARGET_BUILD_FILE .
echo "Build: $TARGET_BUILD_FILE"


