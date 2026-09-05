#!/bin/bash
find src -type f -name "*.tsx" -exec sed -i \
  -e 's/bg-indigo-600 flex items-center justify-center text-gray-900/bg-indigo-600 flex items-center justify-center text-white/g' \
  -e 's/bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-gray-900/bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white/g' \
  -e 's/bg-indigo-600 hover:bg-indigo-700 text-gray-900/bg-indigo-600 hover:bg-indigo-700 text-white/g' \
  -e 's/file:bg-indigo-600 file:text-gray-900/file:bg-indigo-600 file:text-white/g' \
  -e 's/hover:file:bg-amber-300/hover:file:bg-indigo-700/g' \
  -e 's/bg-indigo-600 text-\[#050C17\]/bg-indigo-600 text-white/g' \
  -e 's/selection:bg-indigo-600 selection:text-gray-900/selection:bg-indigo-600 selection:text-white/g' \
  {} +
