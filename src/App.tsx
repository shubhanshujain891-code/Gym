import React, { useState, useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { ToastProvider, useToast } from './components/common/Toast';
import { Header } from './components/layout/Header';
import {
  GymOwnerSidebar,
  MemberSidebar,
  SuperAdminSidebar,
  GymOwnerTab,
  MemberTab,
  SuperAdminTab,
} from './components/layout/Sidebars';
import { Dashboard } from './pages/gym/Dashboard';
import { Members } from './pages/gym/Members';
import { Attendance } from './pages/gym/Attendance';
import { MembershipPlans } from './pages/gym/MembershipPlans';
import { Payments } from './pages/gym/Payments';
import { Trainers } from './pages/gym/Trainers';
import { Workouts } from './pages/gym/Workouts';
import { DietPlans } from './pages/gym/DietPlans';
import { Analytics } from './pages/gym/Analytics';
import { Settings } from './pages/gym/Settings';
import { MemberProfileView } from './pages/gym/MemberProfileView';
import { MemberPortal } from './pages/member/MemberPortal';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { AddMemberModal } from './pages/gym/AddMemberModal';
import { QRScannerModal } from './components/qr/QRComponents';
import { CollectPaymentModal } from './components/common/CollectPaymentModal';
import { WhatsAppModal } from './components/whatsapp/WhatsAppModal';
import { PaymentReceiptModal } from './components/receipt/PaymentReceiptModal';
import { Member, PaymentRecord } from './types';

function MainApplication() {
  const { store, currentUser, currentGym, isSuperAdmin, isMember } = useStore();
  const { success } = useToast();

  // Navigation State
  const [gymOwnerTab, setGymOwnerTab] = useState<GymOwnerTab>('dashboard');
  const [memberTab, setMemberTab] = useState<MemberTab>('dashboard');
  const [superAdminTab, setSuperAdminTab] = useState<SuperAdminTab>('dashboard');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberInitialFilter, setMemberInitialFilter] = useState<string | undefined>(undefined);

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal Triggers
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showCollectPaymentModal, setShowCollectPaymentModal] = useState(false);
  const [collectPaymentTargetMember, setCollectPaymentTargetMember] = useState<Member | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppTargetMember, setWhatsAppTargetMember] = useState<Member | null>(null);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<PaymentRecord | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize theme from settings
  useEffect(() => {
    if (currentGym?.settings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentGym?.settings?.theme]);

  // Handle header quick action dispatch
  const handleQuickAction = (
    action: 'add_member' | 'check_in' | 'collect_payment' | 'add_trainer' | 'create_plan'
  ) => {
    if (action === 'add_member') {
      setShowAddMemberModal(true);
    } else if (action === 'check_in') {
      setShowScannerModal(true);
    } else if (action === 'collect_payment') {
      setCollectPaymentTargetMember(null);
      setShowCollectPaymentModal(true);
    } else if (action === 'add_trainer') {
      setGymOwnerTab('trainers');
      setSelectedMemberId(null);
    } else if (action === 'create_plan') {
      setGymOwnerTab('memberships');
      setSelectedMemberId(null);
    }
  };

  // Switch to member profile view
  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
  };

  // Switch tab from dashboard cards
  const handleNavigateFromDashboard = (tab: string, filter?: string) => {
    setSelectedMemberId(null);
    if (tab === 'members') {
      setMemberInitialFilter(filter);
      setGymOwnerTab('members');
    } else if (tab === 'attendance') {
      setGymOwnerTab('attendance');
    } else if (tab === 'payments') {
      setGymOwnerTab('payments');
    } else if (tab === 'expiry') {
      setMemberInitialFilter('expiring_soon');
      setGymOwnerTab('members');
    } else {
      setGymOwnerTab(tab as GymOwnerTab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-150">
      {/* Header bar */}
      <Header
        onOpenSearch={() => setShowSearchModal(true)}
        onQuickAction={handleQuickAction}
        onNavigateToMember={id => {
          setSelectedMemberId(id);
        }}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Role-Based Sidebar */}
        {isSuperAdmin ? (
          <SuperAdminSidebar
            currentTab={superAdminTab}
            onSelectTab={tab => {
              setSuperAdminTab(tab as SuperAdminTab);
              setSelectedMemberId(null);
            }}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        ) : isMember ? (
          <MemberSidebar
            currentTab={memberTab}
            onSelectTab={tab => {
              setMemberTab(tab as MemberTab);
              setSelectedMemberId(null);
            }}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        ) : (
          <GymOwnerSidebar
            currentTab={gymOwnerTab}
            onSelectTab={tab => {
              setSelectedMemberId(null);
              setMemberInitialFilter(undefined);
              if (tab === 'expiry') {
                setMemberInitialFilter('expiring_soon');
                setGymOwnerTab('members');
              } else if (tab === 'staff') {
                setGymOwnerTab('trainers');
              } else if (tab === 'reports') {
                setGymOwnerTab('reports');
              } else {
                setGymOwnerTab(tab as GymOwnerTab);
              }
            }}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Onboarding Wizard Mode */}
            {showOnboarding ? (
              <div className="py-4">
                <OnboardingWizard
                  onComplete={() => {
                    setShowOnboarding(false);
                    success('Gym Setup Completed!', 'Your gym dashboard is ready.');
                  }}
                />
              </div>
            ) : isSuperAdmin ? (
              /* Super Admin View */
              <SuperAdminDashboard
                onSwitchGym={gymId => {
                  store.switchGym(gymId);
                  store.switchRole('gym_owner');
                }}
                onOpenOnboarding={() => setShowOnboarding(true)}
              />
            ) : isMember ? (
              /* Member Portal View */
              <MemberPortal
                memberId={selectedMemberId || undefined}
                onSwitchMember={id => setSelectedMemberId(id)}
              />
            ) : selectedMemberId ? (
              /* Member Detail Profile Drill-down */
              <MemberProfileView
                memberId={selectedMemberId}
                onBack={() => setSelectedMemberId(null)}
                onOpenWhatsApp={mem => {
                  setWhatsAppTargetMember(mem);
                  setShowWhatsAppModal(true);
                }}
                onCollectPayment={mem => {
                  setCollectPaymentTargetMember(mem);
                  setShowCollectPaymentModal(true);
                }}
                onEditMember={mem => {
                  // Open edit member
                  setShowAddMemberModal(true);
                }}
                onViewReceipt={rec => {
                  setActiveReceiptPayment(rec);
                }}
              />
            ) : (
              /* Gym Owner Views */
              <>
                {gymOwnerTab === 'dashboard' && (
                  <Dashboard
                    onNavigateTab={handleNavigateFromDashboard}
                    onSelectMember={handleSelectMember}
                    onQuickAction={handleQuickAction}
                  />
                )}

                {gymOwnerTab === 'members' && (
                  <Members
                    onSelectMember={handleSelectMember}
                    initialFilter={memberInitialFilter}
                  />
                )}

                {gymOwnerTab === 'attendance' && (
                  <Attendance onSelectMember={handleSelectMember} />
                )}

                {gymOwnerTab === 'memberships' && <MembershipPlans />}

                {gymOwnerTab === 'payments' && (
                  <Payments onSelectMember={handleSelectMember} />
                )}

                {gymOwnerTab === 'trainers' && (
                  <Trainers onSelectMember={handleSelectMember} />
                )}

                {gymOwnerTab === 'workouts' && (
                  <Workouts onSelectMember={handleSelectMember} />
                )}

                {gymOwnerTab === 'diet-plans' && (
                  <DietPlans onSelectMember={handleSelectMember} />
                )}

                {gymOwnerTab === 'progress' && (
                  <Members onSelectMember={handleSelectMember} />
                )}

                {gymOwnerTab === 'reports' && <Analytics />}

                {gymOwnerTab === 'messages' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                          WhatsApp Communication Center
                        </h1>
                        <p className="text-xs text-slate-500">
                          Broadcast alerts, renewal reminders, and payment receipts directly to member phones.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setWhatsAppTargetMember(store.getMembers()[0]);
                          setShowWhatsAppModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        + Send New Message
                      </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                        Pre-Configured Automation Triggers
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-emerald-600 block">7-Day Expiry Notice</span>
                          <p className="text-slate-500 text-[11px] mt-1">
                            Dispatched automatically when a membership has 7 days remaining.
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-amber-600 block">Payment Receipt</span>
                          <p className="text-slate-500 text-[11px] mt-1">
                            Generates one-click WhatsApp message containing receipt number and amount.
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-purple-600 block">Welcome Onboarding</span>
                          <p className="text-slate-500 text-[11px] mt-1">
                            Sends member pass code and gym schedule upon new registration.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {gymOwnerTab === 'settings' && <Settings />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectMember={id => {
          setShowSearchModal(false);
          setSelectedMemberId(id);
        }}
        onSelectTrainer={() => {
          setShowSearchModal(false);
          setGymOwnerTab('trainers');
          setSelectedMemberId(null);
        }}
        onSelectPayment={() => {
          setShowSearchModal(false);
          setGymOwnerTab('payments');
          setSelectedMemberId(null);
        }}
      />

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSuccess={m => {
          setSelectedMemberId(m.id);
        }}
      />

      <QRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onCheckInSuccess={member => {
          success('Check-In Complete', `${member.firstName} ${member.lastName} marked present.`);
        }}
      />

      <CollectPaymentModal
        isOpen={showCollectPaymentModal}
        onClose={() => {
          setShowCollectPaymentModal(false);
          setCollectPaymentTargetMember(null);
        }}
        member={collectPaymentTargetMember}
        onPaymentSuccess={p => {
          setActiveReceiptPayment(p);
        }}
      />

      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => {
          setShowWhatsAppModal(false);
          setWhatsAppTargetMember(null);
        }}
        member={whatsAppTargetMember}
      />

      <PaymentReceiptModal
        isOpen={!!activeReceiptPayment}
        onClose={() => setActiveReceiptPayment(null)}
        payment={activeReceiptPayment}
        gym={currentGym}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApplication />
    </ToastProvider>
  );
}
