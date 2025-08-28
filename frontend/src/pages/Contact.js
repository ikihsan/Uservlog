import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Simulate form submission (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the form data to your backend
      // const response = await contactAPI.sendMessage(formData);
      
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">Get in Touch</h1>
        <p className="section-subtitle">
          Have a question, suggestion, or just want to say hello? I'd love to hear from you!
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          marginBottom: '60px'
        }}>
          <div className="card">
            <h3 style={{ color: '#e2e8f0', marginBottom: '16px' }}>💬 Let's Chat</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>
              Whether you have feedback on my content, collaboration ideas, or just want to 
              connect, I'm always excited to hear from my readers and fellow creators.
            </p>
          </div>

          <div className="card">
            <h3 style={{ color: '#e2e8f0', marginBottom: '16px' }}>📱 Social Media</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '16px' }}>
              Follow me on social media for updates and behind-the-scenes content.
            </p>
            <a 
              href="https://www.instagram.com/fathma.nk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              style={{ display: 'inline-block' }}
            >
              📸 @fathma.nk
            </a>
          </div>

          <div className="card">
            <h3 style={{ color: '#e2e8f0', marginBottom: '16px' }}>⚡ Quick Response</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>
              I typically respond to messages within 24-48 hours. For urgent matters, 
              feel free to reach out via social media.
            </p>
          </div>
        </div>

        <div className="contact-form">
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '32px',
            color: '#e2e8f0'
          }}>
            Send Me a Message
          </h2>

          {success && (
            <div className="success-message">
              <strong>Message sent successfully!</strong><br />
              Thank you for reaching out. I'll get back to you soon!
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject" className="form-label">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="What's this about?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="form-textarea"
                required
                placeholder="Tell me more about what's on your mind..."
                rows="6"
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button 
                type="submit" 
                className="glow-button"
                disabled={loading}
                style={{ 
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  minWidth: '150px'
                }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '32px',
            padding: '24px',
            background: 'rgba(99, 102, 241, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              <strong>Note:</strong> All form submissions are handled securely. 
              Your information will never be shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
