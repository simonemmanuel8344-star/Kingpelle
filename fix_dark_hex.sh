#!/bin/bash
find src -type f -name "*.tsx" -exec sed -i \
  -e 's/bg-\[#050C17\]/bg-gray-50/g' \
  -e 's/from-\[#0A192F\]/from-gray-900/g' \
  -e 's/via-\[#0A192F\]/via-gray-900/g' \
  -e 's/border-\[#0A192F\]/border-white/g' \
  -e 's/text-\[#050C17\]/text-white/g' \
  -e 's/border-\[#050C17\]/border-white/g' \
  -e 's/from-\[#050C17\]/from-gray-50/g' \
  {} +
