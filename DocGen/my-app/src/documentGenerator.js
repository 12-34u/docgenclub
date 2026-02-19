import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, Header, Footer } from 'docx'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBQwjKB7YtjBxX9D5erpOHxUZnmEGB6lAc"
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

const callGemini = async (prompt) => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.warn(`Gemini API error: ${error?.error?.message || response.statusText}`)
      return null
    }

    const data = await response.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (err) {
    console.warn('Gemini API call failed:', err)
    return null
  }
}

const toSentence = (value, fallback = "") => (value && value.trim().length ? value.trim() : fallback)

const formatDate = (dateStr) => {
  if (!dateStr) return "Add date"
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

const dataUrlToBuffer = (dataUrl) => {
  try {
    const parts = dataUrl.split(',')
    if (parts.length !== 2) return null
    const binary = atob(parts[1])
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i)
    return bytes.buffer
  } catch (e) {
    console.warn('Failed to parse data URL', e)
    return null
  }
}

const fetchImageBuffer = async (urlOrData) => {
  if (!urlOrData) return null
  // Support data URLs directly to avoid fetch/CORS issues
  if (urlOrData.startsWith('data:')) {
    return dataUrlToBuffer(urlOrData)
  }
  try {
    const res = await fetch(urlOrData, { mode: 'cors' })
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch (err) {
    console.warn('Image fetch failed', err)
    return null
  }
}

const buildHeaderFooter = async ({ headerUrl, footerUrl }) => {
  const headerChildren = []
  const footerChildren = []

  if (headerUrl) {
    const buf = await fetchImageBuffer(headerUrl)
    if (buf) {
      headerChildren.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buf,
              transformation: { width: 600, height: 120 },
            }),
          ],
        }),
      )
    }
  }

  if (footerUrl) {
    const buf = await fetchImageBuffer(footerUrl)
    if (buf) {
      footerChildren.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buf,
              transformation: { width: 320, height: 60 },
            }),
          ],
        }),
      )
    }
  }

  return {
    header: headerChildren.length ? new Header({ children: headerChildren }) : undefined,
    footer: footerChildren.length ? new Footer({ children: footerChildren }) : undefined,
  }
}

export const generateNotice = async (formData, assets = {}) => {
  const { eventName, eventDate, eventStartTime, eventEndTime, eventVenue, eventDuration, eventFlow } = formData
  const { headerLogoUrl, footerLogoUrl } = assets

  const prompt = `
Generate a formal notice for AIML Club event announcement in plain text format.

Event Details:
- Event Title: ${toSentence(eventName, "Upcoming Event")}
- Date: ${formatDate(eventDate)}
- Time: ${toSentence(eventStartTime, "Add start")} - ${toSentence(eventEndTime, "Add end")}
- Duration: ${toSentence(eventDuration, "Add duration")}
- Venue: ${toSentence(eventVenue, "Add venue")}
- Agenda: ${toSentence(eventFlow, "Add agenda")}

Create a professional notice with:
1. Clear title: "NOTICE: ${toSentence(eventName, "Event")}"
2. Introduction to all members
3. Detailed event information (date, time, venue, duration)
4. What to expect / Agenda details
5. Call to action for attendance
6. Contact information for queries

Write in formal, professional tone.
`

  const aiContent = await callGemini(prompt)
  
  const content = aiContent || `NOTICE: ${toSentence(eventName, "Upcoming Event")}

TO ALL MEMBERS,

This is to notify you that AIML Club is organizing an event titled "${toSentence(eventName, "Upcoming Event")}".

EVENT DETAILS:
Date: ${formatDate(eventDate)}
Time: ${toSentence(eventStartTime, "Add start")} - ${toSentence(eventEndTime, "Add end")}
Duration: ${toSentence(eventDuration, "Add duration")}
Venue: ${toSentence(eventVenue, "Add venue")}

AGENDA:
${toSentence(eventFlow, "Add agenda")}

All members are requested to attend this event. For any queries, please contact the event coordinator.

AIML CLUB`

  const sections = content.split('\n').map(line => 
    new Paragraph({
      text: line || ' ',
      spacing: { after: 120 },
    })
  )

  const hf = await buildHeaderFooter({ headerUrl: headerLogoUrl, footerUrl: footerLogoUrl })

  return new Document({
    sections: [{ children: sections, headers: hf.header ? { default: hf.header } : {}, footers: hf.footer ? { default: hf.footer } : {} }],
  })
}

export const generateReport = async (formData, assets = {}) => {
  const { eventName, eventDate, eventStartTime, eventEndTime, eventDuration, eventFlow } = formData
  const { headerLogoUrl, footerLogoUrl } = assets

  const prompt = `
Generate a professional event report for AIML Club in plain text format (no markdown).

Event Details:
- Event Name: ${toSentence(eventName, "Add event name")}
- Date: ${formatDate(eventDate)}
- Time: ${toSentence(eventStartTime, "Add start")} - ${toSentence(eventEndTime, "Add end")}
- Venue: ${toSentence(formData.eventVenue, "Add venue")}
- Duration: ${toSentence(eventDuration, "Add duration")}
- Agenda/Flow: ${toSentence(eventFlow, "Add agenda")}

Create a structured report with these sections:
1. Executive Summary: Brief overview of the event and its significance
2. Agenda Highlights: Key points and activities covered
3. Key Outcomes: Learning objectives achieved and participant feedback
4. Next Steps: Follow-up actions and improvements

Write in formal, professional tone suitable for AIML Club documentation.
`

  const aiContent = await callGemini(prompt)

  const content = aiContent || `AIML CLUB - EVENT REPORT

Event: ${toSentence(eventName, "Add event name")}
Date: ${formatDate(eventDate)}
Time: ${toSentence(eventStartTime, "Add start")} - ${toSentence(eventEndTime, "Add end")}
Venue: ${toSentence(formData.eventVenue, "Add venue")}
Duration: ${toSentence(eventDuration, "Add duration")}

EXECUTIVE SUMMARY:
${toSentence(eventName, "The event")} delivered a focused session for the AIML Club, combining practical takeaways with hands-on moments to keep the audience engaged.

AGENDA HIGHLIGHTS:
${toSentence(eventFlow, "Add agenda")}

KEY OUTCOMES:
- Participants gained clarity on the objectives and expected outcomes.
- Live demos or activities reinforced the main concepts.
- Attendees shared feedback that will shape the next iteration.

NEXT STEPS:
- Share session materials and recordings with attendees.
- Collect feedback via a short survey within 24 hours.
- Plan a follow-up clinic to address advanced questions.

Prepared by the AIML Club.`

  const sections = content.split('\n').map(line => 
    new Paragraph({
      text: line || ' ',
      spacing: { after: 120 },
    })
  )

  const hf = await buildHeaderFooter({ headerUrl: headerLogoUrl, footerUrl: footerLogoUrl })

  return new Document({
    sections: [{ children: sections, headers: hf.header ? { default: hf.header } : {}, footers: hf.footer ? { default: hf.footer } : {} }],
  })
}

export const generateInstagramContent = async (formData) => {
  const { eventName, eventDate, eventStartTime, eventEndTime, eventVenue, eventFlow } = formData

  const timeStr = eventStartTime && eventEndTime ? `${eventStartTime} - ${eventEndTime}` : eventStartTime || "Time TBA"

  const prompt = `
Generate an engaging Instagram pre-event announcement post for AIML Club. Keep it under 200 words.

Event Details:
- Event: ${toSentence(eventName, "AIML Club Event")}
- Date: ${eventDate || "Date soon"}
- Time: ${timeStr}
- Venue: ${toSentence(eventVenue, "Venue TBA")}
- What's happening: ${toSentence(eventFlow, "Add agenda")}

Create a catchy, Instagram-friendly post with:
1. Hook/Attention-grabber
2. Key details (date, time, venue)
3. What attendees will learn/experience
4. Call to action (save date, bring friends, RSVP mention)
5. 2-3 relevant hashtags

Use emojis naturally to make it visually appealing and engaging for social media.
`

  const aiContent = await callGemini(prompt)

  return aiContent || `🚀 ${toSentence(eventName, "AIML Club Event")} 🚀

📅 ${eventDate || "Date soon"}
⏰ ${timeStr}
📍 ${toSentence(eventVenue, "Venue TBA")}

${toSentence(eventFlow, "Join us for an amazing learning experience!")}

Don't miss out! Save the date and bring a friend. Let's build smarter, together! ✨

#AIMLClub #TechEvent #Learning`
}

export const generateLinkedInContent = async (formData) => {
  const { eventName, eventDate, eventStartTime, eventEndTime, eventFlow } = formData

  const prompt = `
Generate a professional LinkedIn event announcement post for AIML Club. Keep it under 250 words.

Event Details:
- Event: ${toSentence(eventName, "an AIML Club session")}
- Date: ${formatDate(eventDate)}
- Time: ${toSentence(eventStartTime, "Add start")} - ${toSentence(eventEndTime, "Add end")}
- What to expect: ${toSentence(eventFlow, "Add agenda")}

Create a professional LinkedIn post with:
1. Strong opening about professional/skill development value
2. Event details (date, time)
3. Key learning areas and outcomes
4. Who should attend (target audience)
5. Call to action (register, learn more)
6. 3-4 relevant professional hashtags (#AIML, #Learning, #Community, etc.)

Keep a professional, inspiring tone suitable for career development audience.
`

  const aiContent = await callGemini(prompt)

  return aiContent || `🎯 Excited to host ${toSentence(eventName, "an AIML Club session")}!

📅 Date: ${formatDate(eventDate)}
⏰ Time: ${toSentence(eventStartTime, "Add start")} - ${toSentence(eventEndTime, "Add end")}

What to expect:
${toSentence(eventFlow, "Add agenda")}

If you want practical, hands-on learning with peers, this is for you. Join us and grow with the AIML Club community.

#AIML #Learning #Community #ProfessionalDevelopment`
}

export const generateWhatsAppInvite = async (formData) => {
  const { eventName, eventDate, eventStartTime, eventVenue } = formData

  const prompt = `
Generate a friendly, concise WhatsApp invitation message for AIML Club event. Keep it under 100 words.

Event Details:
- Event: ${toSentence(eventName, "Club Meetup")}
- Date: ${eventDate || "Date TBA"}
- Time: ${toSentence(eventStartTime, "Time TBA")}
- Venue: ${toSentence(eventVenue, "Venue TBA")}

Create a casual, friendly WhatsApp message with:
1. Fun hook
2. Event details (date, time, venue)
3. Why they should come
4. Request to confirm attendance (emoji response like ✋)
5. Suggestion to bring friends

Use WhatsApp-friendly emojis and casual tone. Make it feel like a group chat invite.
`

  const aiContent = await callGemini(prompt)

  return aiContent || `🎉 AIML Club Invite 🎉

Event: ${toSentence(eventName, "Club Meetup")}
📅 Date: ${eventDate || "Date TBA"}
⏰ Time: ${toSentence(eventStartTime, "Time TBA")}
📍 Venue: ${toSentence(eventVenue, "Venue TBA")}

Join us for an unforgettable experience!
Reply with ✋ to confirm your attendance. Bring a friend! 👋`
}

export const generateWhatsAppPostEvent = async (formData) => {
  const { eventName, eventFlow } = formData

  const prompt = `
Generate a friendly WhatsApp thank-you/recap message for AIML Club post-event. Keep it under 100 words.

Event Details:
- Event: ${toSentence(eventName, "AIML Club Session")}
- Highlights: ${toSentence(eventFlow, "Add highlights")}

Create a warm, celebratory WhatsApp message with:
1. Gratitude and celebration tone
2. Event highlights recap
3. Appreciation for attendees
4. Teaser for next event
5. Keep everyone engaged

Use celebratory emojis and friendly tone. Should feel like a group appreciation message.
`

  const aiContent = await callGemini(prompt)

  return aiContent || `🙌 Thanks for joining!

Event: ${toSentence(eventName, "AIML Club Session")}

Highlights:
${toSentence(eventFlow, "Add highlights")}

We hope you had an amazing time! Stay tuned for upcoming events. 🚀

Thanks for being part of the AIML Club community! ❤️`
}

export const generateInstagramPostEvent = async (formData) => {
  const { eventName, eventDate, eventFlow } = formData

  const prompt = `
Generate an Instagram post-event recap/celebration post for AIML Club. Keep it under 180 words.

Event Details:
- Event: ${toSentence(eventName, "AIML Club Event")}
- Date: ${eventDate || "the recent event"}
- Highlights: ${toSentence(eventFlow, "Add highlights")}

Create a celebratory, engaging post with:
1. Excitement/gratitude hook
2. Event recap and key highlights
3. Participant impact/outcomes
4. Thank you to attendees
5. Teaser for next event
6. 2-3 relevant hashtags

Use celebratory emojis and energy to keep the community engaged.
`

  const aiContent = await callGemini(prompt)

  return aiContent || `✨ ${toSentence(eventName, "AIML Club Event")} Recap ✨

📅 Held on: ${eventDate || "the recent event"}

What went down:
${toSentence(eventFlow, "Amazing highlights and key moments!")}

Grateful to everyone who joined and made it incredible. Stay tuned for what's next! 🚀

#AIMLClub #Recap #Community`
}

export const downloadWord = async (docxDoc, fileName) => {
  const blob = await Packer.toBlob(docxDoc)
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = fileName
  window.document.body.appendChild(link)
  link.click()
  window.document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
