#!/bin/bash
find src -type f -name "*.tsx" -exec sed -i \
  -e 's/text-gray-600 hover:text-white/text-gray-600 hover:text-indigo-600/g' \
  -e 's/text-gray-500 hover:text-white/text-gray-500 hover:text-indigo-600/g' \
  {} +
