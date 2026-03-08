import os
import json
import hashlib
from collections import OrderedDict
from datetime import datetime
from typing import Dict
import google.generativeai as genai

# Configure Gemini API
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

MODEL_NAME = "gemini-2.5-flash"
GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "max_output_tokens": 2048,
}

# Reuse model client across requests to reduce per-request setup overhead.
model = genai.GenerativeModel(MODEL_NAME) if api_key else None

# Small in-memory cache for repeated prompts from same form inputs.
CACHE_MAX_ITEMS = 100
response_cache = OrderedDict()


def _make_cache_key(doc_type: str, form: Dict) -> str:
    payload = json.dumps(
        {"docType": doc_type, "formData": form or {}},
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _cache_get(key: str):
    value = response_cache.get(key)
    if value is not None:
        response_cache.move_to_end(key)
    return value


def _cache_set(key: str, value: str) -> None:
    response_cache[key] = value
    response_cache.move_to_end(key)
    while len(response_cache) > CACHE_MAX_ITEMS:
        response_cache.popitem(last=False)


def _to_sentence(value: str, fallback: str = "") -> str:
    return value.strip() if value and value.strip() else fallback


def _parse_flow(flow: str = "") -> str:
    """Extract and normalize agenda/flow points."""
    if not flow or not flow.strip():
        return "Add agenda or key points"
    return flow.strip()


def _format_date(date_str: str) -> str:
    if not date_str:
        return "Add date"
    try:
        dt = datetime.fromisoformat(date_str)
        return dt.strftime("%A, %B %d, %Y")
    except ValueError:
        return date_str


def _call_gemini(prompt: str) -> str:
    """Call Gemini API with a prompt and return generated text."""
    if not api_key:
        return (
            "[Configuration error: GEMINI_API_KEY is not set. "
            "Add it to server/.env and restart the backend.]"
        )

    try:
        response = model.generate_content(prompt, generation_config=GENERATION_CONFIG)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API error: {e}")
        return f"[Error generating content: {str(e)}]"


def _generate_report(form: Dict) -> str:
    event_name = _to_sentence(form.get("eventName"), "Add event name")
    event_date = _format_date(form.get("eventDate"))
    venue = _to_sentence(form.get("eventVenue"), "Add venue")
    start = _to_sentence(form.get("eventStartTime"), "Add start")
    end = _to_sentence(form.get("eventEndTime"), "Add end")
    duration = _to_sentence(form.get("eventDuration"), "Add duration")
    flow = _parse_flow(form.get("eventFlow", ""))
    
    # Handle speakers if available
    speakers = form.get("speakers", [])
    speaker_section = ""
    if speakers and len(speakers) > 0:
        speaker_list = "\n".join([
            f"- {s.get('name', 'Mentor Name')} ({s.get('designation', 'Role')})"
            for s in speakers
        ])
        speaker_section = f"\n\nSpeakers/Mentors:\n{speaker_list}"

    prompt = f"""
Generate a comprehensive professional event report for the AIML Club in plain text format (no markdown).

Event Details:
- Event Name: {event_name}
- Date: {event_date}
- Time: {start} - {end}
- Venue: {venue}
- Duration: {duration}
- Agenda/Flow: {flow}{speaker_section}

Create a well-structured, detailed report with the following sections:

1. EXECUTIVE SUMMARY (2-3 paragraphs)
   - Brief overview of the event and its significance to the AIML Club
   - Number of participants (use realistic estimate based on type of event)
   - Primary objectives achieved

2. EVENT OVERVIEW
   - Date, time, venue, duration (formatted nicely)
   - Target audience
   - Event format (workshop, seminar, hands-on, etc.)

3. AGENDA HIGHLIGHTS (Based on: {flow})
   - Break down the agenda into key segments
   - Describe activities and topics in each segment
   - Mention hands-on components, demos, or activities

4. KEY OUTCOMES AND LEARNINGS
   - Main concepts/skills participants gained
   - Practical applications covered
   - Tools or technologies introduced
   - Interactive elements and their impact

5. PARTICIPANT FEEDBACK (Simulate realistic feedback)
   - Positive aspects participants appreciated
   - Areas of interest that generated most engagement
   - Questions and discussions that emerged

6. NEXT STEPS AND RECOMMENDATIONS
   - Follow-up actions for participants
   - Ideas for improvement in future events
   - Suggested advanced topics or sequel sessions

Write in a formal, professional tone suitable for club documentation and reports to faculty advisors.
Use proper formatting with clear section headers.
Make it comprehensive but concise - around 400-600 words total.
"""
    return _call_gemini(prompt)


def _generate_notice(form: Dict) -> str:
    event_name = _to_sentence(form.get("eventName"), "Upcoming Event")
    event_date = _format_date(form.get("eventDate"))
    start = _to_sentence(form.get("eventStartTime"), "Add start")
    end = _to_sentence(form.get("eventEndTime"), "Add end")
    venue = _to_sentence(form.get("eventVenue"), "Add venue")
    duration = _to_sentence(form.get("eventDuration"), "Add duration")
    flow = _parse_flow(form.get("eventFlow", ""))
    
    # Handle speakers if available
    speakers = form.get("speakers", [])
    speaker_section = ""
    if speakers and len(speakers) > 0:
        speaker_list = "\n".join([
            f"- {s.get('name', 'Mentor Name')} ({s.get('designation', 'Role')})"
            for s in speakers
        ])
        speaker_section = f"\n- Speakers/Mentors:\n{speaker_list}"

    prompt = f"""
Generate a formal, professional notice for AIML Club event announcement in plain text format (no markdown).

Event Details:
- Event Title: {event_name}
- Date: {event_date}
- Time: {start} - {end}
- Duration: {duration}
- Venue: {venue}
- Agenda: {flow}{speaker_section}

Create a formal notice document with this structure:

TITLE: NOTICE - {event_name}

Opening: Professional greeting to all AIML Club members

BODY:
1. Announcement of the event with purpose statement
2. EVENT DETAILS section with:
   - Event Name: {event_name}
   - Date: {event_date}
   - Time: {start} - {end}
   - Duration: {duration}
   - Venue: {venue}
   {speaker_section if speaker_section else ""}

3. ABOUT THE EVENT:
   - Brief description of what the event entails
   - Key topics/activities (based on: {flow})
   - Learning outcomes participants can expect

4. WHO SHOULD ATTEND:
   - Target audience within the club
   - Prerequisites if any

5. CALL TO ACTION:
   - Request for attendance
   - RSVP or registration instructions
   - Contact information for queries

CLOSING:
- Professional closing statement
- Signature: "AIML Club, APSIT"

Write in formal, official tone suitable for institutional notices.
Use proper formatting with clear section headers in CAPS.
Keep it professional but welcoming.
"""
    return _call_gemini(prompt)


def _generate_instagram_pre(form: Dict) -> str:
    event_name = _to_sentence(form.get("eventName"), "AIML Club Event")
    event_date = form.get("eventDate") or "Date soon"
    start = _to_sentence(form.get("eventStartTime"), "")
    end = _to_sentence(form.get("eventEndTime"), "")
    venue = _to_sentence(form.get("eventVenue"), "Venue TBA")
    flow = _parse_flow(form.get("eventFlow", ""))
    
    # Handle speakers if available
    speakers = form.get("speakers", [])
    speaker_mention = ""
    if speakers and len(speakers) > 0:
        speaker_names = ", ".join([s.get('name', 'Expert') for s in speakers])
        speaker_mention = f"\n\n🎤 Featuring: {speaker_names}"

    time_str = f"{start} - {end}" if start and end else start or "Time TBA"

    prompt = f"""
Generate an engaging, eye-catching Instagram pre-event announcement post for AIML Club. Keep it under 200 words.

Event Details:
- Event: {event_name}
- Date: {event_date}
- Time: {time_str}
- Venue: {venue}
- What's happening: {flow}{speaker_mention}

Create a catchy, Instagram-friendly post with:

1. HOOK (1-2 lines):
   - Start with an attention-grabbing opener 
   - Use excitement and energy
   - Make them want to read more

2. EVENT INFO:
   📅 Date: {event_date}
   ⏰ Time: {time_str}
   📍 Venue: {venue}{speaker_mention if speaker_mention else ""}

3. WHAT TO EXPECT:
   - Highlight the coolest aspects of {event_name}
   - Make {flow} sound exciting and valuable
   - Focus on benefits and takeaways
   - Use bullet points with emojis (🔹, ✨, 🚀, etc.)

4. CALL TO ACTION:
   - Make it urgent and engaging
   - Encourage saves, shares, bringing friends
   - Create FOMO

5. HASHTAGS:
   - Add 3-5 relevant hashtags
   - Mix specific (#AIMLClub, #APSIT) with general (#MachineLearning, #TechEvent)

Style:
- Use emojis naturally (don't overdo it)
- Keep sentences short and punchy
- Make it visually scannable
- Energetic and youth-oriented tone
- Perfect for Gen Z audience
"""
    return _call_gemini(prompt)


def _generate_instagram_post(form: Dict) -> str:
    event_name = _to_sentence(form.get("eventName"), "AIML Club Event")
    event_date = form.get("eventDate") or "the recent event"
    flow = _parse_flow(form.get("eventFlow", ""))
    
    # Handle speakers if available
    speakers = form.get("speakers", [])
    speaker_thanks = ""
    if speakers and len(speakers) > 0:
        speaker_names = ", ".join([s.get('name', 'Expert') for s in speakers])
        speaker_thanks = f"\n\n🙏 Special thanks to {speaker_names} for sharing their expertise!"

    prompt = f"""
Generate an Instagram post-event recap/celebration post for AIML Club. Keep it under 200 words.

Event Details:
- Event: {event_name}
- Date: {event_date}
- Highlights: {flow}{speaker_thanks}

Create a celebratory, engaging recap post with:

1. EXCITEMENT HOOK:
   - Start with energy and gratitude
   - Make it clear this was a success
   - Use celebratory emojis (🎉, ✨, 🔥, etc.)

2. EVENT RECAP:
   - Mention what {event_name} was about
   - Highlight key moments from {flow}
   - Use 2-3 bullet points with emojis for highlights
   - Make people who attended feel good
   - Make people who missed it feel FOMO

3. IMPACT STATEMENT:
   - What did participants gain?
   - Skills learned, connections made, knowledge acquired
   - Community celebration{speaker_thanks if speaker_thanks else ""}

4. GRATITUDE:
   - Thank attendees for their energy
   - Acknowledge engagement and participation

5. FORWARD LOOKING:
   - Tease what's coming next
   - Encourage following for updates

6. HASHTAGS:
   - Add 3-5 relevant hashtags
   - Include #AIMLClub #APSIT and event-specific tags

Style:
- High energy and celebration vibes
- Visual and emoji-enhanced
- Make the community feel connected
- Youth-oriented and authentic
"""
    return _call_gemini(prompt)


def _generate_linkedin(form: Dict) -> str:
    event_name = _to_sentence(form.get("eventName"), "an AIML Club session")
    event_date = _format_date(form.get("eventDate"))
    start = _to_sentence(form.get("eventStartTime"), "Add start")
    end = _to_sentence(form.get("eventEndTime"), "Add end")
    flow = _parse_flow(form.get("eventFlow", ""))

    prompt = f"""
Generate a professional LinkedIn event announcement post for AIML Club. Keep it under 250 words.

Event Details:
- Event: {event_name}
- Date: {event_date}
- Time: {start} - {end}
- What to expect: {flow}

Create a professional LinkedIn post with:
1. Strong opening about professional/skill development value
2. Event details (date, time)
3. Key learning areas and outcomes
4. Who should attend (target audience)
5. Call to action (register, learn more)
6. 3-4 relevant professional hashtags (#AIML, #Learning, etc.)

Keep a professional, inspiring tone suitable for career development audience.
"""
    return _call_gemini(prompt)


def _generate_whatsapp_invite(form: Dict) -> str:
    event_name = _to_sentence(form.get("eventName"), "Club Meetup")
    event_date = form.get("eventDate") or "Date TBA"
    start = _to_sentence(form.get("eventStartTime"), "Time TBA")
    venue = _to_sentence(form.get("eventVenue"), "Venue TBA")
    flow = _parse_flow(form.get("eventFlow", ""))
    
    # Handle speakers formatting
    speakers = form.get("speakers", [])
    if speakers and len(speakers) > 0:
        formatted_speakers = "\n".join([
            f"🌟 {s.get('name', 'Mentor Name')} ({s.get('designation', 'Role')})"
            for s in speakers
        ])
    else:
        formatted_speakers = "🌟 Mentor Name (Role)"

    prompt = f"""
You are the official content writer for AIML Club, APSIT.

Your job is to generate a high-energy, visually structured, and engaging event invitation announcement for an AIML Club event.

Event Details (MANDATORY — use exactly as provided):
- Event Title: {event_name}
- Date: {event_date}
- Time: {start}
- Venue: {venue}
- Mentor Names:
{formatted_speakers}
- Topics/Agenda: {flow}

Important:
- DO NOT modify the date, time, venue, or event title.
- DO NOT add placeholder mentors if actual names are provided.
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
- Make it relevant to {event_name}.

3️⃣ Official Presentation Line

The AIML Club, APSIT proudly presents:

🎯 {event_name} 🎯

4️⃣ Mentors Section

👨‍💻 Meet Your Mentors:
{formatted_speakers}

5️⃣ Event Details Section

📅 Date: {event_date}
⏰ Time: {start}
📍 Venue: {venue}

6️⃣ What You'll Learn

✨ What You'll Learn:
🔹 4–5 strong, practical learning outcomes
- Tailored specifically to {event_name} and {flow}
- Mention tools, concepts, evolution, or applications where relevant
- Keep them value-driven and actionable

7️⃣ Why Should You Attend?

💡 Why Should You Attend?
- 3–4 relatable beginner questions or struggles related to {event_name}
- Make them emotionally engaging
- Use emojis naturally
- Speak to the learner's journey

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
- DO NOT number the sections in output

Do NOT:
- Add extra sections
- Change structure
- Repeat generic phrases
- Add filler text
"""
    return _call_gemini(prompt)


def _generate_whatsapp_post(form: Dict) -> str:
    event_name = _to_sentence(form.get("eventName"), "AIML Club Session")
    flow = _parse_flow(form.get("eventFlow", ""))
    
    # Handle speakers if available
    speakers = form.get("speakers", [])
    speaker_thanks = ""
    if speakers and len(speakers) > 0:
        speaker_names = ", ".join([s.get('name', 'Expert') for s in speakers])
        speaker_thanks = f"\n\n🙏 Huge shoutout to {speaker_names}!"

    prompt = f"""
Generate a friendly, warm WhatsApp thank-you/recap message for AIML Club post-event. Keep it under 120 words.

Event Details:
- Event: {event_name}
- Highlights: {flow}{speaker_thanks}

Create a warm, celebratory WhatsApp message with:

1. GRATITUDE OPENING:
   - Thank participants energetically
   - Make them feel valued
   - Use celebratory emojis (🙌, 🎉, ❤️)

2. EVENT HIGHLIGHTS:
   - Quick recap of {event_name}
   - 2-3 key moments from {flow}
   - Keep it brief and exciting{speaker_thanks if speaker_thanks else ""}

3. COMMUNITY BUILDING:
   - Emphasize "we" and "together"
   - Make it feel like a collective achievement
   - Strengthen club identity

4. FORWARD LOOKING:
   - Tease next event
   - Keep excitement alive
   - Encourage staying connected

Style:
- Casual, friendly group-chat tone
- Warm and genuine
- Use emojis naturally (but not excessively)
- Make people smile
- Build anticipation
- Perfect for WhatsApp community groups
"""
    return _call_gemini(prompt)


generators = {
    "report": _generate_report,
    "notice": _generate_notice,
    "instagram": _generate_instagram_pre,
    "instagram post event": _generate_instagram_post,
    "linkedin": _generate_linkedin,
    "whatsapp invite": _generate_whatsapp_invite,
    "whatsapp post event": _generate_whatsapp_post,
}


supported_doc_types = list(generators.keys())


def generate_content(doc_type: str, form: Dict) -> str:
    if not doc_type:
        raise ValueError("docType is required")
    key = doc_type.lower()
    if key not in generators:
        raise ValueError(f"Unsupported docType: {doc_type}")

    normalized_form = form or {}
    cache_key = _make_cache_key(key, normalized_form)
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    content = generators[key](normalized_form)
    if not content.startswith("[Error generating content:") and not content.startswith(
        "[Configuration error:"
    ):
        _cache_set(cache_key, content)
    return content
