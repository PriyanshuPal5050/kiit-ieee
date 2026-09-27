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
    const { instruction, event } = body || {};

    if (!instruction || !instruction.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide an instruction for the AI helper.' });
    }

    const text = instruction.trim();
    const changes = {};
    const posterInstructions = {};
    const contentInstructions = {};
    const msgParts = [];

    const normalizeTime = (tStr) => {
      if (!tStr) return tStr;
      const m = String(tStr).match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (!m) return tStr;
      let h = parseInt(m[1], 10);
      const mins = m[2] || '00';
      const mer = m[3] ? m[3].toLowerCase() : null;
      if (mer === 'pm' && h < 12) h += 12;
      if (mer === 'am' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:${mins}`;
    };

    // 1. Speaker Name
    const spkMatch = text.match(/(?:(?:add|change|set|update)\s+)?(?:the\s+)?speaker(?:\s*name)?\s*(?:to|is|=)\s*([A-Za-z\s\.]+?)(?:(?:\s+and\s+)|(?:\s*\,)|\.|$)/i);
    if (spkMatch) {
      let spkName = spkMatch[1].trim().replace(/\s+(?:update|change|and).*$/i, '').trim();
      if (spkName) {
        changes.speakerName = spkName;
        msgParts.push(`Speaker name changed to ${spkName}`);
      }
    }

    // 2. Speaker Designation
    const desigMatch = text.match(/(?:speaker\s+)?designation\s*(?:to|is|=)\s*([A-Za-z0-9\s\-]+?)(?:(?:\s+and\s+)|(?:\s*\,)|\.|$)/i);
    if (desigMatch) {
      const desig = desigMatch[1].trim();
      changes.speakerDesignation = desig;
      msgParts.push(`Speaker designation updated to ${desig}`);
    }

    // 3. Campus
    const campusMatch = text.match(/campus\s*(\d+|other)/i);
    if (campusMatch) {
      const cNum = campusMatch[1];
      const cVal = !isNaN(cNum) ? `Campus ${cNum}` : 'Other';
      changes.campus = cVal;
      msgParts.push(`Campus updated to ${cVal}`);
    }

    // 4. Room
    const roomMatch = text.match(/(?:room|lab)\s*(\d+[a-z]?|\w+\s*(?:lab|hall)?\s*\d*)/i);
    if (roomMatch) {
      const rVal = roomMatch[0].trim();
      changes.room = rVal;
      msgParts.push(`Room updated to ${rVal}`);
    }

    // 5. Full Venue
    if (text.toLowerCase().includes('venue') && !campusMatch && !roomMatch) {
      const vMatch = text.match(/venue\s*(?:to|is|=)\s*([^,\.]+)/i);
      if (vMatch) {
        changes.venue = vMatch[1].trim();
        msgParts.push(`Venue updated to ${changes.venue}`);
      }
    }

    // 6. Timing (Start Time & End Time)
    const timeMatch = text.match(/(?:timing|time)\s*(?:to|is|=|from)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|–|-|and)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (timeMatch) {
      let t1 = timeMatch[1].trim();
      let t2 = timeMatch[2].trim();
      if (!/[ap]m/i.test(t1) && /[ap]m/i.test(t2)) {
        const mer = t2.match(/[ap]m/i)[0];
        const h1 = parseInt(t1, 10);
        const h2 = parseInt(t2, 10);
        if (h1 < 12 && mer.toLowerCase() === 'pm' && (h1 <= h2 || h1 >= 9)) {
          t1 = `${t1} ${mer}`;
        }
      }
      const st = normalizeTime(t1);
      const et = normalizeTime(t2);
      changes.startTime = st;
      changes.endTime = et;
      msgParts.push(`Timing set to ${st} - ${et}`);
    }

    // 7. Reporting Time
    const repMatch = text.match(/reporting(?:\s*time)?\s*(?:to|is|=|should be|at)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (repMatch) {
      const rt = normalizeTime(repMatch[1]);
      changes.reportingTime = rt;
      msgParts.push(`Reporting time set to ${rt}`);
    }

    // 8. Seats / Capacity
    const seatsMatch = text.match(/(?:seats?|capacity)\s*(?:to|is|=)\s*(\d+)/i);
    if (seatsMatch) {
      const seats = parseInt(seatsMatch[1], 10);
      changes.seats = seats;
      changes.seatsTotal = seats;
      msgParts.push(`Seats updated to ${seats}`);
    }

    // 9. Registration Fee
    const feeMatch = text.match(/(?:registration\s+)?fee\s*(?:to|is|=)\s*([₹$€\w\d\s]+?)(?:(?:\s+and\s+)|\.|$)/i);
    if (feeMatch) {
      const feeVal = feeMatch[1].trim();
      changes.registrationFee = feeVal;
      msgParts.push(`Registration fee updated to ${feeVal}`);
    }

    // 10. Event Title
    const titleMatch = text.match(/(?<!speaker\s)(?<!speaker\sname\s)(?:event\s+(?:title|name)|(?:title\s+of\s+(?:the\s+)?event)|(?:\bthe\s+title\b)|(?:\btitle\s*(?:to|is|=)))\s*(?:to|is|=)?\s*([^,\.]+)/i);
    if (titleMatch) {
      const tVal = titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
      changes.eventName = tVal;
      changes.title = tVal;
      msgParts.push(`Event title changed to "${tVal}"`);
    }

    // 11. Poster Instructions
    const tLower = text.toLowerCase();
    if (tLower.includes('poster')) {
      if (tLower.includes('formal') || tLower.includes('corporate')) {
        posterInstructions.theme = 'formal';
        posterInstructions.style = 'formal';
        posterInstructions.visualIntensity = 'moderate';
        msgParts.push('Poster set to formal IEEE style');
      } else if (tLower.includes('futuristic') || tLower.includes('cyber') || tLower.includes('neon')) {
        posterInstructions.theme = 'futuristic';
        posterInstructions.accentStyle = 'electric-blue';
        posterInstructions.style = 'futuristic';
        msgParts.push('Poster set to futuristic technical style');
      } else if (tLower.includes('blue') || tLower.includes('technical')) {
        posterInstructions.theme = 'technical';
        posterInstructions.accentStyle = 'electric-blue';
        msgParts.push('Poster set to modern technical blue style');
      } else if (tLower.includes('hackathon') || tLower.includes('energetic')) {
        posterInstructions.theme = 'energetic';
        msgParts.push('Poster set to energetic hackathon style');
      } else if (tLower.includes('minimal') || tLower.includes('clean')) {
        posterInstructions.theme = 'minimal';
        msgParts.push('Poster set to clean minimalist style');
      }
    }

    // 12. Content / Announcement Instructions
    if (tLower.includes('whatsapp') || tLower.includes('announcement') || tLower.includes('description')) {
      if (tLower.includes('shorter') || tLower.includes('short') || tLower.includes('concise')) {
        contentInstructions.length = 'short';
        msgParts.push('Announcement set to concise format');
      }
      if (tLower.includes('formal') || tLower.includes('professional')) {
        contentInstructions.tone = 'formal';
        msgParts.push('Announcement tone set to formal');
      }
    }

    // 13. Eligibility
    const eligMatch = text.match(/eligibility\s*(?:to|is|=)\s*([^,\.]+)/i);
    if (eligMatch) {
      const eVal = eligMatch[1].trim();
      changes.eligibility = eVal;
      msgParts.push(`Eligibility updated to ${eVal}`);
    }

    // 14. Prerequisites
    const prereqMatch = text.match(/prerequisites?\s*(?:to|is|=)\s*([^,\.]+)/i);
    if (prereqMatch) {
      const pVal = prereqMatch[1].trim();
      changes.prerequisites = pVal;
      msgParts.push('Prerequisites updated');
    }

    const hasChanges = Object.keys(changes).length > 0;
    const hasPoster = Object.keys(posterInstructions).length > 0;
    const hasContent = Object.keys(contentInstructions).length > 0;

    let action = 'update_event';
    if (hasChanges && hasPoster && hasContent) action = 'update_all';
    else if (hasChanges && hasPoster) action = 'update_event_and_poster';
    else if (hasChanges && hasContent) action = 'update_event_and_content';
    else if (hasPoster) action = 'update_poster';
    else if (hasContent) action = 'update_content';

    const message = msgParts.length > 0 ? msgParts.join('; ') : 'Instruction evaluated and applied.';

    return res.status(200).json({
      success: true,
      data: {
        action,
        changes,
        diff: changes,
        posterInstructions,
        contentInstructions,
        message
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `AI Event Helper error: ${err.message}`
    });
  }
}
