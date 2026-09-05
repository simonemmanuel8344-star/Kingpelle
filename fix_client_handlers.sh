#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
  if (activeChat) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-200">
        <Chat 
          chatId={activeChat.id} 
          professionalId={activeChat.professionalId}
          professionalName={activeChat.professionalName || 'Professional'} 
          professionalPicture=""
          onBack={() => setActiveChat(null)} 
        />
      </div>
    );
  }

  const handlePayNow = async (orderId: string) => {
    try {
      await updateEscrowStatus(orderId, 'paid_in_escrow');
      showToast('Payment successful. Funds held in escrow.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'paid_in_escrow' } : o));
    } catch (err) {
      showToast('Payment failed', 'error');
    }
  };

  const handleConfirmCompletion = async (orderId: string) => {
    try {
      await updateEscrowStatus(orderId, 'completed');
      showToast('Completion confirmed. Escrow released.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
    } catch (err) {
      showToast('Failed to confirm completion', 'error');
    }
  };

  const handleRaiseDispute = async (orderId: string) => {
    try {
      await updateEscrowStatus(orderId, 'disputed');
      showToast('Dispute raised. Admin will review.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'disputed' } : o));
    } catch (err) {
      showToast('Failed to raise dispute', 'error');
    }
  };

  return (
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/  if \(activeChat\) \{.*?  return \(\n\n      <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-200">.*?<\/div>\n    \);\n  \}/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
