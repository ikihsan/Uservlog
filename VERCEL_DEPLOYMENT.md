# Vercel Deployment Configuration

## Environment Variables for Vercel

Add these environment variables in your Vercel dashboard:

```
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Image Hosting Solution

The API now supports:

1. **Development**: Local file storage with `/api/uploads/` serving
2. **Production (Vercel)**: Base64 encoding (can be upgraded to Cloudinary)

### To Enable Cloudinary (Recommended for Production):

1. Sign up at https://cloudinary.com (free tier: 25GB storage, 25GB bandwidth)
2. Get your credentials from the dashboard
3. Set environment variables in Vercel
4. Uncomment the Cloudinary code in `api/index.js`

### Current Fallback:
- Production uses base64 encoding which works but increases response size
- Images are stored directly in the blog data structure
- No external dependencies required

## Deployment Steps:

1. `cd api && npm install`
2. `git add . && git commit -m "Update image handling for Vercel"`
3. `git push`
4. Deploy to Vercel automatically

## Testing:

- Local: http://localhost:3004 (images via file system)
- Production: https://your-vercel-domain.vercel.app (images via base64/Cloudinary)
