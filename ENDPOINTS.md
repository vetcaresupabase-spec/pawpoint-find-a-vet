# PawPoint Find a Vet - Environment Endpoints

## Development Environment
- **URL**: http://localhost:8080
- **Command**: `npm run dev`
- **Environment**: Development
- **Features**: Debug enabled, Mock data disabled
- **Database**: Supabase (Development)

## Test Environment
- **URL**: http://localhost:8081
- **Command**: `npm run dev:test`
- **Environment**: Test
- **Features**: Debug enabled, Mock data enabled
- **Database**: Supabase (Test)

## UAT Environment
- **URL**: http://localhost:8082
- **Command**: `npm run dev:uat`
- **Environment**: Production-like
- **Features**: Debug disabled, Mock data disabled
- **Database**: Supabase (Production)

## Production Environment
- **URL**: https://pawpoint-find-a-vet-27538.lovable.app
- **Command**: `npm run build` (deploy to Lovable)
- **Environment**: Production
- **Features**: Analytics enabled, Debug disabled
- **Database**: Supabase (Production)

## Quick Start Commands

### Start Development Server
```bash
npm run dev
# Opens at http://localhost:8080
```

### Start Test Server
```bash
npm run dev:test
# Opens at http://localhost:8081
```

### Start UAT Server
```bash
npm run dev:uat
# Opens at http://localhost:8082
```

### Build for Production
```bash
npm run build
# Creates dist/ folder for deployment
```

## Environment Files
- `.env.development` - Development settings
- `.env.test` - Test settings  
- `.env.production` - Production settings
- `.env` - Default/fallback settings

## Troubleshooting

### Port Already in Use
If you get "port already in use" error:
```bash
# Kill process on port 8080
npx kill-port 8080

# Or use different port
npm run dev -- --port 3000
```

### Server Not Starting
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Clear cache: `npm run dev -- --force`

### Database Connection Issues
- Verify Supabase URL and keys in environment files
- Check if Supabase project is active
- Ensure RLS policies are set up correctly









