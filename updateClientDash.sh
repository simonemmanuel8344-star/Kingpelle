#!/bin/bash
sed -i 's/fetchUserJobApplications/fetchUserJobApplications, fetchUserNotifications, markNotificationAsRead, markAllNotificationsAsRead/g' src/components/ClientDashboard.tsx
sed -i 's/import { AppNotification, /import { AppNotification, /g' src/components/ClientDashboard.tsx
