import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    ImageRun,
    Header,
    Footer,
} from "docx";
import { generateTextBackend } from "./backendClient";

// Helper functions
const toSentence = (value, fallback = "") =>
    value && value.trim().length ? value.trim() : fallback;

const formatDate = (dateStr) => {
    if (!dateStr) return "Add date";

    try {
        const date = new Date(dateStr);

        const day = date.getDate();
        const year = date.getFullYear();
        const month = date.toLocaleDateString("en-US", { month: "long" });

        // Get ordinal suffix
        const getOrdinal = (n) => {
            if (n > 3 && n < 21) return "th";
            switch (n % 10) {
                case 1:
                    return "st";
                case 2:
                    return "nd";
                case 3:
                    return "rd";
                default:
                    return "th";
            }
        };

        return `${day}${getOrdinal(day)} ${month} ${year}`;
    } catch {
        return dateStr;
    }
};

const dataUrlToBuffer = (dataUrl) => {
    try {
        const parts = dataUrl.split(",");
        if (parts.length !== 2) return null;
        const binary = atob(parts[1]);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
    } catch (e) {
        console.warn("Failed to parse data URL", e);
        return null;
    }
};

const fetchImageBuffer = async (urlOrData) => {
    if (!urlOrData) return null;
    // Support data URLs directly to avoid fetch/CORS issues
    if (urlOrData.startsWith("data:")) {
        return dataUrlToBuffer(urlOrData);
    }
    try {
        const res = await fetch(urlOrData, { mode: "cors" });
        if (!res.ok) return null;
        return await res.arrayBuffer();
    } catch (err) {
        console.warn("Image fetch failed", err);
        return null;
    }
};

const buildHeaderFooter = async ({ headerUrl, footerUrl }) => {
    const headerChildren = [];
    const footerChildren = [];

    if (headerUrl) {
        const buf = await fetchImageBuffer(headerUrl);
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
            );
        }
    }

    if (footerUrl) {
        const buf = await fetchImageBuffer(footerUrl);
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
            );
        }
    }

    return {
        header: headerChildren.length
            ? new Header({ children: headerChildren })
            : undefined,
        footer: footerChildren.length
            ? new Footer({ children: footerChildren })
            : undefined,
    };
};

export const generateNotice = async (formData, assets = {}) => {
    const {
        eventName,
        eventDate,
        eventStartTime,
        eventEndTime,
        eventVenue,
        eventDuration,
        eventFlow,
    } = formData;
    const { headerLogoUrl, footerLogoUrl } = assets;

    // Call backend API to generate notice content
    const aiContent = await generateTextBackend("notice", formData);

    const content =
        aiContent ||
        `NOTICE: ${toSentence(eventName, "Upcoming Event")}

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

AIML CLUB`;

    const sections = content.split("\n").map(
        (line) =>
            new Paragraph({
                text: line || " ",
                spacing: { after: 120 },
            }),
    );

    const hf = await buildHeaderFooter({
        headerUrl: headerLogoUrl,
        footerUrl: footerLogoUrl,
    });

    return new Document({
        sections: [
            {
                children: sections,
                headers: hf.header ? { default: hf.header } : {},
                footers: hf.footer ? { default: hf.footer } : {},
            },
        ],
    });
};

export const generateReport = async (formData, assets = {}) => {
    const {
        eventName,
        eventDate,
        eventStartTime,
        eventEndTime,
        eventDuration,
        eventFlow,
    } = formData;
    const { headerLogoUrl, footerLogoUrl } = assets;

    // Call backend API to generate report content
    const aiContent = await generateTextBackend("report", formData);

    const content =
        aiContent ||
        `AIML CLUB - EVENT REPORT

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

Prepared by the AIML Club.`;

    const sections = content.split("\n").map(
        (line) =>
            new Paragraph({
                text: line || " ",
                spacing: { after: 120 },
            }),
    );

    const hf = await buildHeaderFooter({
        headerUrl: headerLogoUrl,
        footerUrl: footerLogoUrl,
    });

    return new Document({
        sections: [
            {
                children: sections,
                headers: hf.header ? { default: hf.header } : {},
                footers: hf.footer ? { default: hf.footer } : {},
            },
        ],
    });
};

export const generateInstagramContent = async (formData) => {
    const {
        eventName,
        eventDate,
        eventStartTime,
        eventEndTime,
        eventVenue,
        eventFlow,
    } = formData;

    // Call backend API to generate Instagram content
    const aiContent = await generateTextBackend("instagram", formData);

    const timeStr =
        eventStartTime && eventEndTime
            ? `${eventStartTime} - ${eventEndTime}`
            : eventStartTime || "Time TBA";

    return (
        aiContent ||
        `🚀 ${toSentence(eventName, "AIML Club Event")} 🚀

📅 ${eventDate || "Date soon"}
⏰ ${timeStr}
📍 ${toSentence(eventVenue, "Venue TBA")}

${toSentence(eventFlow, "Join us for an amazing learning experience!")}

Don't miss out! Save the date and bring a friend. Let's build smarter, together! ✨

#AIMLClub #TechEvent #Learning`
    );
};

export const generateLinkedInContent = async (formData) => {
    const { eventName, eventDate, eventStartTime, eventEndTime, eventFlow } =
        formData;

    // Call backend API to generate LinkedIn content
    const aiContent = await generateTextBackend("linkedin", formData);

    return (
        aiContent ||
        `🎯 Excited to host ${toSentence(eventName, "an AIML Club session")}!

📅 Date: ${formatDate(eventDate)}
⏰ Time: ${toSentence(eventStartTime, "Add start")} - ${toSentence(eventEndTime, "Add end")}

What to expect:
${toSentence(eventFlow, "Add agenda")}

If you want practical, hands-on learning with peers, this is for you. Join us and grow with the AIML Club community.

#AIML #Learning #Community #ProfessionalDevelopment`
    );
};

export const generateWhatsAppInvite = async (formData) => {
    const { speakers, eventName, eventDate, eventStartTime, eventVenue } =
        formData;
    const formattedSpeakers = speakers?.length
        ? speakers
            .map((speaker) => `🌟 ${speaker.name? speaker.name : "Mentor Name"} (${speaker.designation? speaker.designation: "Role"})`)
            .join("\n")
        : "🌟 Mentor Name (Role)";

    const prompt = `
You are the official content writer for AIML Club, APSIT.

Your job is to generate a high-energy, visually structured, and engaging event invitation announcement for an AIML Club event.

Event Details (MANDATORY — use exactly as provided):
- Event Title: ${eventName}
- Date: ${formatDate(eventDate)} 
- Time: ${eventStartTime}
- Venue: ${eventVenue}
- Mentor Names: ${formattedSpeakers}

Important:
- DO NOT modify the date, time, venue, or event title.
- DO NOT add placeholder mentors.
- If mentor names are not provided, keep a placeholder format:
  🌟 Mentor Name (Role)
- Use the event title exactly as given inside the 🎯 title section.

Tone Guidelines:
- Energetic and inspiring
- Beginner-friendly but technically exciting
- Clear and structured
- Slightly futuristic and aspirational
- Emoji-enhanced but not excessive

Follow this EXACT structure:

1️⃣ Strong Hook Line (with emojis)
- A bold, exciting one-liner that creates curiosity.
- Should feel futuristic and motivational.

2️⃣ Context Paragraph
- 2–4 lines explaining why this topic matters in AI/ML.
- Relate it to real-world applications.
- Make it relevant to ${eventName}.

3️⃣ Official Presentation Line

The AIML Club, APSIT proudly presents:

🎯 ${eventName} 🎯

4️⃣ Mentors Section

👨‍💻 Meet Your Mentors:
${formattedSpeakers}

5️⃣ Event Details Section

📅 Date: ${formatDate(eventDate)}
⏰ Time: ${eventStartTime}
📍 Venue: ${eventVenue}

6️⃣ What You’ll Learn

✨ What You’ll Learn:
🔹 4–5 strong, practical learning outcomes
- Tailored specifically to ${eventName}
- Mention tools, concepts, evolution, or applications where relevant
- Keep them value-driven

7️⃣ Why Should You Attend?

💡 Why Should You Attend?
- 3–4 relatable beginner questions or struggles
- Make them emotionally engaging
- Use emojis naturally
- Tailored specifically to ${eventName}

8️⃣ Closing Statement
- One strong motivational line encouraging participation
- Make it feel like a step forward in their AI journey

Formatting Rules:
- Maintain clean spacing between sections
- Keep paragraphs short
- Do not overuse emojis
- Avoid robotic or corporate tone
- Keep it suitable for AIML college students
- Output should be ready to send on WhatsApp or Discord
- Stick to the format, don't number the sections with 1, 2, 3 etc. 

Do NOT:
- Add extra sections
- Change structure
- Repeat generic phrases
- Add filler text
`;

    // Call backend API to generate WhatsApp invite content with detailed specifications
    const aiContent = await generateTextBackend("whatsapp invite", formData);

    return (
        aiContent ||
        `
THERE WAS AN ERROR WHILE GENERATING CONTENT WITH AI, FALLBACK DEFAULT TEMPLATE:

🎉 AIML Club Invite 🎉

Event: ${toSentence(eventName, "Club Meetup")}
📅 Date: ${eventDate || "Date TBA"}
⏰ Time: ${toSentence(eventStartTime, "Time TBA")}
📍 Venue: ${toSentence(eventVenue, "Venue TBA")}

Join us for an unforgettable experience!
Reply with ✋ to confirm your attendance. Bring a friend! 👋
`
    );
};

export const generateWhatsAppPostEvent = async (formData) => {
    const { eventName, eventFlow } = formData;

    // Call backend API to generate WhatsApp post-event content
    const aiContent = await generateTextBackend("whatsapp post event", formData);

    return (
        aiContent ||
        `🙌 Thanks for joining!

Event: ${toSentence(eventName, "AIML Club Session")}

Highlights:
${toSentence(eventFlow, "Add highlights")}

We hope you had an amazing time! Stay tuned for upcoming events. 🚀

Thanks for being part of the AIML Club community! ❤️`
    );
};

export const generateInstagramPostEvent = async (formData) => {
    const { eventName, eventDate, eventFlow } = formData;

    // Call backend API to generate Instagram post-event content
    const aiContent = await generateTextBackend("instagram post event", formData);

    return (
        aiContent ||
        `✨ ${toSentence(eventName, "AIML Club Event")} Recap ✨

📅 Held on: ${eventDate || "the recent event"}

What went down:
${toSentence(eventFlow, "Amazing highlights and key moments!")}

Grateful to everyone who joined and made it incredible. Stay tuned for what's next! 🚀

#AIMLClub #Recap #Community`
    );
};

export const downloadWord = async (docxDoc, fileName) => {
    const blob = await Packer.toBlob(docxDoc);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
