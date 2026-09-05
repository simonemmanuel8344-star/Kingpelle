#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateEscrowStatus(orderId, 'accepted_awaiting_payment');
      showToast('Order accepted. Awaiting client payment.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'accepted_awaiting_payment' } : o));
    } catch (err) {
      showToast('Failed to accept order', 'error');
    }
  };

  const handleDeclineOrder = async (orderId: string) => {
    try {
      await updateEscrowStatus(orderId, 'declined');
      showToast('Order declined.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'declined' } : o));
    } catch (err) {
      showToast('Failed to decline order', 'error');
    }
  };

  const handleMarkCompleted = async (orderId: string) => {
    try {
      await updateEscrowStatus(orderId, 'completed_awaiting_confirmation');
      showToast('Project marked as completed. Awaiting client confirmation.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed_awaiting_confirmation' } : o));
    } catch (err) {
      showToast('Failed to mark as completed', 'error');
    }
  };

  return (
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/  return \(/`cat replacement.txt`/esg' src/components/ProfessionalDashboard.tsx
