# Production Promotion Checklist

This document outlines the steps to promote a draft build to the live production URL and verify successful deployment.

## Pre-Deployment Verification

Before promoting to production, ensure:

1. **Draft Version Testing**: The draft/preview build has been thoroughly tested
2. **Build Label Updated**: `frontend/src/constants/buildInfo.ts` contains the correct version label
3. **Backend Deployed**: The backend canister has been deployed with matching version in `getBuildInfo()`

## Deployment Steps

### 1. Deploy to Production

Deploy the frontend build to the production canister/hosting environment.

### 2. Verify Live URL

**Critical**: Open the **live production URL** (not the draft/preview URL).

- Check the URL in your browser's address bar
- Confirm it matches your production domain/canister URL
- The Settings screen shows the current URL under "Live App Troubleshooting"

### 3. Clear Browser Cache

Perform a **hard refresh** to bypass browser cache and load fresh assets:

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

If the old version persists:

- Clear browser cache completely for the site
- Try opening in an **incognito/private window**
- Close and reopen the browser

### 4. Verify Build Info

Navigate to **Settings → Build Info** and confirm:

- **Frontend version** shows the expected label (e.g., "Version 8")
- **Backend version** shows the expected label (e.g., "Version 8")
- **Backend timestamp** displays a non-empty value
- **No version mismatch warning** appears

Use the **"Refresh Build Info"** button to manually re-fetch backend version if needed.

## Post-Deployment Validation

### Build Info Verification (Primary Surface)

The Settings → Build Info section is the **primary verification surface** for confirming successful deployments.

**Expected State After Successful Promotion:**

- Frontend version: Matches the build label in `frontend/src/constants/buildInfo.ts`
- Backend version: Matches the version returned by backend `getBuildInfo()`
- Backend timestamp: Non-empty string (e.g., "202406211205")
- Mismatch warning: **Not shown** (only appears when versions differ)

**If Mismatch Warning Appears:**

1. **Frontend stale**: Perform hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Backend not deployed**: Verify backend canister deployment completed
3. **Cache issue**: Clear browser cache and reload
4. **Wrong URL**: Confirm you're on the live production URL

### Cache Verification

If the old version still appears after deployment:

1. **Hard Refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Verify URL**: Check "Current URL" in Settings → Live App Troubleshooting
3. **Clear Cache**: Clear all cached assets for the site in browser settings
4. **Incognito Mode**: Test in a fresh incognito/private window
5. **Manual Refresh**: Use "Refresh Build Info" button in Settings

### Functional Smoke Tests

After verifying build info:

- Verify core features work as expected
- Check that new features from this version are present
- Confirm no console errors or warnings
- Test key user flows

## Troubleshooting

### Version Mismatch Warning Appears

**Cause**: Frontend and backend versions differ.

**Solutions**:

1. **Frontend Stale**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. **Backend Not Deployed**: Verify backend canister was deployed with correct version
3. **Cache Issue**: Clear browser cache completely and reload
4. **Deployment In Progress**: Wait a few moments and refresh

### Old Version Still Showing

**Cause**: Browser serving cached assets or wrong URL.

**Solutions**:

1. Verify you're on the **live production URL** (check Settings → Live App Troubleshooting)
2. Perform a **hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. **Clear browser cache** for the site
4. Try opening in an **incognito/private window**
5. Close and reopen the browser
6. Check if you accidentally bookmarked a draft/preview URL

### Backend Version Shows "Error loading"

**Cause**: Backend canister not responding or network issue.

**Solutions**:

1. Check that the backend canister is running
2. Verify network connectivity
3. Check browser console for error messages
4. Confirm the canister ID is correct in deployment configuration
5. Use "Refresh Build Info" button to retry the fetch
6. Verify backend deployment completed successfully

### Build Retry After Internal Error

If a build/deployment fails with an internal error:

1. **No code changes needed** - the implementation is correct
2. Simply **retry the build** using the build command
3. After successful build, follow the verification steps above
4. Check Settings → Build Info to confirm versions match

## Version 8 Specific Notes

**Frontend Build Label**: "Version 8"  
**Backend Build Label**: "Version 8"  
**Backend Timestamp**: "202406211205"

This release includes:

- Enhanced Build Info card with backend timestamp display
- Manual "Refresh Build Info" button for on-demand verification
- Improved troubleshooting guidance emphasizing live URL verification
- Hardened version mismatch detection with string normalization
- Updated promotion checklist with cache-busting emphasis

## Best Practices

1. **Always verify using Settings → Build Info** after promotion
2. **Use hard refresh** (Ctrl+Shift+R or Cmd+Shift+R) as first troubleshooting step
3. **Check the URL** - ensure you're on the live production URL, not a preview
4. **Test in incognito** - confirms cache is not interfering
5. **Document the live URL** - keep a reference to avoid confusion with draft URLs

---

**Remember**: The Settings → Build Info section is your primary tool for verifying successful production deployments. Always check this after promoting a new version to production.
