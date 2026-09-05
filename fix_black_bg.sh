#!/bin/bash
find src -type f -name "*.tsx" -exec sed -i \
  -e 's/className="w-full bg-black/className="w-full bg-white\/60/g' \
  -e 's/bg-black\/50/bg-white\/60/g' \
  -e 's/bg-black\/20/bg-gray-50/g' \
  -e 's/bg-black\/70/bg-gray-900\/60/g' \
  -e 's/bg-black\/85/bg-gray-900\/60/g' \
  {} +
