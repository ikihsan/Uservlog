import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">fathi.vlogs</h3>
            <p className="footer-description">
              Personal blog sharing thoughts, experiences, and engineering journey.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/blogs">Blogs</a></li>
              <li><a href="/about">About Me</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Connect</h4>
            <ul className="footer-links">
              <li>
                <a 
                  href="https://www.instagram.com/fathma.nk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li><a href="/contact">Get in Touch</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} UserBlog. All rights reserved.</p>
          </div>
          <div className="footer-credits">
            <p>Built with ❤️ by <span className="credits-highlight">ikcodes</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
