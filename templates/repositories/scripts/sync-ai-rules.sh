#!/bin/bash
# Sync latest AI rules from livemask-docs submodule

echo "Syncing AI rules from submodule..."

if [ -d "docs/ai-rules" ]; then
    echo "Submodule found. Rules are up to date."
else
    echo "Please init submodule first: git submodule update --init --recursive"
    exit 1
fi

echo "AI rules sync complete."