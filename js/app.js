/**
 * KIIT IEEE Platform - Master Application Controller
 * Coordinates routers, views, modals, and reactive state subscriptions.
 */

import { store } from './state.js';
import { Navbar } from './components/navbar.js';
import { CommandPalette } from './components/command-palette.js';
import { NotificationsPopover } from './components/notifications.js';
import { RegistrationModal } from './components/registration-modal.js';
import { EventDetailModal } from './components/event-detail-modal.js';
import { TicketModal } from './components/ticket-modal.js';
import { QRScannerModal } from './components/qr-scanner-modal.js';
import { VolunteerModal } from './components/volunteer-modal.js';
import { ProfileModal } from './components/profile-modal.js';
import { AuthModal } from './components/auth-modal.js';
import { StudentDetailModal } from './components/student-detail-modal.js';

// Views
import { HomeView } from './views/home-view.js';
import { DiscoverView } from './views/discover-view.js';
import { StudentDashboardView } from './views/student-dashboard.js';
import { LiveEventView } from './views/live-event-view.js';
import { TeamsView } from './views/teams-view.js';
import { ShowcaseView } from './views/showcase-view.js';
import { AboutView } from './views/about-view.js';
import { ReadinessView } from './views/readiness-view.js';
import { CopilotView } from './views/copilot-view.js';
import { OrganizerView } from './views/organizer-view.js';
import { AIBuilderView } from './views/ai-builder-view.js';
import { VolunteerView } from './views/volunteer-view.js';
import { CertificatesView } from './views/certificates-view.js';
import { ChallengesView } from './views/challenges-view.js';
import { ProfileView } from './views/profile-view.js';
import { EventPageView } from './views/event-page-view.js';

class App {
  constructor() {
    this.currentViewInstance = null;
    this.currentEventId = null;
    this.navbar = null;
    this.commandPalette = null;
    this.notificationsPopover = null;
    this.regModal = null;
    this.detailModal = null;
    this.ticketModal = null;
    this.qrScannerModal = null;
    this.volunteerModal = null;
    this.profileModal = null;
    this.authModal = null;
    this.studentDetailModal = null;

    this.init();
  }

  init() {
    // 1. Initialize Global Components & Modals
    this.navbar = new Navbar('navbar-root');
    this.commandPalette = new CommandPalette();
    this.notificationsPopover = new NotificationsPopover();
    this.regModal = new RegistrationModal();
    this.detailModal = new EventDetailModal();
    this.ticketModal = new TicketModal();
    this.qrScannerModal = new QRScannerModal();
    this.volunteerModal = new VolunteerModal();
    this.profileModal = new ProfileModal();
    this.authModal = new AuthModal();
    this.studentDetailModal = new StudentDetailModal();

    // 2. Setup Global Dispatcher for Cross-Component Messaging
    window.appDispatcher = {
      openRegistration: (eventId) => this.regModal.open(eventId),
      openEventDetail: (eventId) => this.detailModal.open(eventId),
      navigateToEvent: (eventIdOrSlug) => {
        window.location.hash = `event/${eventIdOrSlug}`;
      },
      openTicketModal: (ticketId) => this.ticketModal.open(ticketId),
      openQRScanner: () => this.qrScannerModal.open(),
      openVolunteerModal: () => this.volunteerModal.open(),
      openProfileModal: () => this.profileModal.open(),
      openAuthModal: (preferredTab = 'demo') => this.authModal.open(preferredTab),
      openStudentDetail: (ticketId) => this.studentDetailModal.open(ticketId),
      openCommandPalette: () => this.commandPalette.open(),
      openNotifications: () => this.notificationsPopover.toggle()
    };

    // 3. Setup Hash Routing
    this.setupRouter();

    // 4. Subscribe to State Changes
    store.subscribe((state, changeType, data) => {
      if (changeType === 'VIEW_CHANGED') {
        this.renderView(state.activeView);
        if (state.activeView !== 'event-page') {
          window.location.hash = state.activeView;
        }
      } else if (['REGISTRATION_CREATED', 'EVENT_ADDED', 'TICKET_UPDATED', 'ATTENDANCE_CHECKED_IN', 'XP_AWARDED', 'USER_SWITCHED'].includes(changeType)) {
        // Do not reset the AI builder if an event was just published (it presents its own success screen)
        if (changeType === 'EVENT_ADDED' && state.activeView === 'ai-builder') {
          return;
        }
        if (this.currentViewInstance && typeof this.currentViewInstance.render === 'function') {
          this.currentViewInstance.render();
        }
      }
    });

    // Initial View Render
    const initialView = this.getViewFromHash() || store.activeView || 'home';
    store.activeView = initialView;
    this.renderView(initialView);
  }

  setupRouter() {
    const handleRouteChange = () => {
      const routeView = this.getViewFromHash();
      if (routeView) {
        if (routeView === 'event-page' || routeView !== store.activeView) {
          store.activeView = routeView;
          this.renderView(routeView);
        }
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    // Global navigation interceptor for SPA links like <a href="/events"> or <a href="#events">
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
        return;
      }

      // Handle internal relative paths
      if (href.startsWith('/') && !href.startsWith('//')) {
        e.preventDefault();
        window.history.pushState({}, '', href);
        handleRouteChange();
      }
    });
  }

  getViewFromHash() {
    // 1. Check hash if present
    const hash = window.location.hash.replace('#', '').trim();
    // 2. Also check pathname (for /events, /events/:id, /student, /host, etc.)
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();

    const raw = hash || path;
    if (!raw) return 'home';

    // Support dynamic event pages: event/:id, events/:id, event=:id
    const eventMatch = raw.match(/^(?:events?\/|event=)([^&?]+)/i);
    if (eventMatch) {
      this.currentEventId = decodeURIComponent(eventMatch[1]).trim();
      return 'event-page';
    }

    const ticketMatch = raw.match(/^(?:tickets?[\/=]|pass[\/=]|ticket=)([^&?]+)/i);
    if (ticketMatch) {
      const tktId = decodeURIComponent(ticketMatch[1]).trim();
      queueMicrotask(() => window.appDispatcher?.openTicketModal(tktId));
      return 'dashboard';
    }

    // Canonical route normalization
    const lower = raw.toLowerCase();

    // Event discovery routes: /events, /discover
    if (lower === 'events' || lower === 'discover') return 'discover';

    // Student dashboard routes: /student, /student/events, /student/my-events, /dashboard
    if (lower === 'student' || lower === 'student/events' || lower === 'student/my-events' || lower === 'dashboard' || lower === 'my-events' || lower === 'hub') {
      if (lower.includes('my-events') || lower.includes('events')) {
        queueMicrotask(() => {
          const tabBtn = document.querySelector('[data-tab="events"]');
          if (tabBtn) tabBtn.click();
        });
      }
      return 'dashboard';
    }

    // Host builder: /host/events/create, /builder, /create-event, /ai-builder
    if (lower === 'host/events/create' || lower === 'create-event' || lower === 'builder' || lower === 'ai-builder') {
      return 'ai-builder';
    }

    // Host attendance scanner: /host/attendance, /attendance
    if (lower === 'host/attendance' || lower === 'attendance') {
      queueMicrotask(() => {
        window.appDispatcher?.openQRScanner();
      });
      return 'organizer';
    }

    // Host Command Center: /host, /host/events, /host/events/:id, /organizer
    if (lower === 'host' || lower === 'host/events' || lower.startsWith('host/events/') || lower === 'organizer' || lower === 'command') {
      return 'organizer';
    }

    if (lower === 'arena' || lower === 'challenges') return 'challenges';
    if (lower === 'live' || lower === 'live-event') return 'live-event';
    if (lower === 'teams') return 'teams';
    if (lower === 'showcase') return 'showcase';
    if (lower === 'copilot') return 'copilot';
    if (lower === 'about') return 'about';
    if (lower === 'readiness') return 'readiness';
    if (lower === 'certificates') return 'certificates';
    if (lower === 'profile') return 'profile';
    if (lower === 'volunteer') return 'volunteer';
    if (lower === 'home') return 'home';

    return raw;
  }

  renderView(viewName) {
    if (this.currentViewInstance && typeof this.currentViewInstance.destroy === 'function') {
      this.currentViewInstance.destroy();
    }

    const containerId = 'app-main-content';

    switch (viewName) {
      case 'event-page':
        this.currentViewInstance = new EventPageView(containerId, this.currentEventId);
        break;
      case 'discover':
      case 'events':
        this.currentViewInstance = new DiscoverView(containerId);
        break;
      case 'dashboard':
      case 'student':
        this.currentViewInstance = new StudentDashboardView(containerId);
        break;
      case 'live-event':
      case 'live':
        this.currentViewInstance = new LiveEventView(containerId);
        break;
      case 'teams':
        this.currentViewInstance = new TeamsView(containerId);
        break;
      case 'showcase':
        this.currentViewInstance = new ShowcaseView(containerId);
        break;
      case 'about':
        this.currentViewInstance = new AboutView(containerId);
        break;
      case 'readiness':
        this.currentViewInstance = new ReadinessView(containerId);
        break;
      case 'copilot':
        this.currentViewInstance = new CopilotView(containerId);
        break;
      case 'organizer':
      case 'host':
        this.currentViewInstance = new OrganizerView(containerId);
        break;
      case 'ai-builder':
      case 'builder':
        this.currentViewInstance = new AIBuilderView(containerId);
        break;
      case 'volunteer':
        this.currentViewInstance = new VolunteerView(containerId);
        break;
      case 'certificates':
        this.currentViewInstance = new CertificatesView(containerId);
        break;
      case 'challenges':
      case 'arena':
        this.currentViewInstance = new ChallengesView(containerId);
        break;
      case 'profile':
        this.currentViewInstance = new ProfileView(containerId);
        break;
      case 'home':
      default:
        this.currentViewInstance = new HomeView(containerId);
        break;
    }

    this.currentViewInstance.render();
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.kiitApp = new App();
});
