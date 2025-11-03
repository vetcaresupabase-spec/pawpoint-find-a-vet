# Quick Start Guide for Localhost Development Server

## Problem Diagnosis & Solution

### The Issue
When trying to start the dev server, it often fails with:
- **Error**: `Port 8080 is already in use`
- **Cause**: A previous instance of the dev server is still running in the background

### The Solution - Step by Step Commands

## Method 1: Quick Start (Recommended)

Use this single-prompt command to start the server reliably:

```
Execute these commands in PowerShell in sequence:
1. cd F:\Vetcare-Cursor\pawpoint-find-a-vet
2. Find and kill any process using port 8080: netstat -ano | findstr :8080 (note the PID number)
3. If a PID is found, kill it: Stop-Process -Id <PID> -Force
4. Start the dev server: npm run dev
```

## Method 2: Detailed Step-by-Step (For AI Assistant)

### Step 1: Navigate to Project Directory
```powershell
cd F:\Vetcare-Cursor\pawpoint-find-a-vet
```

### Step 2: Check if Port 8080 is Already in Use
```powershell
netstat -ano | findstr :8080
```
**Expected Output**: 
- If port is free: No output
- If port is in use: Shows something like `TCP    127.0.0.1:8080         0.0.0.0:0              LISTENING       17084`

### Step 3: Kill Process Using Port 8080 (if any)
If Step 2 shows a process, note the PID (last number) and kill it:
```powershell
Stop-Process -Id <PID> -Force
```
Example: If PID is 17084:
```powershell
Stop-Process -Id 17084 -Force
```

**Alternative**: Kill all node processes:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 4: Start the Development Server
```powershell
npm run dev
```

### Step 5: Verify Server is Running
Wait 3-5 seconds, then check:
```powershell
netstat -ano | findstr :8080
```
**Expected Output**: Should show `LISTENING` on port 8080

### Step 6: Access the Application
Open browser and navigate to:
```
http://localhost:8080
```
or
```
http://127.0.0.1:8080
```

## Method 3: Automated One-Liner Script

Save this as a PowerShell script or run directly:
```powershell
cd F:\Vetcare-Cursor\pawpoint-find-a-vet; Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Start-Sleep -Seconds 2; npm run dev
```

## Configuration Details

### Vite Server Configuration (vite.config.ts)
```typescript
server: {
  host: "127.0.0.1",
  port: 8080,
  strictPort: true,  // This means it won't try other ports if 8080 is taken
}
```

## Troubleshooting

### Issue: "Error: Port 8080 is already in use"
**Solution**: Follow Steps 2-3 above to kill the blocking process

### Issue: "Cannot find module" or dependency errors
**Solution**: 
```powershell
cd F:\Vetcare-Cursor\pawpoint-find-a-vet
npm install
npm run dev
```

### Issue: Server starts but shows blank page
**Solution**: 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check browser console for errors
4. Ensure Supabase environment variables are set in `.env` file

### Issue: Server won't start in background mode
**Solution**: Don't use background mode. Run it in foreground:
```powershell
npm run dev
```
This keeps the terminal window open and shows server logs.

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Check port 8080 | `netstat -ano \| findstr :8080` |
| Kill specific process | `Stop-Process -Id <PID> -Force` |
| Kill all node processes | `Get-Process node \| Stop-Process -Force` |
| Start dev server | `npm run dev` |
| Navigate to project | `cd F:\Vetcare-Cursor\pawpoint-find-a-vet` |
| Install dependencies | `npm install` |
| Check running node processes | `Get-Process node` |

## Single AI Prompt for Starting Server

**Copy and paste this prompt to start the server reliably:**

```
Start the localhost development server for the PawPoint project:

1. Navigate to F:\Vetcare-Cursor\pawpoint-find-a-vet
2. Check if port 8080 is in use with: netstat -ano | findstr :8080
3. If any process is using port 8080, kill it with: Stop-Process -Id <PID> -Force (use the PID from step 2)
4. Start the dev server with: npm run dev (do NOT run in background)
5. Wait 5 seconds after starting
6. Verify the server is running with: netstat -ano | findstr :8080
7. Confirm the server is accessible by checking if you can see LISTENING status
8. Tell me the exact localhost URL to access (should be http://localhost:8080)

Execute each command and show me the output so I can verify it's working.
```

## Expected Successful Output

When server starts successfully, you should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://127.0.0.1:8080/
➜  Network: use --host to expose
```

And when checking with netstat:
```
TCP    127.0.0.1:8080         0.0.0.0:0              LISTENING       <PID>
```

## Important Notes

1. **Don't use background mode**: Running `npm run dev` in background often fails silently. Always run in foreground.
2. **Port is fixed**: The vite config uses `strictPort: true`, so it won't automatically use another port.
3. **Check before starting**: Always check if port 8080 is free before starting.
4. **Kill old processes**: If server was running before, kill it first.
5. **Wait before verifying**: Give the server 3-5 seconds to fully start before checking.

## Server URL

After successful start, access the application at:
- **Primary URL**: http://localhost:8080
- **Alternative**: http://127.0.0.1:8080

---

**Last Updated**: 2025-11-03
**Project**: PawPoint Find-a-Vet
**Port**: 8080 (configured in vite.config.ts)

