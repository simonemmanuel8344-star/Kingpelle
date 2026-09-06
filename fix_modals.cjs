const fs = require('fs');
const content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const startMarker = "{modalType === 'project' && (";
const endMarker = "</form>";

const startIndex = content.indexOf(startMarker);
// find the nearest </form> after the startIndex
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error('Markers not found');
    process.exit(1);
}

const replacement = `{modalType === 'project' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Project Title</label>
                        <input type="text" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Category</label>
                        <input type="text" required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Image URL or Upload</label>
                        <div className="flex items-center gap-3">
                          <input type="url" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." className="flex-1 bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                          <label className="bg-gray-100/80 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap">
                            Upload File
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} className="hidden" />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                        <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none resize-none" />
                      </div>
                    </>
                  )}

                  {modalType === 'job' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Job Title</label>
                        <input type="text" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Location / Type</label>
                          <input type="text" required value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Remote, New York" className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Salary Range</label>
                          <input type="text" required value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                        <select value={formData.status || 'Open'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none">
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Requirements (comma separated)</label>
                        <input type="text" required value={Array.isArray(formData.requirements) ? formData.requirements.join(', ') : (formData.requirements || '')} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                        <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none resize-none" />
                      </div>
                    </>
                  )}

                  {modalType === 'professional' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Full Name</label>
                          <input type="text" required value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>
                          <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Phone Number</label>
                          <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Job Category</label>
                          <input type="text" required value={formData.jobCategory || ''} onChange={e => setFormData({...formData, jobCategory: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Years of Experience</label>
                          <input type="number" min="0" value={formData.yearsOfExperience || ''} onChange={e => setFormData({...formData, yearsOfExperience: e.target.value ? parseInt(e.target.value) : ''})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Location</label>
                          <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Lagos, Nigeria" className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Profile Picture (URL or Upload)</label>
                        <div className="flex items-center gap-3">
                          <input type="url" value={formData.picture || ''} onChange={e => setFormData({...formData, picture: e.target.value})} placeholder="https://..." className="flex-1 bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                          <label className="bg-gray-100/80 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap">
                            Upload
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'picture')} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Professional Bio</label>
                        <textarea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" placeholder="Short biography..."></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Core Skills & Specialties (Comma separated)</label>
                        <input type="text" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || '')} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. Graphic Design, Branding, UI/UX" className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>

                      <div className="border-t border-gray-200/60 pt-4 mt-2">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-900">Showcase Portfolio</label>
                          <button type="button" onClick={() => setFormData({...formData, portfolioItems: [...(formData.portfolioItems || []), { id: Date.now().toString(), title: '', image: '' }]})} className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                            + Add Portfolio Item
                          </button>
                        </div>
                        {(!formData.portfolioItems || formData.portfolioItems.length === 0) && (
                          <p className="text-xs text-gray-400 italic">No portfolio items added yet.</p>
                        )}
                        <div className="space-y-3">
                          {formData.portfolioItems?.map((item: any, idx: number) => (
                            <div key={item.id || idx} className="bg-gray-50 border border-gray-200/60 rounded-xl p-3 relative group">
                              <button type="button" onClick={() => setFormData({...formData, portfolioItems: formData.portfolioItems.filter((_: any, i: number) => i !== idx)})} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-md shadow-sm border border-red-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <div className="grid grid-cols-1 gap-3 mb-2">
                                <input type="text" placeholder="Project Title (e.g. E-Commerce Redesign)" value={item.title || ''} onChange={(e) => {
                                  const newItems = [...formData.portfolioItems];
                                  newItems[idx].title = e.target.value;
                                  setFormData({...formData, portfolioItems: newItems});
                                }} className="w-full bg-white border border-gray-200/60 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none" />
                              </div>
                              <div className="flex gap-2">
                                <input type="url" placeholder="Image URL (e.g. https://...)" value={item.image || ''} onChange={(e) => {
                                  const newItems = [...formData.portfolioItems];
                                  newItems[idx].image = e.target.value;
                                  setFormData({...formData, portfolioItems: newItems});
                                }} className="flex-1 bg-white border border-gray-200/60 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none" />
                                <label className="bg-white border border-gray-200/60 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap text-sm font-medium">
                                  Upload
                                  <input type="file" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const newItems = [...formData.portfolioItems];
                                        newItems[idx].image = reader.result as string;
                                        setFormData({...formData, portfolioItems: newItems});
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} className="hidden" />
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </form>`;

const newContent = content.substring(0, startIndex) + replacement + '\n                ' + content.substring(endIndex);

fs.writeFileSync('src/components/AdminDashboard.tsx', newContent, 'utf-8');
console.log('Successfully patched modals');
