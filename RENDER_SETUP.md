# Render Environment Variables Configuration

## Required Environment Variables for Render Deployment

### Application Settings
```bash
NODE_ENV=production
PORT=10000  # Render will override this automatically
RENDER=true  # Set this to enable Render-specific configurations
```

### Optional: Cloudinary Configuration (for image uploads)
```bash
CLOUDINARY_CLOUD_NAME=do7ocnepa
CLOUDINARY_API_KEY=384518284788266
CLOUDINARY_API_SECRET=LDPeyXk2FdMYh3Jwd4NxNV-KCQ8
CLOUDINARY_URL=cloudinary://<384518284788266>:<LDPeyXk2FdMYh3Jwd4NxNV-KCQ8>@do7ocnepa
```

### JWT Secret (recommended to change from default)
```bash
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

## Render Service Configuration

### Web Service Settings:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment**: `Node`
- **Node Version**: `18.x` or higher
- **Plan**: Free tier compatible

### Health Check Endpoint:
- URL: `https://your-app.onrender.com/health`
- Expected Response: `{"status":"ok"}`

### Static File Serving:
The application automatically serves:
- Frontend React app at `/`
- API endpoints at `/api/*`
- Static assets at `/static/*`
- Health check at `/health`

### Data Persistence:
- Blog data: JSON files in `/opt/render/project/src/data/`
- Images: Base64 encoded in blog data (serverless compatible)
- No external database required

## Deployment Checklist:

1. ✅ Connect GitHub repository to Render
2. ✅ Set environment variables (optional)
3. ✅ Configure build and start commands
4. ✅ Deploy and monitor logs
5. ✅ Test health endpoint
6. ✅ Verify frontend and API functionality

## Troubleshooting:

### Common Issues:
- **Build fails**: Check Node.js version (>=18.0.0)
- **App crashes**: Check logs for missing environment variables
- **Static files not loading**: Verify build script completed successfully
- **API not responding**: Check `/health` endpoint first

### Log Monitoring:
```bash
# Health check
curl https://your-app.onrender.com/health

# API health
curl https://your-app.onrender.com/api/health

# Test blog endpoint
curl https://your-app.onrender.com/api/blogs
```
