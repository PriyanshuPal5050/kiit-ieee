export default function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    const payload = body || {};

    const title = payload.eventName || payload.title || 'Technical Workshop';
    const campus = payload.campus || 'Campus 15';
    const room = payload.room || 'Tech Lab 4';
    const building = payload.building || 'School of Computer Engineering';
    const venue = payload.venue || `${room}, ${building}, ${campus}`;
    const date = payload.date || `${payload.startDate || '10 Oct'} – ${payload.endDate || '11 Oct 2026'}`;
    const startTime = payload.startTime || '09:30';
    const endTime = payload.endTime || '17:00';
    const reporting = payload.reportingTime || '08:30 AM';
    const speaker = payload.speakerName || 'Dr. Priyadarshi Sen';
    const desig = payload.speakerDesignation || 'Principal AI Research Scientist';
    const org = payload.speakerOrganization || 'KIIT Deemed to be University';
    const eligibility = payload.eligibility || 'Open to 2nd, 3rd & 4th Year B.Tech students (All branches)';
    const seats = payload.seats || payload.seatsTotal || 120;
    const fee = payload.registrationFee || payload.fee || 'Free (IEEE Sponsored)';

    const shortDesc = `An intensive, hands-on masterclass exploring practical implementation of ${title} with real hardware and production-grade toolchains.`;
    const fullDesc = `Join KIIT IEEE for an immersive masterclass on ${title}. Led by ${speaker} (${desig}, ${org}) at ${venue}, this workshop combines architectural deep dives with hands-on lab sprints, giving participants real deployment experience and verified IEEE credentials.`;

    const whatsappAnnouncement = [
      `🎓 *KIIT IEEE PRESENTS*`,
      ``,
      `🚀 *${title.toUpperCase()}*`,
      ``,
      `💡 ${shortDesc}`,
      ``,
      `📅 *Date:* ${date}`,
      `⏰ *Time:* ${startTime} – ${endTime} IST`,
      `🕐 *Reporting:* ${reporting}`,
      `📍 *Venue:* ${venue}`,
      `🏢 *Building:* ${building}`,
      `🎯 *Eligibility:* ${eligibility}`,
      `🎙️ *Speaker:* ${speaker} (${desig})`,
      ``,
      `💡 *Overview:*`,
      `${fullDesc}`,
      ``,
      `🎟️ *Capacity:* ${seats} Lab Benches Only (Filling Fast)`,
      `⏳ *Registration Deadline:* 24 hours prior to event start`,
      ``,
      `🔗 *Register Now:*`,
      `${payload.registrationUrl || 'https://kiit-ieee.org/#events'}`,
      ``,
      `👤 *Organizer:* ${payload.contactPerson || 'KIIT IEEE Student Branch'}`,
      ``,
      `#KIITIEEE #WhereStudentsBuildWhatsNext #KIITUniversity`
    ].join('\n');

    return res.status(200).json({
      success: true,
      data: {
        title,
        eventName: title,
        shortDescription: shortDesc,
        longDescription: fullDesc,
        highlights: [
          `Hands-on lab sessions at ${venue}`,
          `Mentorship by ${speaker} (${desig})`,
          `Deployment-ready capstone built and verified on-site`,
          `Official KIIT IEEE Certificate of Excellence with verification hash`
        ],
        learningOutcomes: [
          `Fundamental and advanced concepts of ${title}`,
          `Environment configuration, hardware calibration, and debugging`,
          `Production optimization and performance profiling`,
          `Collaborative engineering workflows and capstone defense`
        ],
        whatWillBuild: `A production-ready implementation of ${title} with automated verification and benchmark reporting.`,
        speakerIntroduction: `${speaker} is a ${desig} at ${org}, bringing extensive field experience in delivering high-impact engineering workshops.`,
        whatsappAnnouncement,
        posterText: `Hands-On Masterclass • ${date} • ${venue}`,
        faq: [
          { question: "Who is eligible to attend?", answer: eligibility },
          { question: "What should I bring to the workshop?", answer: "Personal laptop with charger and student ID card. Laptop with minimum 8GB RAM." },
          { question: "Is there a registration fee?", answer: `The event fee is ${fee}.` },
          { question: "Will certificates be provided?", answer: "Yes, verified IEEE Student Branch credentials will be issued upon completion." }
        ]
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `AI Event Generation error: ${err.message}`
    });
  }
}
