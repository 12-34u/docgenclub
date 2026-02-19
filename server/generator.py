import os
from datetime import datetime
from typing import Dict
import google.generativeai as genai

api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyAg9EtATj_R6EwX_3DL3ZhEJRDUlp0KLRc")
genai.configure(api_key=api_key)


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
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
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

    prompt = f"""
Generate a professional event report for the AIML Club in plain text format (no markdown).

Event Details:
- Event Name: {event_name}
- Date: {event_date}
- Time: {start} - {end}
- Venue: {venue}
- Duration: {duration}
- Agenda/Flow: {flow}

Create a structured report with the following sections:
1. Executive Summary: Brief overview of the event and its significance
2. Agenda Highlights: Key points and activities covered
3. Key Outcomes: Learning objectives achieved and participant feedback
4. Next Steps: Follow-up actions and improvements

Write it in a formal, professional tone suitable for AIML Club documentation.
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

    prompt = f"""
Generate a formal notice for AIML Club event announcement in plain text format.

Event Details:
- Event Title: {event_name}
- Date: {event_date}
- Time: {start} - {end}
- Duration: {duration}
- Venue: {venue}
- Agenda: {flow}

Create a professional notice with:
1. Clear title: "NOTICE: {event_name}"
2. Introduction to all members
3. Detailed event information (date, time, venue, duration)
4. What to expect / Agenda details
5. Call to action for attendance
6. Contact information for queries

Write in formal, professional tone.
"""
    return _call_gemini(prompt)


def _generate_instagram_pre(form: Dict) -> str:
    event_name = _to_sentence(form.get("eventName"), "AIML Club Event")
    event_date = form.get("eventDate") or "Date soon"
    start = _to_sentence(form.get("eventStartTime"), "")
    end = _to_sentence(form.get("eventEndTime"), "")
    venue = _to_sentence(form.get("eventVenue"), "Venue TBA")
    flow = _parse_flow(form.get("eventFlow", ""))

    time_str = f"{start} - {end}" if start and end else start or "Time TBA"

    prompt = f"""
Generate an engaging Instagram pre-event announcement post for AIML Club. Keep it under 200 words.

Event Details:
- Event: {event_name}
- Date: {event_date}
- Time: {time_str}
- Venue: {venue}
- What's happening: {flow}

Create a catchy, Instagram-friendly post with:
1. Hook/Attention-grabber
2. Key details (date, time, venue)
3. What attendees will learn/experience
4. Call to action (save date, bring friends, RSVP link mention)
5. 2-3 relevant hashtags

Use emojis naturally to make it visually appealing and engaging for social media.
"""
    return _call_gemini(prompt)


def _generate_instagram_post(form: Dict) -> str:
    event_name = _to_sentence(form.get("eventName"), "AIML Club Event")
    event_date = form.get("eventDate") or "the recent event"
    flow = _parse_flow(form.get("eventFlow", ""))

    prompt = f"""
Generate an Instagram post-event recap/celebration post for AIML Club. Keep it under 180 words.

Event Details:
- Event: {event_name}
- Date: {event_date}
- Highlights: {flow}

Create a celebratory, engaging post with:
1. Excitement/gratitude hook
2. Event recap and key highlights
3. Participant impact/outcomes
4. Thank you to attendees
5. Teaser for next event
6. 2-3 relevant hashtags

Use celebratory emojis and energy to keep the community engaged.
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

    prompt = f"""
Generate a friendly, concise WhatsApp invitation message for AIML Club event. Keep it under 100 words.

Event Details:
- Event: {event_name}
- Date: {event_date}
- Time: {start}
- Venue: {venue}

Create a casual, friendly WhatsApp message with:
1. Fun hook
2. Event details (date, time, venue)
3. Why they should come
4. Request to confirm attendance (emoji response like ✋)
5. Suggestion to bring friends

Use WhatsApp-friendly emojis and casual tone. Make it feel like a group chat invite.
"""
    return _call_gemini(prompt)


def _generate_whatsapp_post(form: Dict) -> str:
    event_name = _to_sentence(form.get("eventName"), "AIML Club Session")
    flow = _parse_flow(form.get("eventFlow", ""))

    prompt = f"""
Generate a friendly WhatsApp thank-you/recap message for AIML Club post-event. Keep it under 100 words.

Event Details:
- Event: {event_name}
- Highlights: {flow}

Create a warm, celebratory WhatsApp message with:
1. Gratitude and celebration tone
2. Event highlights recap
3. Appreciation for attendees
4. Teaser for next event
5. Keep everyone engaged

Use celebratory emojis and friendly tone. Should feel like a group appreciation message.
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
    return generators[key](form or {})
