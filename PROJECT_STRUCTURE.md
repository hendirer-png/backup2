# Project Structure: Photography Vendor Application

This document provides a hierarchical overview of the project's file and directory structure.

```text
.
├── .github/
│   └── workflows/
│       └── ios-testflight.yml
├── .kiro/
├── .orchids/
├── .vscode/
├── android/
├── dist/
├── docs/
│   ├── PERPORMA WEB
│   ├── SUPABASE_BACKUP_GUIDE.md
│   ├── build_output.txt
│   ├── metadata.json
│   ├── optimization-config.json
│   ├── output.txt
│   └── reverensi nama2 kontne unutk forontand
├── ios/
├── node_modules/
├── public/
├── scripts/
│   ├── backup-database.js
│   ├── check_all_delimiters.cjs
│   ├── check_all_tables.cjs
│   ├── check_balance.cjs
│   ├── check_db.cjs
│   ├── deploy-optimizations.ts
│   ├── repair_transactions.cjs
│   ├── seed_profile.cjs
│   ├── validate-terminology.ts
│   └── ... (40+ maintenance and migration scripts)
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── AppProviders.tsx
│   │   └── AppRoutes.tsx
│   ├── constants/
│   │   └── index.tsx
│   ├── features/
│   │   ├── booking/
│   │   │   ├── components/
│   │   │   │   ├── BookingChartsSection.tsx
│   │   │   │   ├── BookingStats.tsx
│   │   │   │   ├── BookingTable.tsx
│   │   │   │   └── WhatsappTemplateModal.tsx
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   │       └── booking.utils.ts
│   │   ├── clients/
│   │   │   ├── components/
│   │   │   │   ├── BillingChatModal.tsx
│   │   │   │   ├── ClientActiveList.tsx
│   │   │   │   ├── ClientCard.tsx
│   │   │   │   ├── ClientDetailModal.tsx
│   │   │   │   ├── ClientFilterBar.tsx
│   │   │   │   ├── ClientForm.tsx
│   │   │   │   ├── ClientHeader.tsx
│   │   │   │   ├── ClientInactiveList.tsx
│   │   │   │   ├── ClientInfoTab.tsx
│   │   │   │   ├── ClientKPI.tsx
│   │   │   │   ├── ClientLinkModals.tsx
│   │   │   │   ├── ClientPortal.tsx
│   │   │   │   ├── ClientStatsCards.tsx
│   │   │   │   ├── ClientUnpaidList.tsx
│   │   │   │   ├── ClientsPage.tsx
│   │   │   │   ├── InvoicePreviewModal.tsx
│   │   │   │   ├── NewClientsChart.tsx
│   │   │   │   ├── ProjectPaymentCard.tsx
│   │   │   │   └── ReceiptPreviewModal.tsx
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── communication/
│   │   │   └── components/
│   │   │       ├── ChatModal.tsx
│   │   │       ├── ChatTemplateManager.tsx
│   │   │       ├── CommunicationHub.tsx
│   │   │       └── ShareMessageModal.tsx
│   │   ├── contracts/
│   │   │   ├── components/
│   │   │   │   ├── ContractDocument.tsx
│   │   │   │   ├── ContractFormModal.tsx
│   │   │   │   ├── ContractInfoModal.tsx
│   │   │   │   ├── ContractMobileList.tsx
│   │   │   │   ├── ContractStats.tsx
│   │   │   │   ├── ContractTable.tsx
│   │   │   │   └── ContractViewModal.tsx
│   │   │   ├── constants/
│   │   │   │   └── contracts.constants.ts
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   ├── finance/
│   │   │   ├── components/
│   │   │   │   ├── Add-invoice/
│   │   │   │   ├── BatchPayment.tsx
│   │   │   │   ├── CardGrid.tsx
│   │   │   │   ├── CardReportTab.tsx
│   │   │   │   ├── CashflowView.tsx
│   │   │   │   ├── FinanceCharts.tsx
│   │   │   │   ├── FinanceHeader.tsx
│   │   │   │   ├── FinanceModals.tsx
│   │   │   │   ├── FinanceStats.tsx
│   │   │   │   ├── FinancialAssets.tsx
│   │   │   │   ├── InvoiceDocument.tsx
│   │   │   │   ├── PocketGrid.tsx
│   │   │   │   ├── ProfitabilityReportView.tsx
│   │   │   │   ├── ReportView.tsx
│   │   │   │   ├── TransactionList.tsx
│   │   │   │   └── TransactionTable.tsx
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── FinancePage.tsx
│   │   ├── leads/
│   │   │   ├── components/
│   │   │   │   ├── ConvertLeadForm.tsx
│   │   │   │   ├── LeadCard.tsx
│   │   │   │   ├── LeadFilterBar.tsx
│   │   │   │   ├── LeadForm.tsx
│   │   │   │   ├── LeadKanban.tsx
│   │   │   │   ├── LeadsAnalytics.tsx
│   │   │   │   ├── LeadsPage.tsx
│   │   │   │   └── ShareMessageModal.tsx
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── packages/
│   │   │   ├── components/
│   │   │   │   ├── AddOnSection.tsx
│   │   │   │   ├── PackageCard.tsx
│   │   │   │   ├── PackageFormModal.tsx
│   │   │   │   └── PackageModals.tsx
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── Packages.tsx
│   │   ├── projects/
│   │   │   ├── components/
│   │   │   │   ├── ProjectDetailModal/
│   │   │   │   │   ├── ProjectChecklistTab/
│   │   │   │   │   ├── ProjectDetailsTab.tsx
│   │   │   │   │   ├── ProjectFilesTab.tsx
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── BriefingModal.tsx
│   │   │   │   ├── CalendarView.tsx
│   │   │   │   ├── ChecklistPortal.tsx
│   │   │   │   ├── ProgressTracker.tsx
│   │   │   │   ├── ProjectAnalytics.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectDetailView.tsx
│   │   │   │   ├── ProjectFilters.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   ├── ProjectHeader.tsx
│   │   │   │   ├── ProjectKanbanView.tsx
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectListView.tsx
│   │   │   │   ├── QuickStatusModal.tsx
│   │   │   │   └── StatModal.tsx
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── ProjectsPage.tsx
│   │   ├── promo/
│   │   │   └── PromoCodes.tsx
│   │   ├── public/
│   │   │   └── components/
│   │   │       ├── GalleryUpload.tsx
│   │   │       ├── PublicBookingForm.tsx
│   │   │       ├── PublicContract.tsx
│   │   │       ├── PublicFeedbackForm.tsx
│   │   │       ├── PublicGallery.tsx
│   │   │       ├── PublicInvoice.tsx
│   │   │       ├── PublicLeadForm.tsx
│   │   │       ├── PublicPackages.tsx
│   │   │       ├── PublicReceipt.tsx
│   │   │       └── SuggestionForm.tsx
│   │   ├── settings/
│   │   │   ├── components/
│   │   │   │   ├── CategoryManager.tsx
│   │   │   │   ├── ChecklistTemplateSettings.tsx
│   │   │   │   ├── FinanceSettingsTab.tsx
│   │   │   │   ├── MessageSettingsTab.tsx
│   │   │   │   ├── PackageSettingsTab.tsx
│   │   │   │   ├── ProfileSettingsTab.tsx
│   │   │   │   ├── ProjectSettingsTab.tsx
│   │   │   │   ├── ProjectStatusManager.tsx
│   │   │   │   ├── SettingsPage.tsx
│   │   │   │   ├── ShareTemplateItem.tsx
│   │   │   │   ├── TeamSettingsTab.tsx
│   │   │   │   ├── TemplateCrudSection.tsx
│   │   │   │   └── ToggleSwitch.tsx
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── team/
│   │   │   └── components/
│   │   │       ├── FreelancerPortal.tsx
│   │   │       └── FreelancerProjects.tsx
│   │   └── test/
│   │       └── TestSignature.tsx
│   ├── hooks/
│   │   ├── useAppData.ts
│   │   ├── useChatTemplates.ts
│   │   ├── useDataManager.ts
│   │   ├── useDebounce.ts
│   │   ├── useInfiniteScroll.ts
│   │   ├── useLazyData.ts
│   │   ├── useLazyDataLoader.ts
│   │   ├── useOfflineSync.ts
│   │   ├── useOptimizedData.ts
│   │   ├── useOptimizedRealtime.ts
│   │   ├── usePaginatedData.ts
│   │   ├── usePagination.ts
│   │   └── useSearchableInfiniteScroll.ts
│   ├── layouts/
│   │   ├── PageHeader.tsx
│   │   └── Sidebar.tsx
│   ├── lib/
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── booking/
│   │   │   └── BookingPage.tsx
│   │   ├── clients/
│   │   │   └── ClientsPage.tsx
│   │   ├── contracts/
│   │   │   └── ContractsPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── finance/
│   │   │   └── FinancePage.tsx
│   │   ├── home/
│   │   │   └── Homepage.tsx
│   │   ├── leads/
│   │   │   └── LeadsPage.tsx
│   │   ├── projects/
│   │   │   └── ProjectsPage.tsx
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   └── team/
│   │       └── TeamPage.tsx
│   ├── routes/
│   │   ├── privateRoutes.ts
│   │   └── publicRoutes.ts
│   ├── services/
│   │   ├── addOns.ts
│   │   ├── balanceValidator.ts
│   │   ├── calendarEvents.ts
│   │   ├── cards.ts
│   │   ├── clients.ts
│   │   ├── contracts.ts
│   │   ├── leads.ts
│   │   ├── notifications.ts
│   │   ├── packages.ts
│   │   ├── projects.ts
│   │   ├── promoCodes.ts
│   │   ├── teamMembers.ts
│   │   ├── transactions.ts
│   │   ├── users.ts
│   │   └── ... (40+ domain-specific services)
│   ├── shared/
│   │   ├── form/
│   │   │   ├── FilterBar.tsx
│   │   │   ├── RupiahInput.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── ui/
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── CollapsibleSection.tsx
│   │   │   ├── DonutChart.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── FailedSyncModal.tsx
│   │   │   ├── FloatingActionButton.tsx
│   │   │   ├── HelpBox.tsx
│   │   │   ├── InteractiveCashflowChart.tsx
│   │   │   ├── LazyImage.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── OfflineSyncIndicator.tsx
│   │   │   ├── PrintButton.tsx
│   │   │   ├── PullToRefresh.tsx
│   │   │   ├── QrCodeDisplay.tsx
│   │   │   ├── SignaturePad.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── StatCardModal.tsx
│   │   │   └── SwipeableCard.tsx
│   │   └── README_UIUX_COMPONENTS.md
│   ├── styles/
│   │   ├── components/
│   │   │   ├── button.css
│   │   │   ├── form.css
│   │   │   ├── invoice.css
│   │   │   ├── navigation.css
│   │   │   └── table.css
│   │   ├── print/
│   │   │   └── print.css
│   │   ├── templates/
│   │   │   ├── classic.css
│   │   │   ├── gallery.css
│   │   │   └── modern.css
│   │   ├── animations.css
│   │   ├── base.css
│   │   ├── utilities.css
│   │   └── variables.css
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── currency.ts
│   │   ├── logger.ts
│   │   ├── network.ts
│   │   ├── terminologyValidator.ts
│   │   └── whatsapp.ts
│   └── index.css
├── supabase/
├── .env
├── .env.production
├── .gitignore
├── bitrise.yml
├── capacitor.config.ts
├── codemagic.yaml
├── index.html
├── index.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```
