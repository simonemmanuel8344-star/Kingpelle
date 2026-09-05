#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
              <div className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                {[
                  { text: 'Welcome', style: 'bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl', animated: false },
                  { text: 'to', style: 'bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl', animated: false },
                  { text: 'iDEA', style: 'text-black text-[1.45em] font-black tracking-tight select-all cursor-pointer inline-block drop-shadow-sm', animated: true, isBrand: true },
                  { text: 'Creation', style: 'bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl', animated: true },
                  { text: 'HUB', style: 'bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl', animated: false }
                ].map((item, index) => (
                  <motion.span
                    key={index}
                    className={`inline-block origin-bottom ${item.animated ? 'cursor-pointer' : 'cursor-default'}`}
                    animate={item.animated ? {
                      y: [0, -12, 0],
                      scale: [1, 1.05, 1],
                      rotateZ: [0, item.isBrand ? -3 : 3, 0]
                    } : {}}
                    transition={item.animated ? {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: item.isBrand ? 0 : 0.3
                    } : {}}
                    whileHover={{
                      scale: 1.08,
                      rotate: item.isBrand ? 4 : (index % 2 === 0 ? 3 : -3),
                      y: -4,
                      transition: { duration: 0.4, type: "spring", bounce: 0.6 }
                    }}
                  >
                    <span className={item.style}>{item.text}</span>
                  </motion.span>
                ))}
              </div>
INNER_EOF

# Replace lines 80-112 in src/components/Hero.tsx
perl -i -pe 'BEGIN{undef $/;} s/              <div className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1\.5">.*?<\/div>/`cat replacement.txt`/esg' src/components/Hero.tsx
