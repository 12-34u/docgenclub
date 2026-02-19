import { useRef, useState } from "react";
import "./App.css";
import "./generated-output.css";
import {
    generateNotice,
    generateReport,
    generateInstagramContent,
    generateInstagramPostEvent,
    generateLinkedInContent,
    generateWhatsAppInvite,
    generateWhatsAppPostEvent,
    downloadWord,
} from "./documentGenerator";
import { useFormStore } from "./formStore";

const brandRow = ["Notices", "Reports", "LinkedIn", "Instagram", "WhatsApp"];

const docTypes = [
    "Instagram",
    "Instagram Post Event",
    "LinkedIn",
    "Report",
    "Notice",
    "Whatsapp Invite",
    "Whatsapp Post Event",
];

const socialGenerators = {
    Instagram: generateInstagramContent,
    "Instagram Post Event": generateInstagramPostEvent,
    LinkedIn: generateLinkedInContent,
    "Whatsapp Invite": generateWhatsAppInvite,
    "Whatsapp Post Event": generateWhatsAppPostEvent,
};

/**
 * Calculates duration string from "HH:MM" start and end time strings.
 * Returns something like "2 hours 30 minutes" or "45 minutes".
 */
function calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return "";
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    let totalMinutes = endH * 60 + endM - (startH * 60 + startM);
    if (totalMinutes <= 0) return "";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    if (minutes === 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`;
}

function App() {
    const [showForm, setShowForm] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null);

    // Zustand persisted store
    const { formData, setFormData, resetFormData } = useFormStore();

    // Set your hosted header/footer logo URLs here
    const logoAssets = {
        headerLogoUrl: "/header-logo.png",
        footerLogoUrl: "/footer-logo.png",
    };

    const formRef = useRef(null);

    const handleStart = () => {
        setShowForm(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
    };

    const getSocialContent = async (type) => {
        const fallback = socialGenerators[type];
        if (!fallback) throw new Error("Unsupported social doc type");
        // Pass formData enriched with computed duration
        return fallback({
            ...formData,
            eventDuration: calculateDuration(
                formData.eventStartTime,
                formData.eventEndTime,
            ),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { docType, eventName } = formData;
        const enrichedData = {
            ...formData,
            eventDuration: calculateDuration(
                formData.eventStartTime,
                formData.eventEndTime,
            ),
        };

        try {
            if (docType === "Notice") {
                const doc = await generateNotice(enrichedData, logoAssets);
                await downloadWord(doc, `${eventName || "Event"}_Notice.docx`);
                setGeneratedContent({
                    type: "notice",
                    message: `✅ Notice document for "${eventName}" has been generated and downloaded!`,
                });
            } else if (docType === "Report") {
                const doc = await generateReport(enrichedData, logoAssets);
                await downloadWord(doc, `${eventName || "Event"}_Report.docx`);
                setGeneratedContent({
                    type: "report",
                    message: `✅ Report document for "${eventName}" has been generated and downloaded!`,
                });
            } else if (socialGenerators[docType]) {
                const content = await getSocialContent(docType);
                setGeneratedContent({
                    type: "social",
                    content,
                    platform: docType,
                });
            }
        } catch (error) {
            setGeneratedContent({
                type: "error",
                message: `Error generating content: ${error.message}`,
            });
        }
    };

    const computedDuration = calculateDuration(
        formData.eventStartTime,
        formData.eventEndTime,
    );

    return (
        <div className="page">
            <header className="topbar">
                <div>
                    {/* <nav className="nav">
            {navLinks.map((item) => (
              <a key={item} href="#" className="nav-link">
                {item}
              </a>
            ))}
          </nav> */}
                </div>
                <div className="brand">
                    <span className="brand-name">Equinox</span>
                </div>
                <div>
                    {/* <div className="nav-actions">
            <button className="btn ghost">Log in</button>
            <button className="btn primary">Contact us</button>
          </div> */}
                </div>
            </header>

            <main>
                <section className="hero">
                    <div className="hero-copy">
                        <h1>
                            AIML CLUB DOCUMENT GENERATOR
                            <br />
                            Exclusively for <span className="accent-script">AIML CLUB</span>
                        </h1>
                        <p className="lede">
                            One Place for All sorts of documents related to AIML CLUB
                            including Event Notices, Minutes Of Meeting, LinkedIn, Instagram,
                            WhatsApp Messages and Event Reports.
                        </p>
                        <div className="hero-actions">
                            <button className="btn solid" onClick={handleStart}>
                                Get started
                            </button>
                        </div>
                    </div>
                    <div className="hero-visual" aria-hidden>
                        <div className="glass-shape" />
                        <div className="glow ring" />
                        <div className="glow sweep" />
                    </div>
                </section>

                {showForm && (
                    <section className="intake" id="intake" ref={formRef}>
                        <div className="section-heading">
                            <div className="pill">Generate your document</div>
                            <h2>
                                Provide event details for{" "}
                                <span className="accent-script">AIML CLUB</span>
                            </h2>
                            <p className="lede">
                                Fill out the essentials and pick the document type. We will
                                craft the right copy tailored to your channel.
                            </p>
                        </div>

                        {generatedContent && (
                            <div className={`generated-output ${generatedContent.type}`}>
                                {generatedContent.type === "error" && (
                                    <div className="output-message error">
                                        ❌ {generatedContent.message}
                                    </div>
                                )}
                                {generatedContent.type === "notice" && (
                                    <div className="output-message success">
                                        ✅ {generatedContent.message}
                                    </div>
                                )}
                                {generatedContent.type === "report" && (
                                    <div className="output-message success">
                                        ✅ {generatedContent.message}
                                    </div>
                                )}
                                {generatedContent.type === "social" && (
                                    <div className="social-content">
                                        <div className="output-header">
                                            <h3>{generatedContent.platform} Content</h3>
                                            <button
                                                type="button"
                                                className="btn ghost"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        generatedContent.content,
                                                    );
                                                    alert("Content copied to clipboard!");
                                                }}
                                            >
                                                Copy to clipboard
                                            </button>
                                        </div>
                                        <div className="content-box">
                                            <p>{generatedContent.content}</p>
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="btn ghost"
                                    onClick={() => {
                                        setGeneratedContent(null);
                                        // NOTE: We intentionally do NOT reset formData here,
                                        // so the user's inputs persist for generating another doc.
                                    }}
                                >
                                    ← Generate another
                                </button>
                                <button
                                    type="button"
                                    className="btn ghost"
                                    style={{ marginLeft: "8px" }}
                                    onClick={() => {
                                        setGeneratedContent(null);
                                        resetFormData();
                                    }}
                                >
                                    ✕ Start fresh
                                </button>
                            </div>
                        )}

                        {!generatedContent && (
                            <form className="intake-form" onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <label className="field">
                                        <span>Event Name</span>
                                        <input
                                            name="eventName"
                                            value={formData.eventName}
                                            onChange={handleChange}
                                            placeholder="e.g., AI Innovators Summit"
                                            required
                                        />
                                    </label>
                                    <label className="field">
                                        <span>Event Date</span>
                                        <input
                                            type="date"
                                            name="eventDate"
                                            value={formData.eventDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>
                                    <label className="field">
                                        <span>Event Start Time</span>
                                        <input
                                            type="time"
                                            name="eventStartTime"
                                            value={formData.eventStartTime}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>
                                    <label className="field">
                                        <span>Event End Time</span>
                                        <input
                                            type="time"
                                            name="eventEndTime"
                                            value={formData.eventEndTime}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>
                                    <label className="field">
                                        <span>Event Venue</span>
                                        <input
                                            name="eventVenue"
                                            value={formData.eventVenue}
                                            onChange={handleChange}
                                            placeholder="e.g., Auditorium / Lab 406"
                                            required
                                        />
                                    </label>
                                    {/* Duration is now auto-calculated — shown as read-only hint */}
                                    {computedDuration && (
                                        <label className="field">
                                            <span>Duration (auto-calculated)</span>
                                            <input
                                                value={computedDuration}
                                                readOnly
                                                style={{ opacity: 0.6, cursor: "not-allowed" }}
                                            />
                                        </label>
                                    )}
                                    <label className="field">
                                        <span>Document Type</span>
                                        <select
                                            name="docType"
                                            value={formData.docType}
                                            onChange={handleChange}
                                        >
                                            {docTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <label className="field">
                                    <span>Event Flow</span>
                                    <textarea
                                        name="eventFlow"
                                        value={formData.eventFlow}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Agenda, key moments, bullet points"
                                        required
                                    />
                                </label>

                                <div className="form-actions">
                                    <button type="submit" className="btn solid">
                                        Generate document
                                    </button>
                                    <button
                                        type="button"
                                        className="btn ghost"
                                        onClick={() =>
                                            window.scrollTo({ top: 0, behavior: "smooth" })
                                        }
                                    >
                                        Back to top
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                )}

                <section className="brand-strip">
                    <span className="muted">Documents we provide</span>
                    <div className="brand-row">
                        {brandRow.map((name, idx) => (
                            <span key={`${name}-${idx}`} className="brand-pill">
                                {name}
                            </span>
                        ))}
                    </div>
                </section>

                <section className="features">
                    <div className="section-heading">
                        <div className="pill">Why choose Equinox</div>
                        <h2>
                            Made for and by <span className="accent-script">AIML CLUB</span>
                        </h2>
                        <p className="lede">
                            We provide the tools and insights you need to speed up your work
                            and efficiency. Here is how we help you hit your goals.
                        </p>
                    </div>

                    <div className="cta-row" />
                </section>
            </main>
        </div>
    );
}

export default App;
