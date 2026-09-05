#!/bin/bash
sed -i -e "s/props.onUpdateHeroImage(event.target.result as string)/setSettingsForm(prev => ({ ...prev, heroImageUrl: event.target.result as string }))/g" src/components/AdminDashboard.tsx
sed -i -e "s/props.onUpdateLogo(event.target.result as string)/setSettingsForm(prev => ({ ...prev, logoUrl: event.target.result as string }))/g" src/components/AdminDashboard.tsx
sed -i -e "s/showToast('Image uploaded successfully', 'success')/showToast('Image uploaded (Click Save to apply)', 'info')/g" src/components/AdminDashboard.tsx
