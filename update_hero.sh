#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
        {/* Soft elegant gradient and blur mask overlays to guarantee maximum text readability */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/10 z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-white/20 z-[2]" />
INNER_EOF

# Replace lines 68-70 in src/components/Hero.tsx
perl -i -pe 'BEGIN{undef $/;} s/        \{\/\* Soft elegant gradient and blur mask overlays.*?via-transparent to-white\/70 z-\[2\]" \/>/`cat replacement.txt`/esg' src/components/Hero.tsx

