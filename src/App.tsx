import React, { useState, useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebars';
import { LandingPage } from './pages/public/LandingPage';
import { Dashboard } from './pages/gym/Dashboard';
import { Members } from './pages/gym/Members';
import { AddMemberModal } from './pages/gym/AddMemberModal';
import { Attendance } from './pages/gym/Attendance';
import { Payments } from './pages/gym/Payments';
import { MembershipPlans } from './pages/gym/MembershipPlans';
import { Trainers } from './pages/gym/Trainers';
import { Workouts } from './pages/gym/Workouts';
import { Settings } from './pages/gym/Settings';
import { MemberPortal } from './pages/member/MemberPortal';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
import { CollectPaymentModal } from './components/common/CollectPaymentModal';
import { PaymentReceiptModal } from './components/receipt/PaymentReceiptModal';
import { Member, PaymentRecord } from './types';

export function App() {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const gym = store.getActiveGym();

  const [currentView, setCurrentView] = useState<string>('website');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberForPayment, setMemberForPayment] = useState<Member | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(null);

  // Switch view if current user is a Member and not on public website
  useEffect(() => {
    if (currentUser.role === 'member' && currentView !== 'website') {
      setCurrentView('portal');
    }
  }, [currentUser.role]);

  const handleOpenAddMember = () => {
    setIsAddMemberOpen(true);
  };

  const handleMemberPaymentSuccess = (payment: PaymentRecord) => {
    setReceiptPayment(payment);
  };

  // If user is viewing the public-facing website
  if (currentView === 'website') {
    return (
      <div className="min-h-screen bg-white">
        <LandingPage
          onEnterApp={(targetView) => setCurrentView(targetView || 'dashboard')}
          onOpenAddMember={handleOpenAddMember}
        />

        {/* Global Add Member Modal (can be opened from CTA) */}
        <AddMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          onSuccess={(newMember) => {
            if (newMember.totalPaid > 0) {
              const lastPayment = store.getPayments().find((p) => p.memberId === newMember.id);
              if (lastPayment) setReceiptPayment(lastPayment);
            }
            setCurrentView('members');
          }}
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setCurrentView}
            onOpenAddMember={handleOpenAddMember}
            onSelectMemberForPayment={(member) => setMemberForPayment(member)}
          />
        );
      case 'members':
        return (
          <Members
            onOpenAddMember={handleOpenAddMember}
            onSelectMemberForPayment={(member) => setMemberForPayment(member)}
          />
        );
      case 'attendance':
        return <Attendance />;
      case 'payments':
        return (
          <Payments
            onOpenCollectModal={() => {
              const firstMember = store.getMembers()[0];
              if (firstMember) setMemberForPayment(firstMember);
            }}
          />
        );
      case 'plans':
        return <MembershipPlans />;
      case 'trainers':
        return <Trainers />;
      case 'workouts':
        return <Workouts />;
      case 'settings':
        return <Settings />;
      case 'superadmin':
        return <SuperAdminDashboard />;
      case 'portal':
        return <MemberPortal />;
      default:
        return (
          <Dashboard
            onNavigate={setCurrentView}
            onOpenAddMember={handleOpenAddMember}
            onSelectMemberForPayment={(member) => setMemberForPayment(member)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-lime-400 selection:text-slate-950">
      {/* Top Application Header */}
      <Header
        onOpenAddMember={handleOpenAddMember}
        onNavigate={setCurrentView}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      {/* Global Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={(newMember) => {
          if (newMember.totalPaid > 0) {
            const lastPayment = store.getPayments().find((p) => p.memberId === newMember.id);
            if (lastPayment) setReceiptPayment(lastPayment);
          }
        }}
      />

      {/* Collect Payment Modal */}
      <CollectPaymentModal
        isOpen={Boolean(memberForPayment)}
        onClose={() => setMemberForPayment(null)}
        member={memberForPayment}
        onPaymentSuccess={handleMemberPaymentSuccess}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={Boolean(receiptPayment)}
        onClose={() => setReceiptPayment(null)}
        payment={receiptPayment}
        gym={gym}
      />
    </div>
  );
}

export default App;
