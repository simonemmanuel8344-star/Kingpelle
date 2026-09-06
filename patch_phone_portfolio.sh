sed -i '/<div className="grid grid-cols-2 gap-4">/,/<\/div>/c\
                      <div className="grid grid-cols-2 gap-4">\
                        <div>\
                          <label className="block text-sm font-medium text-gray-500 mb-2">Full Name</label>\
                          <input type="text" required value={formData.fullName || ""} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />\
                        </div>\
                        <div>\
                          <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>\
                          <input type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />\
                        </div>\
                        <div>\
                          <label className="block text-sm font-medium text-gray-500 mb-2">Phone Number</label>\
                          <input type="text" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />\
                        </div>\
                        <div>\
                          <label className="block text-sm font-medium text-gray-500 mb-2">Job Category</label>\
                          <input type="text" required value={formData.jobCategory || ""} onChange={e => setFormData({...formData, jobCategory: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />\
                        </div>\
                      </div>' src/components/AdminDashboard.tsx
