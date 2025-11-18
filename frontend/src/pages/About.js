import React from 'react';
//Import your photo - you'll need to place your photo file in the assets/images folder
import profilePhoto from '../assets/images/lifevlog-profile.jpg';

const About = () => {
  return (
    <div className="section">
      <div className="container">
        <div className="about-content">
          <h1 className="section-title">About Me</h1>
          
          {/* Profile Photo */}
          <div className="profile-photo-container" style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '40px'
          }}>
            <div className="profile-photo" style={{
              width: '300px',
              height: '300px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 300 300\'%3E%3Ctext x=\'50%\' y=\'50%\' text-anchor=\'middle\' dominant-baseline=\'middle\' font-size=\'20\' fill=\'%2394a3b8\'%3EYour Photo Here%3C/text%3E%3C/svg%3E")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              { <img 
                src={profilePhoto} 
                alt="Lifevlog Author"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '18px'
                }}
              /> }
            </div>
          </div>
          
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <p style={{ 
              fontSize: '1.2rem', 
              color: '#94a3b8', 
              marginBottom: '32px',
              lineHeight: '1.7',
              textAlign: 'center'
            }}>
              Welcome to <span style={{ color: '#6366f1', fontWeight: '600' }}>Lifevlog</span>, 
              where I share my adventures in engineering, technology, and personal development.
            </p>

            <div className="card" style={{ textAlign: 'left', marginBottom: '32px' }}>
              <h3 style={{ color: '#e2e8f0', marginBottom: '16px' }}>Who I Am</h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '20px' }}>
                I'm a passionate engineering student exploring the intersection of technology and creativity. 
                Through this blog, I document my learning journey, share practical insights, and connect with 
                fellow tech enthusiasts who are shaping the future.
              </p>
              <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>
                My goal is to make complex technical concepts accessible and inspire others to pursue their 
                interests in STEM fields, regardless of their background or experience level.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'left', marginBottom: '32px' }}>
              <h3 style={{ color: '#e2e8f0', marginBottom: '16px' }}>My Interests</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginTop: '20px'
              }}>
                <div style={{ 
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔬</div>
                  <h4 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '1.1rem' }}>Research</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Exploring cutting-edge technologies</p>
                </div>
                <div style={{ 
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎨</div>
                  <h4 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '1.1rem' }}>Design</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>UI/UX and creative problem-solving</p>
                </div>
                <div style={{ 
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📈</div>
                  <h4 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '1.1rem' }}>Innovation</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Building solutions for tomorrow</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ textAlign: 'left', marginBottom: '32px' }}>
              <h3 style={{ color: '#e2e8f0', marginBottom: '16px' }}>What You'll Find Here</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '20px'
              }}>
                <div style={{ 
                  background: 'rgba(168, 85, 247, 0.1)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💻</div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Tech Tutorials</p>
                </div>
                <div style={{ 
                  background: 'rgba(168, 85, 247, 0.1)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📝</div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Project Updates</p>
                </div>
                <div style={{ 
                  background: 'rgba(168, 85, 247, 0.1)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤔</div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Thoughts & Reflections</p>
                </div>
                <div style={{ 
                  background: 'rgba(168, 85, 247, 0.1)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌍</div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Community Insights</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ textAlign: 'left', marginBottom: '32px' }}>
              <h3 style={{ color: '#e2e8f0', marginBottom: '16px' }}>Get In Touch</h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '20px' }}>
                I'm always excited to connect with like-minded individuals, discuss new ideas, 
                and collaborate on interesting projects. Whether you're a fellow student, 
                a tech professional, or just curious about technology, I'd love to hear from you!
              </p>
              
              <div className="social-links" style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <a 
                  href="https://www.instagram.com/lifevlog_temp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem'
                  }}
                >
                  📸 Instagram
                </a>
                <a 
                  href="/contact" 
                  className="social-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem'
                  }}
                >
                  ✉️ Contact Me
                </a>
              </div>
            </div>

            <div style={{ 
              textAlign: 'center',
              marginTop: '40px',
              padding: '20px',
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <p style={{ 
                color: '#94a3b8', 
                fontSize: '1rem',
                margin: '0'
              }}>
                "Innovation distinguishes between a leader and a follower." <br/>
                <span style={{ fontSize: '0.9rem', opacity: '0.8' }}>- Steve Jobs. Let's innovate together!</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
