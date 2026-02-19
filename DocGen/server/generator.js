const toSentence = (value, fallback = '') => (value && value.trim().length ? value.trim() : fallback)

const parseFlow = (flow = '') => {
  const raw = flow
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
  return raw.length ? raw : ['Add agenda or key points']
}

const renderList = (items = []) => items.map((item) => `- ${item}`).join('\n')

const formatDate = (date) => {
  if (!date) return 'Add date'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (_err) {
    return date
  }
}

const generateReportText = (formData) => {
  const { eventName, eventDate, eventVenue, eventStartTime, eventEndTime, eventDuration, eventFlow } = formData
  const flowPoints = parseFlow(eventFlow)
  const venue = toSentence(eventVenue, 'Add venue')
  const name = toSentence(eventName, 'Add event name')
  const duration = toSentence(eventDuration, 'Add duration')

  return [
    `Event Report: ${name}`,
    `Date: ${formatDate(eventDate)}`,
    `Time: ${toSentence(eventStartTime, 'Add start')} - ${toSentence(eventEndTime, 'Add end')}`,
    `Venue: ${venue}`,
    `Duration: ${duration}`,
    '',
    'Executive Summary:',
    `${name} delivered a focused session for the AIML Club, combining practical takeaways with hands-on moments to keep the audience engaged.`,
    '',
    'Agenda Highlights:',
    renderList(flowPoints),
    '',
    'Key Outcomes:',
    renderList([
      'Participants gained clarity on the objectives and expected outcomes.',
      'Live demos or activities reinforced the main concepts.',
      'Attendees shared feedback that will shape the next iteration.',
    ]),
    '',
    'Next Steps:',
    renderList([
      'Share session materials and recordings with attendees.',
      'Collect feedback via a short survey within 24 hours.',
      'Plan a follow-up clinic to address advanced questions.',
    ]),
    '',
    'Prepared by the AIML Club.',
  ].join('\n')
}

const generateNoticeText = (formData) => {
  const { eventName, eventDate, eventStartTime, eventEndTime, eventVenue, eventDuration, eventFlow } = formData
  const flowPoints = parseFlow(eventFlow)
  return [
    `Notice: ${toSentence(eventName, 'Upcoming Event')}`,
    '',
    `Date: ${formatDate(eventDate)}`,
    `Time: ${toSentence(eventStartTime, 'Add start')} - ${toSentence(eventEndTime, 'Add end')}`,
    `Duration: ${toSentence(eventDuration, 'Add duration')}`,
    `Venue: ${toSentence(eventVenue, 'Add venue')}`,
    '',
    'What to expect:',
    renderList(flowPoints),
    '',
    'All AIML Club members are requested to join on time. For questions, contact the coordinators.',
  ].join('\n')
}

const generateInstagramPre = (formData) => {
  const { eventName, eventDate, eventStartTime, eventEndTime, eventVenue, eventFlow } = formData
  const flowPoints = parseFlow(eventFlow)
  return [
    `🚀 ${toSentence(eventName, 'AIML Club Spotlight')} 🚀`,
    '',
    `📅 ${eventDate || 'Date soon'}`,
    `⏰ ${toSentence(eventStartTime, '')}${eventEndTime ? ` - ${eventEndTime}` : ''}`,
    `📍 ${toSentence(eventVenue, 'Venue TBA')}`,
    '',
    'We are diving into:',
    renderList(flowPoints.slice(0, 4)),
    '',
    'Save the date and bring a friend. Let us build smarter, together! ✨',
  ].join('\n')
}

const generateInstagramPostEvent = (formData) => {
  const { eventName, eventDate, eventFlow } = formData
  const flowPoints = parseFlow(eventFlow)
  return [
    `✨ ${toSentence(eventName, 'AIML Club Event')} Recap ✨`,
    '',
    `Held on ${eventDate || 'the recent weekend'}, we packed the room with energy and curiosity.`,
    'Highlights:',
    renderList(flowPoints.slice(0, 5)),
    '',
    'Thanks to everyone who showed up and shared the vibe. More coming soon! 🚀',
  ].join('\n')
}

const generateLinkedInText = (formData) => {
  const { eventName, eventDate, eventStartTime, eventEndTime, eventFlow } = formData
  const flowPoints = parseFlow(eventFlow)
  return [
    `Excited to host ${toSentence(eventName, 'an AIML Club session')}!`,
    '',
    `Date: ${formatDate(eventDate)}`,
    `Time: ${toSentence(eventStartTime, 'Add start')} - ${toSentence(eventEndTime, 'Add end')}`,
    '',
    'What we will cover:',
    renderList(flowPoints.slice(0, 5)),
    '',
    'If you want practical, hands-on learning with peers, this is for you. Join us and grow with the AIML Club community.',
    '',
    '#AIML #Learning #Community #Projects',
  ].join('\n')
}

const generateWhatsAppInviteText = (formData) => {
  const { eventName, eventDate, eventStartTime, eventVenue } = formData
  return [
    '🎉 AIML Club Invite 🎉',
    '',
    `Event: ${toSentence(eventName, 'Club Meetup')}`,
    `Date: ${eventDate || 'Date TBA'}`,
    `Time: ${toSentence(eventStartTime, 'Time TBA')}`,
    `Venue: ${toSentence(eventVenue, 'Venue TBA')}`,
    '',
    'Reply with ✋ if you are in. Bring a friend who loves to build!',
  ].join('\n')
}

const generateWhatsAppPostEventText = (formData) => {
  const { eventName, eventFlow } = formData
  const flowPoints = parseFlow(eventFlow)
  return [
    '🙌 Thanks for joining!',
    '',
    `Event: ${toSentence(eventName, 'AIML Club Session')}`,
    'Top moments:',
    renderList(flowPoints.slice(0, 4)),
    '',
    'Stay tuned for next week. Share feedback to help us level up. 🚀',
  ].join('\n')
}

const generators = {
  report: generateReportText,
  notice: generateNoticeText,
  instagram: generateInstagramPre,
  'instagram post event': generateInstagramPostEvent,
  linkedin: generateLinkedInText,
  'whatsapp invite': generateWhatsAppInviteText,
  'whatsapp post event': generateWhatsAppPostEventText,
}

export const generateContent = (docType, formData = {}) => {
  if (!docType) throw new Error('docType is required')
  const normalized = docType.toLowerCase()
  const fn = generators[normalized]
  if (!fn) {
    throw new Error(`Unsupported docType: ${docType}`)
  }
  return fn(formData)
}

export const supportedDocTypes = Object.keys(generators)
