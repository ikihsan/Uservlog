# How to Add Your Profile Photo to Lifevlog

## Steps to add your profile photo:

1. **Save your photo file:**
   - Take the photo you provided and save it as `lifevlog-profile.jpg`
   - Place it in the folder: `d:\Ihsan project\graaaa\fath\frontend\src\assets\images\`

2. **Update the About.js file:**
   - Open: `d:\Ihsan project\graaaa\fath\frontend\src\pages\About.js`
   - Find line 2 and uncomment it:
     ```javascript
     import profilePhoto from '../assets/images/lifevlog-profile.jpg';
     ```
   - Find lines 25-34 and uncomment the img tag:
     ```javascript
     <img 
       src={profilePhoto} 
       alt="Lifevlog Author" 
       style={{
         width: '100%',
         height: '100%',
         objectFit: 'cover',
         borderRadius: '18px'
       }}
     />
     ```

3. **Save the file and the photo will appear on your About page!**

## Current Status:
✅ Application name changed to "Lifevlog"
✅ About page updated with your personal information
✅ Profile photo placeholder ready for your image
✅ All apps running with MongoDB integration

## Application URLs:
- **Frontend (Lifevlog)**: http://localhost:3003
- **Admin Panel**: http://localhost:3005
- **Backend API**: http://localhost:5000

## Admin Login:
- Username: admin
- Password: admin123
