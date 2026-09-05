#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
                {/* 1. Internal Admin Management */}
                <div className="space-y-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-gray-900 uppercase tracking-wider block">
                      Internal Admin Notes
                    </label>
                    <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Private (Not visible to applicant)
                    </span>
                  </div>
                  <textarea
                    value={appInternalNote}
                    onChange={(e) => setAppInternalNote(e.target.value)}
                    placeholder="e.g., Follow up with engineering team about their portfolio. Schedule a technical screen next week."
                    rows={3}
                    className="w-full p-4 bg-amber-50/30 border border-amber-200/60 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-amber-400 focus:bg-amber-50/50 resize-none transition-all"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={async () => {
                        await handleInternalStatusChange(selectedApplication.id, selectedApplication.internalStatus || 'pending', appInternalNote);
                      }}
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg transition-colors"
                    >
                      Save Internal Notes
                    </button>
                  </div>
                </div>

                {/* 2. Applicant-Facing Communication */}
                <div className="space-y-4 pt-5 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-gray-900 uppercase tracking-wider block">
                      Send Update to Applicant
                    </label>
                    <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      Notifies & Syncs to Dashboard
                    </span>
                  </div>
                  
                  <div className="bg-indigo-50/30 border border-indigo-100 p-4 rounded-2xl space-y-4">
                    <textarea
                      value={appFeedbackNote}
                      onChange={(e) => setAppFeedbackNote(e.target.value)}
                      placeholder="Feedback to send to applicant (e.g., Application shortlisted for interview; We'd like to schedule a call...)"
                      rows={2}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-600 resize-none transition-all"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'pending', label: 'Pending Review', sub: 'In Queue', activeBorder: 'border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-400', inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-amber-50/40 hover:border-amber-200' },
                        { id: 'reviewed', label: 'Reviewed', sub: 'Shortlisted', activeBorder: 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-400', inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50/40 hover:border-blue-200' },
                        { id: 'contacted', label: 'Contacted', sub: 'Interviewing', activeBorder: 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-400', inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-emerald-50/40 hover:border-emerald-200' },
                        { id: 'rejected', label: 'Closed', sub: 'Declined', activeBorder: 'border-rose-500 bg-rose-50/80 text-rose-900 ring-2 ring-rose-400', inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-rose-50/40 hover:border-rose-200' }
                      ].map(st => {
                        const isSelected = modalSelectedStatus === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setModalSelectedStatus(st.id as any)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${isSelected ? st.activeBorder + ' shadow-sm' : st.inactive}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs">{st.label}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 block leading-tight">{st.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
INNER_EOF

# Now use perl to replace from line 1956 to 2050
perl -i -pe 'BEGIN{undef $/;} s/                \{\/\* Recruiter Notes \/ Candidate Feedback \*\/}.*?\{\/\* Modal Footer \*\/}/`cat replacement.txt`/esg' src/components/AdminDashboard.tsx
