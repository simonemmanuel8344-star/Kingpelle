sed -i '/<div className="grid grid-cols-2 gap-4">/i\
                      <div className="mb-4">\
                        <label className="block text-sm font-medium text-gray-500 mb-2">Professional Bio</label>\
                        <textarea value={formData.bio || ""} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" placeholder="Short biography..."></textarea>\
                      </div>\
                      <div className="mb-4">\
                        <label className="block text-sm font-medium text-gray-500 mb-2">Core Skills & Specialties (Comma separated)</label>\
                        <input type="text" value={(formData.skills || []).join(", ")} onChange={e => setFormData({...formData, skills: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean)})} placeholder="e.g. Graphic Design, Branding, UI/UX" className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />\
                      </div>\
                      <div className="grid grid-cols-2 gap-4 mb-4">\
                        <div>\
                          <label className="block text-sm font-medium text-gray-500 mb-2">Years of Experience</label>\
                          <input type="number" min="0" value={formData.yearsOfExperience || ""} onChange={e => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />\
                        </div>\
                        <div>\
                          <label className="block text-sm font-medium text-gray-500 mb-2">Location</label>\
                          <input type="text" value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Lagos, Nigeria" className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />\
                        </div>\
                      </div>' src/components/AdminDashboard.tsx
