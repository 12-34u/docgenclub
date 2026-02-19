import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, Header, Footer } from 'docx'

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
  const { eventName, eventDate, eventStartTime, eventEndTime, eventFlow } = formData

  const { headerLogoUrl, footerLogoUrl } = assets

  const dateObj = new Date(eventDate)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const sections = [
    new Paragraph({
      text: 'NOTICE',
      heading: HeadingLevel.HEADING_1,
      alignment: 'center',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Subject: Event Notice - ${eventName}`,
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'TO ALL MEMBERS,',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `This is to notify you that AIML Club is organizing an event titled "${eventName}".`,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'EVENT DETAILS:',
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Date: ${formattedDate}`,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Time: ${eventStartTime} - ${eventEndTime}`,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Duration: ${formData.eventDuration}`,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'AGENDA:',
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: eventFlow,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'All members are requested to attend this event. For any queries, please contact the event coordinator.',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'AIML CLUB',
      alignment: 'right',
    }),
  ]

  const hf = await buildHeaderFooter({ headerUrl: headerLogoUrl, footerUrl: footerLogoUrl })

  return new Document({
    sections: [{ children: sections, headers: hf.header ? { default: hf.header } : {}, footers: hf.footer ? { default: hf.footer } : {} }],
  })
}

export const generateReport = async (formData, assets = {}) => {
  const { eventName, eventDate, eventStartTime, eventEndTime, eventDuration, eventFlow } = formData

  const { headerLogoUrl, footerLogoUrl } = assets

  const dateObj = new Date(eventDate)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const sections = [
    new Paragraph({
      text: 'AIML CLUB',
      heading: HeadingLevel.HEADING_2,
      alignment: 'center',
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: 'EVENT REPORT',
      heading: HeadingLevel.HEADING_1,
      alignment: 'center',
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Event:', bold: true }),
        new TextRun({ text: ` ${eventName || 'Add event name'}` }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'College:', bold: true }),
        new TextRun({ text: ' Add college name and location' }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Grade / Level:', bold: true }),
        new TextRun({ text: ' Add grade or cohort' }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Date:', bold: true }),
        new TextRun({ text: ` ${formattedDate}` }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Time:', bold: true }),
        new TextRun({ text: ` ${eventStartTime} - ${eventEndTime}` }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Duration:', bold: true }),
        new TextRun({ text: ` ${eventDuration}` }),
      ],
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Participants:', bold: true }),
        new TextRun({ text: ' Add count and profile' }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Targeted Audience:', bold: true }),
        new TextRun({ text: ' Add target group' }),
      ],
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Speakers:', bold: true }),
        new TextRun({ text: ' Add speaker names and designations' }),
      ],
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Faculty Accompanied:', bold: true }),
        new TextRun({ text: ' Add faculty names (if any)' }),
      ],
      spacing: { after: 240 },
    }),
    new Paragraph({
      text: 'Introduction:',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Provide a short overview of the event purpose, objectives, and context.',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'Discussion:',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: eventFlow || 'Summarize the agenda, activities, demos, and key interactions here.',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'Conclusion:',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Capture outcomes, feedback, and next steps. Mention certificates or follow-ups if applicable.',
      spacing: { after: 240 },
    }),
    new Paragraph({
      text: 'Prepared by AIML Club',
      alignment: 'center',
      spacing: { before: 160 },
    }),
  ]

  const hf = await buildHeaderFooter({ headerUrl: headerLogoUrl, footerUrl: footerLogoUrl })

  return new Document({
    sections: [{ children: sections, headers: hf.header ? { default: hf.header } : {}, footers: hf.footer ? { default: hf.footer } : {} }],
  })
}

export const generateInstagramContent = (formData) => {
  const { eventName, eventDate, eventStartTime, eventEndTime, eventVenue, eventFlow } = formData
  return `Tired of boring mini projects? 😴\nWant to build something that actually solves real-life problems? 🤖✨\n\nThen this session is for YOU!\n\nThe AIML Club presents:\n🎯 ${eventName || 'Project Bootcamp'} 🎯\n\nDate: ${eventDate}\n⏰ Time: ${eventStartTime || ''}${eventEndTime ? ' - ' + eventEndTime : ''}\n📍 Venue: ${eventVenue || 'Add venue'}\n\nHere is what we will tackle:\n${eventFlow || '• Add your project flow or agenda here'}\n\nPowered by AI tools to help you build faster and smarter.\n\n💥 Learn smarter\n💥 Build faster\n💥 Solve real problems\n\n👉 Don’t miss it – let’s turn your ideas into next-level AI solutions!`
}

export const generateLinkedInContent = (formData) => {
  const { eventName, eventStartTime, eventEndTime, eventFlow } = formData
  return `🎯 Exciting Event Alert!

${eventName}

📍 Time: ${eventStartTime} - ${eventEndTime}

Event Highlights:
${eventFlow}

AIML Club invites you to participate in this enriching session. Connect, learn, and grow with our community!

#AIML #LinkedInEvent #ProfessionalDevelopment #Community`
}

export const generateWhatsAppInvite = (formData) => {
  const { eventName, eventDate, eventStartTime } = formData
  return `🎉 You're Invited! 🎉

Event: ${eventName}
📅 Date: ${eventDate}
⏰ Time: ${eventStartTime}

Join AIML Club for an unforgettable experience!
Looking forward to your participation! 👋

Reply with ✋ to confirm your attendance`
}

export const generateWhatsAppPostEvent = (formData) => {
  const { eventName, eventFlow } = formData
  return `🌟 Thank You for Attending! 🌟

Event: ${eventName}

Highlights from the event:
${eventFlow}

We hope you had an amazing time! 
Stay tuned for upcoming events. 🚀

Thanks for being part of the AIML Club community! ❤️`
}

export const generateInstagramPostEvent = (formData) => {
  const { eventName, eventDate, eventFlow } = formData
  return `✨ Highlights from ${eventName} ✨\n\n📅 Held on: ${eventDate}\n\nWhat went down:\n${eventFlow || '• Key moments and outcomes'}\n\nGrateful to everyone who joined and made it incredible. Stay tuned for what’s next! 🚀 #AIMLClub #Recap #Community`
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
