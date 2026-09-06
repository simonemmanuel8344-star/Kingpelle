sed -i '/} else if (modalType === '\''professional'\'') {/,/}/c\
      } else if (modalType === '\''professional'\'') {\
        const payload = { ...formData };\
        if (typeof payload.skills === '\''string'\'') {\
          payload.skills = payload.skills.split('\',\'').map((s: string) => s.trim()).filter(Boolean);\
        }\
        if (editingId) {\
          await props.onUpdateProfessional(editingId, payload);\
          showToast('\''Professional updated successfully'\'', '\''success'\'');\
        } else {\
          await props.onAddProfessional({ ...payload, id: Date.now().toString(), joinedAt: new Date().toISOString() });\
          showToast('\''Professional added successfully'\'', '\''success'\'');\
        }\
      }' src/components/AdminDashboard.tsx
