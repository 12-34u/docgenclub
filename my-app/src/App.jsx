import { useRef, useState } from 'react'
import './App.css'
import './generated-output.css'
import {
  generateNotice,
  generateReport,
  generateInstagramContent,
  generateInstagramPostEvent,
  generateLinkedInContent,
  generateWhatsAppInvite,
  generateWhatsAppPostEvent,
  downloadWord,
} from './documentGenerator'
const navLinks = ['About', 'Pricing', 'Roadmap', 'Blog']

const highlights = [
  { label: '4-6 week delivery' },
  { label: 'Transparent pricing' },
  { label: 'Money back guarantee' },
]

const brandRow = ['Notices', 'Reports', 'LinkedIn', 'Instagram', 'WhatsApp']

const features = [
  {
    title: 'Seamless Integration',
    body: 'Easily plug into your existing systems and workflows to reduce downtime and keep teams aligned.',
    icon: '⤴',
  },
  {
    title: 'Enhanced Productivity',
    body: 'Automate repetitive tasks and streamline processes so you can focus on what drives growth.',
    icon: '✦',
  },
  {
    title: 'Superior Support',
    body: 'Access dedicated experts 24/7 to resolve issues quickly and keep your operations running.',
    icon: '☺',
  },
]

const docTypes = ['Instagram', 'Instagram Post Event', 'LinkedIn', 'Report', 'Notice', 'Whatsapp Invite', 'Whatsapp Post Event']

function App() {
  const [showForm, setShowForm] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventVenue: '',
    eventStartTime: '',
    eventEndTime: '',
    eventDuration: '',
    eventFlow: '',
    docType: docTypes[0],
  })

  // Set your hosted header/footer logo URLs here (e.g., place files in public/ and use '/header.png')
  const logoAssets = {
    headerLogoUrl: '/header-logo.png',
    footerLogoUrl: '/footer-logo.png',
  }

  const formRef = useRef(null)

  const handleStart = () => {
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { docType, eventName } = formData

    try {
      if (docType === 'Notice') {
        const doc = await generateNotice(formData, logoAssets)
        await downloadWord(doc, `${eventName || 'Event'}_Notice.docx`)
        setGeneratedContent({
          type: 'notice',
          message: `✅ Notice document for "${eventName}" has been generated and downloaded!`,
        })
      } else if (docType === 'Report') {
        const doc = await generateReport(formData, logoAssets)
        await downloadWord(doc, `${eventName || 'Event'}_Report.docx`)
        setGeneratedContent({
          type: 'report',
          message: `✅ Report document for "${eventName}" has been generated and downloaded!`,
        })
      } else if (docType === 'Instagram') {
        const content = generateInstagramContent(formData)
        setGeneratedContent({
          type: 'social',
          content,
          platform: 'Instagram',
        })
      } else if (docType === 'Instagram Post Event') {
        const content = generateInstagramPostEvent(formData)
        setGeneratedContent({
          type: 'social',
          content,
          platform: 'Instagram Post Event',
        })
      } else if (docType === 'LinkedIn') {
        const content = generateLinkedInContent(formData)
        setGeneratedContent({
          type: 'social',
          content,
          platform: 'LinkedIn',
        })
      } else if (docType === 'Whatsapp Invite') {
        const content = generateWhatsAppInvite(formData)
        setGeneratedContent({
          type: 'social',
          content,
          platform: 'WhatsApp Invite',
        })
      } else if (docType === 'Whatsapp Post Event') {
        const content = generateWhatsAppPostEvent(formData)
        setGeneratedContent({
          type: 'social',
          content,
          platform: 'WhatsApp Post Event',
        })
      }
    } catch (error) {
      setGeneratedContent({
        type: 'error',
        message: `Error generating content: ${error.message}`,
      })
    }
  }

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
            {/* <div className="pill pill-new">
              <span className="pill-dot" />
              New — We made our pricing public
            </div> */}
            <h1>
              AIML CLUB DOCUMENT GENERATOR
              <br />
              Exclusively for <span className="accent-script">AIML CLUB</span>
            </h1>
            <p className="lede">
              One Place for All sorts of documents related to AIML CLUB including Event Notices, Minutes Of Meeting, LinkedIn,    Instagram, WhatsApp Messages and
              Event Reports.
            </p>
            <div className="hero-actions">
              <button className="btn solid" onClick={handleStart}>Get started</button>
              {/* <button className="btn link">Request a demo →</button> */}
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
                Provide event details for <span className="accent-script">AIML CLUB</span>
              </h2>
              <p className="lede">
                Fill out the essentials and pick the document type. We will craft the right copy tailored to your channel.
              </p>
            </div>

            {generatedContent && (
              <div className={`generated-output ${generatedContent.type}`}>
                {generatedContent.type === 'error' && (
                  <div className="output-message error">❌ {generatedContent.message}</div>
                )}
                {generatedContent.type === 'notice' && (
                  <div className="output-message success">✅ {generatedContent.message}</div>
                )}
                {generatedContent.type === 'report' && (
                  <div className="output-message success">✅ {generatedContent.message}</div>
                )}
                {generatedContent.type === 'social' && (
                  <div className="social-content">
                    <div className="output-header">
                      <h3>{generatedContent.platform} Content</h3>
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedContent.content)
                          alert('Content copied to clipboard!')
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
                    setGeneratedContent(null)
                    setFormData({
                      eventName: '',
                      eventDate: '',
                      eventStartTime: '',
                      eventEndTime: '',
                      eventDuration: '',
                      eventFlow: '',
                      docType: docTypes[0],
                    })
                  }}
                >
                  ← Start over
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
                    <span>Event Venue</span>
                    <input
                      name="eventVenue"
                      value={formData.eventVenue}
                      onChange={handleChange}
                      placeholder="e.g., Auditorium / Lab 406"
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
                    <span>Event Duration</span>
                    <input
                      name="eventDuration"
                      value={formData.eventDuration}
                      onChange={handleChange}
                      placeholder="e.g., 3 hours"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Document Type</span>
                    <select name="docType" value={formData.docType} onChange={handleChange}>
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
                  <button type="button" className="btn ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
              We provide the tools and insights you need to speed up your work and efficiency. Here is how we help you hit your
              goals.
            </p>
          </div>

          {/* <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon" aria-hidden>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <a className="card-link" href="#">
                  Learn more →
                </a>
              </article>
            ))}
          </div> */}

          <div className="cta-row">
            {/* <button className="btn solid">Start your Experience</button> */}
            {/* <button className="btn ghost">More about our features →</button> */}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App

