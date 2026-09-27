/**
 * KIIT IEEE Platform - Central Reactive State Store
 * Persistent reactive store backed by localStorage with event subscription,
 * role-based access control, XP economy, audit trail & host operations.
 */

import {
  INITIAL_EVENTS,
  INITIAL_USER,
  INITIAL_REGISTRATIONS,
  INITIAL_CERTIFICATES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_CHALLENGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_TEAMS,
  INITIAL_SHOWCASE,
  INITIAL_HARDWARE,
  INITIAL_VOLUNTEERS,
  INITIAL_MISSIONS,
  INITIAL_ACHIEVEMENTS,
  INSTITUTIONAL_DATA,
  AUDIT_LOGS
} from './demo-data.js';

class StateStore {
  constructor() {
    this.STORAGE_KEY = 'KIIT_IEEE_APP_STATE_V2';
    this.listeners = new Set();
    this.soundEnabled = true;
    this.init();
    this.syncEventsWithServer();
  }

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.events = parsed.events || INITIAL_EVENTS;
        this.user = parsed.user || INITIAL_USER;
        this.registrations = parsed.registrations || INITIAL_REGISTRATIONS;
        this.certificates = parsed.certificates || INITIAL_CERTIFICATES;
        this.supportTickets = parsed.supportTickets || INITIAL_SUPPORT_TICKETS;
        this.challenges = parsed.challenges || INITIAL_CHALLENGES;
        this.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
        this.teams = parsed.teams || INITIAL_TEAMS;
        this.showcase = parsed.showcase || INITIAL_SHOWCASE;
        this.hardware = parsed.hardware || INITIAL_HARDWARE;
        this.volunteers = parsed.volunteers || INITIAL_VOLUNTEERS;
        this.missions = parsed.missions || INITIAL_MISSIONS;
        this.achievements = parsed.achievements || INITIAL_ACHIEVEMENTS;
        this.institutionalData = parsed.institutionalData || INSTITUTIONAL_DATA;
        if (this.institutionalData && this.institutionalData.founder) {
          this.institutionalData.founder.avatar = "assets/dr-achyuta-samanta.png";
        }
        this.auditLogs = parsed.auditLogs || AUDIT_LOGS;
        this.promotionAnalytics = parsed.promotionAnalytics || {
          eventViews: 1842,
          registrationClicks: 482,
          registrations: 184,
          whatsappShares: 132,
          linkCopies: 87,
          linkedinShares: 31,
          emailShares: 24,
          posterDownloads: 42,
          actionHistory: []
        };
        this.activeView = parsed.activeView || 'home';
        this.activeFilterCategory = 'All';
        this.activeFilterMode = 'All';
        this.activeFilterDifficulty = 'All';
        this.activeSearchQuery = '';
        return;
      } catch (err) {
        console.warn('Failed to parse saved state, resetting to initial demo data:', err);
      }
    }

    // Default Fallback
    this.events = JSON.parse(JSON.stringify(INITIAL_EVENTS));
    this.user = JSON.parse(JSON.stringify(INITIAL_USER));
    this.registrations = JSON.parse(JSON.stringify(INITIAL_REGISTRATIONS));
    this.certificates = JSON.parse(JSON.stringify(INITIAL_CERTIFICATES));
    this.supportTickets = JSON.parse(JSON.stringify(INITIAL_SUPPORT_TICKETS));
    this.challenges = JSON.parse(JSON.stringify(INITIAL_CHALLENGES));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.teams = JSON.parse(JSON.stringify(INITIAL_TEAMS));
    this.showcase = JSON.parse(JSON.stringify(INITIAL_SHOWCASE));
    this.hardware = JSON.parse(JSON.stringify(INITIAL_HARDWARE));
    this.volunteers = JSON.parse(JSON.stringify(INITIAL_VOLUNTEERS));
    this.missions = JSON.parse(JSON.stringify(INITIAL_MISSIONS));
    this.achievements = JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS));
    this.institutionalData = JSON.parse(JSON.stringify(INSTITUTIONAL_DATA));
    this.auditLogs = JSON.parse(JSON.stringify(AUDIT_LOGS));
    this.promotionAnalytics = {
      eventViews: 1842,
      registrationClicks: 482,
      registrations: 184,
      whatsappShares: 132,
      linkCopies: 87,
      linkedinShares: 31,
      emailShares: 24,
      posterDownloads: 42,
      actionHistory: []
    };
    this.activeView = 'home';
    this.activeFilterCategory = 'All';
    this.activeFilterMode = 'All';
    this.activeFilterDifficulty = 'All';
    this.activeSearchQuery = '';
    this.save();
  }

  async syncEventsWithServer() {
    try {
      const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:')
        ? window.location.origin
        : 'http://localhost:3000';
      
      let updated = false;

      // Sync Events
      const res = await fetch(`${origin}/api/events`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.events)) {
          data.events.forEach(serverEvt => {
            const idx = this.events.findIndex(e => 
              String(e.id).toLowerCase() === String(serverEvt.id).toLowerCase() || 
              (e.slug && String(e.slug).toLowerCase() === String(serverEvt.slug).toLowerCase())
            );
            if (idx >= 0) {
              this.events[idx] = { ...this.events[idx], ...serverEvt };
              updated = true;
            } else {
              this.events.unshift(serverEvt);
              updated = true;
            }
          });
        }
      }

      // Sync Registrations & Attendance Ledger
      try {
        const regRes = await fetch(`${origin}/api/registrations`);
        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData.success && Array.isArray(regData.registrations)) {
            regData.registrations.forEach(serverReg => {
              const idx = this.registrations.findIndex(r => 
                String(r.ticketId).toUpperCase() === String(serverReg.ticketId).toUpperCase()
              );
              if (idx >= 0) {
                this.registrations[idx] = { ...this.registrations[idx], ...serverReg };
                updated = true;
              } else {
                this.registrations.unshift(serverReg);
                updated = true;
              }
            });
          }
        }
      } catch (err) {}

      if (updated) {
        this.save();
        this.notify('EVENTS_SYNCED');
      }
    } catch (e) {
      // Offline fallback
    }
  }

  save() {
    try {
      const payload = {
        events: this.events,
        user: this.user,
        registrations: this.registrations,
        certificates: this.certificates,
        supportTickets: this.supportTickets,
        challenges: this.challenges,
        notifications: this.notifications,
        teams: this.teams,
        showcase: this.showcase,
        hardware: this.hardware,
        volunteers: this.volunteers,
        missions: this.missions,
        achievements: this.achievements,
        institutionalData: this.institutionalData,
        auditLogs: this.auditLogs,
        promotionAnalytics: this.promotionAnalytics,
        activeView: this.activeView
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changeType = 'GENERAL_UPDATE', data = null) {
    this.save();
    this.listeners.forEach((listener) => {
      try {
        listener(this, changeType, data);
      } catch (err) {
        console.error('State listener error:', err);
      }
    });
  }

  // --- NAVIGATION & ROLE ---

  setView(viewName) {
    this.activeView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify('VIEW_CHANGED', viewName);
  }

  setRole(role) {
    this.user.role = role;
    this.addAuditLog(this.user.name, `Switched role to ${role.toUpperCase()}`, 'RolePermission');
    this.notify('ROLE_CHANGED', role);
  }

  switchAccount(accountKey) {
    if (accountKey === 'student') {
      this.user = {
        ...INITIAL_USER,
        role: 'student'
      };
    } else if (accountKey === 'host') {
      this.user = {
        id: 'usr-priyadarshi-host',
        name: 'Dr. Priyadarshi Sen',
        rollNo: 'FACULTY-AI-01',
        email: 'priyadarshi.sen@kiit.ac.in',
        phone: '+91 99370 11223',
        branch: 'School of Computer Engineering',
        year: 'Faculty Mentor',
        role: 'organizer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        level: 10,
        levelTitle: "Lead Host & Senior Researcher",
        currentXp: 9800,
        nextLevelXp: 10000,
        streakDays: 14
      };
    } else if (accountKey === 'volunteer') {
      this.user = {
        id: 'usr-devika-vol',
        name: 'Devika Sharma',
        rollNo: '22050988',
        email: '22050988@kiit.ac.in',
        phone: '+91 98765 11223',
        branch: 'Electronics & Computer Engg',
        year: '3rd Year',
        role: 'volunteer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        level: 8,
        levelTitle: "Core Lab Volunteer",
        currentXp: 3400,
        nextLevelXp: 4000,
        streakDays: 9
      };
    } else if (accountKey === 'admin') {
      this.user = {
        id: 'usr-mohanty-admin',
        name: 'Dr. J. R. Mohanty',
        rollNo: 'ADMIN-IEEE-01',
        email: 'branch.counselor@kiit.ac.in',
        phone: '+91 94370 99887',
        branch: 'KIIT IEEE Executive Council',
        year: 'Branch Counselor',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
        level: 12,
        levelTitle: "Executive Branch Counselor",
        currentXp: 15000,
        nextLevelXp: 15000,
        streakDays: 30
      };
    }
    this.addAuditLog(this.user.name, `Logged in via quick switcher as ${this.user.role.toUpperCase()}`, 'AuthSession');
    this.notify('USER_SWITCHED', this.user);
    this.notify('ROLE_CHANGED', this.user.role);
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.notify('SOUND_TOGGLED', this.soundEnabled);
    return this.soundEnabled;
  }

  // --- XP & BUILDER PROGRESSION ---

  awardXp(amount, reason) {
    if (!this.user.currentXp) this.user.currentXp = 0;
    this.user.currentXp += amount;
    
    // Check level progression
    const levelThresholds = [
      { level: 1, title: "Explorer", minXp: 0 },
      { level: 2, title: "Builder", minXp: 200 },
      { level: 3, title: "Creator", minXp: 400 },
      { level: 4, title: "Innovator", minXp: 700 },
      { level: 5, title: "Engineer", minXp: 950 },
      { level: 6, title: "Technologist", minXp: 1100 },
      { level: 7, title: "Innovator", minXp: 1240 },
      { level: 8, title: "Advanced Builder", minXp: 1500 },
      { level: 9, title: "Technical Leader", minXp: 2000 }
    ];

    let newLevel = this.user.level || 7;
    let newTitle = this.user.levelTitle || "Innovator";

    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (this.user.currentXp >= levelThresholds[i].minXp) {
        newLevel = levelThresholds[i].level;
        newTitle = levelThresholds[i].title;
        break;
      }
    }

    const leveledUp = newLevel > (this.user.level || 7);
    this.user.level = newLevel;
    this.user.levelTitle = newTitle;

    // Log transaction
    const tx = {
      id: `xp-${Date.now()}`,
      reason,
      amount,
      date: 'Just now'
    };
    if (!this.user.xpHistory) this.user.xpHistory = [];
    this.user.xpHistory.unshift(tx);

    this.addNotification({
      title: leveledUp ? `LEVEL UP! Level ${newLevel} — ${newTitle} 🎉` : `+${amount} XP Earned! ⚡`,
      body: reason,
      type: leveledUp ? 'success' : 'info'
    });

    this.notify('XP_AWARDED', { amount, reason, leveledUp, newLevel });
    return { leveledUp, newLevel, newTitle };
  }

  // --- MISSIONS & ACHIEVEMENTS ---

  completeMissionStep(missionId, stepId) {
    const mission = this.missions.find(m => m.id === missionId);
    if (!mission) return;
    const step = mission.steps.find(s => s.id === stepId);
    if (!step || step.completed) return;

    step.completed = true;
    const allDone = mission.steps.every(s => s.completed);

    this.awardXp(50, `Completed mission step: ${step.title}`);

    if (allDone) {
      this.awardXp(mission.rewardXp, `Completed entire mission: ${mission.title}! 🏆`);
      this.addNotification({
        title: `Mission Completed: ${mission.title}! 🏆`,
        body: `You unlocked the ${mission.badge} badge and earned +${mission.rewardXp} bonus XP!`,
        type: 'success'
      });
    }

    this.notify('MISSION_UPDATED', mission);
  }

  // --- TEAMS FINDER ---

  createTeam(teamData) {
    const newTeam = {
      id: `team-${Date.now()}`,
      name: teamData.name,
      event: teamData.event || "AI & Edge Computer Vision Masterclass",
      bench: teamData.bench || "Assigned on Arrival",
      status: "Active Building",
      projectIdea: teamData.projectIdea || "Interactive Technical Capstone",
      members: [
        {
          name: this.user.name,
          rollNo: this.user.rollNo,
          role: teamData.leaderRole || "Lead Developer",
          lead: true
        }
      ],
      lookingFor: teamData.lookingFor || "Looking for Teammates",
      skills: teamData.skills || ["Python", "Git"],
      missingSkills: teamData.missingSkills || [],
      submissions: 0
    };

    this.teams.unshift(newTeam);
    this.user.teamId = newTeam.id;
    this.user.teamRole = teamData.leaderRole || "Lead Developer";

    this.awardXp(100, `Created engineering team "${newTeam.name}"`);
    this.addAuditLog(this.user.name, `Created team "${newTeam.name}"`, newTeam.id);
    this.notify('TEAM_CREATED', newTeam);
    return newTeam;
  }

  joinTeam(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return { success: false, error: 'Team not found' };

    const alreadyMember = team.members.some(m => m.rollNo === this.user.rollNo);
    if (alreadyMember) return { success: false, error: 'Already a member of this team' };

    team.members.push({
      name: this.user.name,
      rollNo: this.user.rollNo,
      role: "Member Engineer",
      lead: false
    });

    this.user.teamId = team.id;
    this.awardXp(75, `Joined team "${team.name}"`);
    this.addNotification({
      title: `Joined ${team.name}! 🤝`,
      body: `You are now collaborating with ${team.members.map(m => m.name).join(', ')}.`,
      type: 'success'
    });

    this.notify('TEAM_UPDATED', team);
    return { success: true, team };
  }

  // --- SHOWCASE & MY BUILDS ---

  upvoteProject(projectId) {
    const proj = this.showcase.find(p => p.id === projectId);
    if (!proj) return;
    proj.upvotes = (proj.upvotes || 0) + 1;
    this.awardXp(10, `Upvoted community build "${proj.title}"`);
    this.notify('SHOWCASE_UPDATED', proj);
    return proj.upvotes;
  }

  addProject(data) {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: data.title,
      author: `${this.user.name} (${this.user.rollNo})`,
      authorRoll: this.user.rollNo,
      authorAvatar: this.user.avatar,
      event: data.event || "AI & Edge Computer Vision Masterclass",
      description: data.description,
      techStack: data.techStack || ["Python", "PyTorch"],
      githubUrl: data.githubUrl || "https://github.com/kiit-ieee",
      demoUrl: data.demoUrl || "https://kiit-ieee.org",
      upvotes: 1,
      commentsCount: 0,
      badge: "New Release",
      createdAt: "Just now"
    };

    this.showcase.unshift(newProj);
    this.awardXp(250, `Published capstone build "${newProj.title}" to Showcase`);
    this.addAuditLog(this.user.name, `Submitted build "${newProj.title}"`, newProj.id);
    this.notify('SHOWCASE_CREATED', newProj);
    return newProj;
  }

  // --- EVENT REGISTRATION ---

  registerForEvent(eventId, formData) {
    const event = this.events.find(e => 
      String(e.id).toLowerCase() === String(eventId).toLowerCase() || 
      (e.slug && String(e.slug).toLowerCase() === String(eventId).toLowerCase())
    );
    if (!event) return { success: false, error: 'Event not found' };

    const existing = this.registrations.find(r => 
      (String(r.eventId).toLowerCase() === String(event.id).toLowerCase() || 
       (event.slug && String(r.eventId).toLowerCase() === String(event.slug).toLowerCase()) ||
       String(r.eventId).toLowerCase() === String(eventId).toLowerCase()) && 
      r.rollNo === (formData.rollNo || this.user.rollNo)
    );
    if (existing) {
      return { success: false, error: 'You are already registered for this event!', ticket: existing };
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = event.id.replace('evt-', '').toUpperCase().slice(0, 4);
    const ticketId = `KIIT-IEEE-2026-${code}${randomSuffix}`;

    const newRegistration = {
      ticketId,
      eventId: event.id,
      eventName: event.title,
      studentName: formData.fullName || this.user.name,
      rollNo: formData.rollNo || this.user.rollNo,
      branch: formData.branch || this.user.branch,
      year: formData.year || this.user.year,
      email: formData.email || this.user.email,
      phone: formData.phone || this.user.phone,
      track: formData.track || (event.tags ? event.tags[0] : 'General'),
      tshirtSize: formData.tshirtSize || 'L',
      bench: "Bench B" + Math.floor(10 + Math.random() * 15),
      team: this.user.teamId || "Unassigned",
      prepScore: this.user.readinessScore || 87,
      workshopProgress: 0,
      challengesSolved: "0 / 2",
      projectSubmitted: false,
      certificateEligible: false,
      registeredAt: new Date().toISOString(),
      status: 'Confirmed',
      attended: false,
      qrData: `KIIT-IEEE-PASS:${ticketId}:${eventId}:${this.user.rollNo}`
    };

    event.seatsFilled = Math.min(event.seatsTotal, (event.seatsFilled || 0) + 1);
    if (event.seatsFilled >= event.seatsTotal) {
      event.status = 'FULL';
    } else if (event.seatsFilled >= event.seatsTotal * 0.8) {
      event.status = 'ALMOST FULL';
    }

    this.registrations.unshift(newRegistration);
    this.awardXp(100, `Registered for "${event.title}"`);
    this.addAuditLog(newRegistration.studentName, `Registered for event ${event.title}`, ticketId);

    this.addNotification({
      title: 'Registration Confirmed! 🎉',
      body: `You are secured for "${event.title}". Digital pass ID: ${ticketId}.`,
      type: 'success',
      action: 'openTicket',
      data: ticketId
    });

    this.notify('REGISTRATION_CREATED', newRegistration);
    return { success: true, ticket: newRegistration };
  }

  // --- ATTENDANCE & VERIFICATION ---

  verifyAndCheckIn(ticketId) {
    const reg = this.registrations.find(r => r.ticketId.trim().toUpperCase() === ticketId.trim().toUpperCase());
    if (!reg) {
      return { success: false, message: `Ticket ID "${ticketId}" not found in registered database.` };
    }
    if (reg.attended) {
      return {
        success: true,
        alreadyAttended: true,
        message: `Student ${reg.studentName} was ALREADY checked in at ${new Date(reg.attendedAt).toLocaleTimeString()}.`,
        registration: reg
      };
    }

    reg.attended = true;
    reg.attendedAt = new Date().toISOString();
    reg.status = 'Attended';

    this.awardXp(150, `Checked into event lab (${reg.eventName})`);
    this.addAuditLog("Host QR Desk", `Verified attendance for ${reg.studentName} (${reg.rollNo})`, reg.ticketId);

    this.addNotification({
      title: 'Attendance Confirmed! ⚡',
      body: `Welcome to ${reg.eventName}! Verified by IEEE Desk. Bench assigned: ${reg.bench || 'Lab Bench'}.`,
      type: 'success'
    });

    this.notify('ATTENDANCE_CHECKED_IN', reg);
    return {
      success: true,
      alreadyAttended: false,
      message: `Verified successfully! Welcome, ${reg.studentName} (${reg.rollNo}).`,
      registration: reg
    };
  }

  // --- HOST OPERATIONS ---

  addEvent(eventData) {
    const eventId = eventData.id || `evt-${Date.now()}`;
    const slug = eventData.slug || (eventData.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if event already exists in store
    const existingIndex = this.events.findIndex(e => 
      String(e.id).toLowerCase() === String(eventId).toLowerCase() || 
      (e.slug && String(e.slug).toLowerCase() === String(slug).toLowerCase())
    );

    const newEvent = {
      id: eventId,
      slug: slug,
      title: eventData.title || 'Untitled Technical Workshop',
      tagline: eventData.tagline || eventData.shortDescription || 'Organized by KIIT IEEE Student Branch.',
      category: eventData.category || 'AI & Machine Learning',
      format: eventData.format || 'Offline',
      eventType: eventData.eventType || 'Workshop',
      difficulty: eventData.difficulty || 'Intermediate',
      price: eventData.price || 0,
      priceLabel: eventData.priceLabel || 'Free',
      date: eventData.date || 'Upcoming 2026',
      startDate: eventData.startDate || '',
      endDate: eventData.endDate || '',
      time: eventData.time || '10:00 AM - 04:00 PM IST',
      startTime: eventData.startTime || '',
      endTime: eventData.endTime || '',
      reportingTime: eventData.reportingTime || '08:30 AM',
      venue: eventData.venue || 'Campus 15, Tech Lab 2',
      campus: eventData.campus || 'Campus 15',
      building: eventData.building || 'School of Computer Engineering',
      room: eventData.room || 'Tech Lab 4',
      address: eventData.address || '',
      bannerGradient: eventData.bannerGradient || 'from-indigo-600 via-purple-600 to-cyan-600',
      badgeColor: eventData.badgeColor || 'badge-ai',
      featured: eventData.featured !== undefined ? eventData.featured : false,
      status: eventData.status || 'PUBLISHED',
      publishedAt: eventData.publishedAt || new Date().toISOString(),
      speaker: eventData.speaker || {
        name: 'Dr. IEEE Senior Mentor',
        role: 'Technical Trainer',
        org: 'KIIT IEEE',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: 'Industry certified instructor with deep domain expertise.'
      },
      speakers: eventData.speakers || (eventData.speaker ? [eventData.speaker] : []),
      seatsTotal: parseInt(eventData.seatsTotal, 10) || 120,
      seatsFilled: eventData.seatsFilled || 0,
      eligibility: eventData.eligibility || 'Open to all KIIT students.',
      schedule: eventData.schedule || [
        { time: '10:00 AM', title: 'Architecture and Environment Setup', status: 'Upcoming' },
        { time: '01:00 PM', title: 'Hands-on Implementation Sprint', status: 'Upcoming' },
        { time: '03:30 PM', title: 'Capstone Evaluation & Certification', status: 'Upcoming' }
      ],
      prerequisites: eventData.prerequisites || ['Basic programming knowledge', 'Laptop with charger'],
      whatYouWillBuild: eventData.whatYouWillBuild || ['Production ready technical capstone', 'Verified IEEE Certificate'],
      whatWillLearn: eventData.whatWillLearn || '',
      whatToBring: eventData.whatToBring || '',
      contactPerson: eventData.contactPerson || '',
      contactPhone: eventData.contactPhone || '',
      contactEmail: eventData.contactEmail || '',
      registrationDeadline: eventData.registrationDeadline || '',
      hardwareKit: eventData.hardwareKit || 'Lab infrastructure provided on-site.',
      faqs: eventData.faqs || [
        { q: 'Will certificates be provided?', a: 'Yes, official IEEE Student Branch credentials issued upon completion.' }
      ],
      tags: eventData.tags || ['IEEE', 'Workshop', 'Hands-on']
    };

    if (existingIndex >= 0) {
      this.events[existingIndex] = { ...this.events[existingIndex], ...newEvent };
    } else {
      this.events.unshift(newEvent);
    }

    this.addAuditLog(this.user.name, `Created new event: ${newEvent.title}`, newEvent.id);
    this.addNotification({
      title: 'New Event Published! 🚀',
      body: `"${newEvent.title}" has been published to the live discovery portal.`,
      type: 'info'
    });

    this.notify('EVENT_ADDED', newEvent);
    return newEvent;
  }

  broadcastAnnouncement(title, body, targetEvent = 'All') {
    const notif = {
      title: `📢 Announcement: ${title}`,
      body,
      type: 'warning'
    };
    this.addNotification(notif);
    this.addAuditLog(this.user.name, `Broadcast announcement: "${title}" to ${targetEvent}`, 'Announcement');
    this.notify('ANNOUNCEMENT_BROADCAST', notif);
  }

  batchGenerateCertificates(eventId) {
    const eligibleRegs = this.registrations.filter(r => 
      (!eventId || eventId === 'All' || r.eventId === eventId) &&
      r.attended
    );

    let generatedCount = 0;
    eligibleRegs.forEach(reg => {
      const alreadyHas = this.certificates.some(c => c.rollNo === reg.rollNo && c.eventId === reg.eventId);
      if (!alreadyHas) {
        const certId = `CERT-IEEE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const newCert = {
          id: certId,
          eventId: reg.eventId,
          eventName: reg.eventName,
          studentName: reg.studentName,
          rollNo: reg.rollNo,
          issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          verificationHash: "0x" + Math.random().toString(16).substring(2, 10).toUpperCase() + Math.random().toString(16).substring(2, 10).toUpperCase(),
          status: "Verified",
          grade: "Distinction with Honors",
          counselor: "Dr. J. R. Mohanty, Branch Counselor, KIIT IEEE",
          chair: "Chairperson, KIIT IEEE Student Branch"
        };
        this.certificates.unshift(newCert);
        reg.certificateEligible = true;
        generatedCount++;
      }
    });

    this.addAuditLog(this.user.name, `Batch generated ${generatedCount} certificates for event ${eventId}`, 'CertificateEngine');
    this.notify('CERTIFICATES_BATCH_GENERATED', { count: generatedCount });
    return generatedCount;
  }

  // --- SUPPORT TICKETS ---

  addSupportTicket(ticketData) {
    const newTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      bench: ticketData.bench || 'Bench B17',
      student: ticketData.student || `${this.user.name} (${this.user.rollNo})`,
      event: ticketData.event || 'AI & Edge Computer Vision Masterclass',
      issue: ticketData.issue || 'Need volunteer assistance with lab setup',
      priority: ticketData.priority || 'MEDIUM',
      status: 'Open',
      createdAt: 'Just now',
      assignedVolunteer: null
    };

    this.supportTickets.unshift(newTicket);
    this.addAuditLog(this.user.name, `Created support ticket ${newTicket.id} at ${newTicket.bench}`, newTicket.id);
    this.notify('TICKET_CREATED', newTicket);
    return newTicket;
  }

  claimSupportTicket(ticketId, volunteerName = null) {
    const t = this.supportTickets.find(ticket => ticket.id === ticketId);
    if (t) {
      t.status = 'In Progress';
      t.assignedVolunteer = volunteerName || this.user.name;
      this.addAuditLog(this.user.name, `Claimed ticket ${ticketId}`, ticketId);
      this.notify('TICKET_UPDATED', t);
    }
  }

  resolveSupportTicket(ticketId, resolutionNote = '') {
    const t = this.supportTickets.find(ticket => ticket.id === ticketId);
    if (t) {
      t.status = 'Resolved';
      t.resolvedAt = new Date().toLocaleTimeString();
      t.resolutionNote = resolutionNote;
      this.addAuditLog(this.user.name, `Resolved ticket ${ticketId}`, ticketId);
      this.notify('TICKET_UPDATED', t);
    }
  }

  // --- CHALLENGE SUBMISSION ---

  submitChallenge(challengeId, submissionData) {
    const ch = this.challenges.find(c => c.id === challengeId);
    if (!ch) return { success: false, error: 'Challenge not found' };

    ch.submissionsCount = (ch.submissionsCount || 0) + 1;
    this.awardXp(ch.points, `Submitted solution for challenge: "${ch.title}"`);

    this.addNotification({
      title: 'Challenge Submitted! 🎯',
      body: `Your submission for "${ch.title}" has been recorded. Review in progress.`,
      type: 'success'
    });

    this.addAuditLog(this.user.name, `Submitted solution for challenge ${ch.title}`, challengeId);
    this.notify('CHALLENGE_SUBMITTED', { challengeId, submissionData });
    return { success: true };
  }

  // --- HARDWARE MANAGEMENT ---

  assignHardware(hardwareId, bench, team) {
    const item = this.hardware.find(h => h.id === hardwareId);
    if (item) {
      item.bench = bench;
      item.assignedTeam = team;
      item.status = 'In Use';
      this.addAuditLog(this.user.name, `Assigned hardware ${hardwareId} to ${bench} (${team})`, hardwareId);
      this.notify('HARDWARE_UPDATED', item);
    }
  }

  returnHardware(hardwareId) {
    const item = this.hardware.find(h => h.id === hardwareId);
    if (item) {
      item.status = 'Available';
      item.assignedTeam = 'Unassigned';
      item.bench = 'Equipment Desk';
      this.addAuditLog(this.user.name, `Returned hardware ${hardwareId} to desk`, hardwareId);
      this.notify('HARDWARE_UPDATED', item);
    }
  }

  // --- INSTITUTIONAL DATA CMS ---

  updateInstitutionalData(updates) {
    this.institutionalData = { ...this.institutionalData, ...updates };
    this.addAuditLog(this.user.name, `Updated institutional overview and vision content`, 'CMS');
    this.notify('INSTITUTIONAL_DATA_UPDATED', this.institutionalData);
  }

  // --- AUDIT TRAIL ---

  addAuditLog(actor, action, object) {
    const log = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actor: actor || 'System',
      action,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      object: object || 'Platform'
    };
    if (!this.auditLogs) this.auditLogs = [];
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 50) this.auditLogs.pop();
  }

  // --- NOTIFICATIONS ---

  addNotification(notif) {
    const item = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: notif.title,
      body: notif.body,
      type: notif.type || 'info',
      timestamp: 'Just now',
      read: false,
      action: notif.action || null,
      data: notif.data || null
    };
    this.notifications.unshift(item);
    this.notify('NOTIFICATION_ADDED', item);
  }

  markAllNotificationsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notify('NOTIFICATIONS_CLEARED');
  }

  // --- FILTER ACTIONS ---

  setSearchQuery(q) {
    this.activeSearchQuery = q;
    this.notify('FILTER_CHANGED');
  }

  setCategoryFilter(cat) {
    this.activeFilterCategory = cat;
    this.notify('FILTER_CHANGED');
  }

  setModeFilter(mode) {
    this.activeFilterMode = mode;
    this.notify('FILTER_CHANGED');
  }

  setDifficultyFilter(diff) {
    this.activeFilterDifficulty = diff;
    this.notify('FILTER_CHANGED');
  }

  // --- PROMOTION TRACKING & TELEMETRY ---

  trackPromotionAction(actionType, meta = {}) {
    if (!this.promotionAnalytics) {
      this.promotionAnalytics = {
        eventViews: 1842,
        registrationClicks: 482,
        registrations: 184,
        whatsappShares: 132,
        linkCopies: 87,
        linkedinShares: 31,
        emailShares: 24,
        posterDownloads: 42,
        actionHistory: []
      };
    }

    const typeKeyMap = {
      'WHATSAPP_SHARE_INITIATED': 'whatsappShares',
      'whatsapp_share_initiated': 'whatsappShares',
      'whatsapp': 'whatsappShares',
      'whatsapp_share': 'whatsappShares',
      'link_copy': 'linkCopies',
      'copy_link': 'linkCopies',
      'linkedin': 'linkedinShares',
      'linkedin_share': 'linkedinShares',
      'email': 'emailShares',
      'email_share': 'emailShares',
      'poster_download': 'posterDownloads',
      'event_view': 'eventViews',
      'registration_click': 'registrationClicks'
    };

    const targetKey = typeKeyMap[actionType];
    if (targetKey) {
      this.promotionAnalytics[targetKey] = (this.promotionAnalytics[targetKey] || 0) + 1;
    }

    const logEntry = {
      id: `act-${Date.now()}`,
      action: actionType === 'WHATSAPP_SHARE_INITIATED' ? 'WHATSAPP_SHARE_INITIATED' : actionType,
      channel: meta.channel || (actionType.includes('whatsapp') ? 'WhatsApp' : 'Web'),
      eventId: meta.eventId || null,
      actor: meta.actor || this.user?.name || 'Host',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      meta
    };

    if (!Array.isArray(this.promotionAnalytics.actionHistory)) {
      this.promotionAnalytics.actionHistory = [];
    }
    this.promotionAnalytics.actionHistory.unshift(logEntry);
    if (this.promotionAnalytics.actionHistory.length > 50) {
      this.promotionAnalytics.actionHistory.pop();
    }

    const auditDesc = actionType === 'WHATSAPP_SHARE_INITIATED'
      ? `Host initiated WhatsApp share for event: ${meta.eventId || 'active workshop'}`
      : `Promotion action: ${actionType}`;
    this.addAuditLog(this.user?.name || 'Host', auditDesc, 'EventPromotion');
    this.notify('PROMOTION_ACTION_TRACKED', { actionType, analytics: this.promotionAnalytics });
  }

  getPromotionAnalytics() {
    return this.promotionAnalytics || {
      eventViews: 1842,
      registrationClicks: 482,
      registrations: 184,
      whatsappShares: 132,
      linkCopies: 87,
      linkedinShares: 31,
      emailShares: 24,
      posterDownloads: 42,
      actionHistory: []
    };
  }

  // Reset to initial demo state
  resetAll() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.init();
    this.notify('STATE_RESET');
  }
}

export const store = new StateStore();
