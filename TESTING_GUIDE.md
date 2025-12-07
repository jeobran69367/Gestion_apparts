# Testing Guide - Image Management System

## Overview
This document provides comprehensive testing instructions for the image management system implemented in the Gestion_apparts application.

## Prerequisites

### Environment Setup
1. **Backend API**: Running on `http://localhost:4000`
2. **Frontend Web**: Running on `http://localhost:3000`
3. **Database**: PostgreSQL with studios table configured
4. **User Account**: Admin user account for creating studios

### Required Tools
- Web browser (Chrome, Firefox, Safari)
- Postman or curl (for API testing)
- Sample images (JPEG, PNG, WEBP format, various sizes)

## Test Cases

### 1. Create Studio with Images

#### Test 1.1: Successful Upload
**Steps:**
1. Login as admin user
2. Navigate to `/studios/create`
3. Fill in all required fields
4. Click "Photos" file input
5. Select 3 valid images (JPEG, PNG, or WEBP, each < 5MB)
6. Verify preview images appear
7. Click "Créer le studio"
8. Wait for upload progress indicator
9. Verify redirect to success page

**Expected Results:**
- ✅ Images show in preview with delete buttons
- ✅ Upload progress indicator shows during upload
- ✅ Success message displayed
- ✅ Studio created with 3 image URLs in database
- ✅ Images accessible at `/studios/details/[id]`

#### Test 1.2: File Type Validation
**Steps:**
1. Navigate to `/studios/create`
2. Try to upload a PDF file
3. Try to upload a .txt file
4. Try to upload a .exe file

**Expected Results:**
- ✅ Error message: "Type de fichier non supporté"
- ✅ No preview shown for invalid files
- ✅ Valid images still work

#### Test 1.3: File Size Validation
**Steps:**
1. Navigate to `/studios/create`
2. Try to upload an image > 5MB
3. Try to upload an image exactly 5MB
4. Try to upload an image < 5MB

**Expected Results:**
- ✅ Image > 5MB: Error "Taille du fichier dépasse 5MB"
- ✅ Image = 5MB: Accepted
- ✅ Image < 5MB: Accepted

#### Test 1.4: Multiple Images Upload
**Steps:**
1. Navigate to `/studios/create`
2. Select 10 images at once
3. Try to select 11 images

**Expected Results:**
- ✅ 10 images: All accepted and previewed
- ✅ 11 images: Only first 10 accepted or error shown

#### Test 1.5: Remove Image from Preview
**Steps:**
1. Select 3 images
2. Click "×" button on second image
3. Submit form

**Expected Results:**
- ✅ Second image removed from preview
- ✅ Only 2 images uploaded
- ✅ Studio created with 2 image URLs

### 2. Edit Studio Images

#### Test 2.1: View Existing Images
**Steps:**
1. Create a studio with 3 images
2. Navigate to `/studios/edit/[id]`
3. Verify existing images displayed

**Expected Results:**
- ✅ All 3 images displayed in "Photos actuelles" section
- ✅ Each image has delete button
- ✅ Images load correctly

#### Test 2.2: Delete Existing Image
**Steps:**
1. Navigate to edit page for studio with images
2. Click "×" on one existing image
3. Click "Enregistrer les modifications"

**Expected Results:**
- ✅ Image removed from preview immediately
- ✅ Studio saved successfully
- ✅ Image URL removed from database
- ✅ Image still accessible (not deleted from filesystem yet)

#### Test 2.3: Add New Images
**Steps:**
1. Navigate to edit page
2. Select 2 new images
3. Verify they appear in "Nouvelles photos à ajouter"
4. Click "Enregistrer les modifications"

**Expected Results:**
- ✅ New images show with blue border
- ✅ Upload progress indicator appears
- ✅ New images added to studio
- ✅ All images (existing + new) visible on details page

#### Test 2.4: Combined Edit
**Steps:**
1. Navigate to edit page for studio with 3 images
2. Delete 1 existing image
3. Add 2 new images
4. Save

**Expected Results:**
- ✅ Final result: 4 images total (2 existing + 2 new)
- ✅ All operations complete successfully
- ✅ Database reflects correct image URLs

### 3. Delete Studio

#### Test 3.1: Cleanup on Delete
**Steps:**
1. Create a studio with 3 images
2. Note the image URLs
3. Delete the studio
4. Try to access the image URLs directly

**Expected Results:**
- ✅ Studio deleted from database
- ✅ Image files removed from `uploads/studios/` directory
- ✅ Accessing image URLs returns 404

### 4. Security Tests

#### Test 4.1: Unauthenticated Upload
**Steps:**
1. Logout or use incognito mode
2. Try POST to `/api/uploads/studios/images` with curl/Postman

**Expected Results:**
- ✅ Response: 401 Unauthorized
- ✅ No files uploaded

#### Test 4.2: Path Traversal Protection
**Steps:**
1. Try to access: `GET /api/uploads/studios/../../../etc/passwd`
2. Try to access: `GET /api/uploads/studios/..%2F..%2F..%2Fetc%2Fpasswd`
3. Try to access: `GET /api/uploads/studios/studio-123.jpg`

**Expected Results:**
- ✅ Path traversal attempts: 404 Not Found
- ✅ Valid filename: Image returned (if exists)

#### Test 4.3: File Type Bypass
**Steps:**
1. Rename a .exe file to .jpg
2. Try to upload through UI
3. Try to upload through API

**Expected Results:**
- ✅ File rejected based on MIME type
- ✅ Error message shown

### 5. API Tests

#### Test 5.1: Upload Endpoint
```bash
# Test with valid image
curl -X POST http://localhost:4000/api/uploads/studios/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png"

# Expected: 200 OK with URLs array
```

#### Test 5.2: Retrieval Endpoint
```bash
# Test retrieving image
curl http://localhost:4000/api/uploads/studios/studio-1234567890-123456789.jpg \
  --output test.jpg

# Expected: Image file downloaded
```

#### Test 5.3: Delete Endpoint
```bash
# Test deleting images
curl -X DELETE http://localhost:4000/api/uploads/studios/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "http://localhost:4000/api/uploads/studios/studio-1234567890-123456789.jpg"
    ]
  }'

# Expected: 200 OK with success message
```

### 6. Performance Tests

#### Test 6.1: Multiple Concurrent Uploads
**Steps:**
1. Open 3 browser tabs
2. In each tab, create a studio with 10 images
3. Submit all forms simultaneously

**Expected Results:**
- ✅ All uploads complete successfully
- ✅ No file naming conflicts
- ✅ All studios created correctly

#### Test 6.2: Large File Handling
**Steps:**
1. Upload 10 images of 4.5MB each (total ~45MB)
2. Monitor upload time and memory usage

**Expected Results:**
- ✅ Upload completes in reasonable time
- ✅ No memory errors
- ✅ All files uploaded successfully

### 7. Edge Cases

#### Test 7.1: Empty File Upload
**Steps:**
1. Try to submit form without selecting any images
2. Submit with photos field empty

**Expected Results:**
- ✅ Studio created successfully
- ✅ photos array is empty
- ✅ No errors

#### Test 7.2: Special Characters in Original Filename
**Steps:**
1. Upload file named: `image with spaces & special!@#.jpg`
2. Verify it uploads successfully

**Expected Results:**
- ✅ File uploaded with sanitized server-generated name
- ✅ No errors due to special characters

#### Test 7.3: Network Interruption
**Steps:**
1. Start uploading images
2. Disable network mid-upload
3. Re-enable network

**Expected Results:**
- ✅ Error message shown
- ✅ Partial uploads cleaned up
- ✅ Can retry upload

## Test Results Template

### Test Execution Log

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| 1.1 | Successful Upload | ⬜ Pass / ⬜ Fail | |
| 1.2 | File Type Validation | ⬜ Pass / ⬜ Fail | |
| 1.3 | File Size Validation | ⬜ Pass / ⬜ Fail | |
| 1.4 | Multiple Images | ⬜ Pass / ⬜ Fail | |
| 1.5 | Remove Preview | ⬜ Pass / ⬜ Fail | |
| 2.1 | View Existing | ⬜ Pass / ⬜ Fail | |
| 2.2 | Delete Existing | ⬜ Pass / ⬜ Fail | |
| 2.3 | Add New Images | ⬜ Pass / ⬜ Fail | |
| 2.4 | Combined Edit | ⬜ Pass / ⬜ Fail | |
| 3.1 | Cleanup on Delete | ⬜ Pass / ⬜ Fail | |
| 4.1 | Unauth Upload | ⬜ Pass / ⬜ Fail | |
| 4.2 | Path Traversal | ⬜ Pass / ⬜ Fail | |
| 4.3 | File Type Bypass | ⬜ Pass / ⬜ Fail | |

## Automated Test Scripts

### Setup Test Environment
```bash
# 1. Start API
cd apps/api
npm install
npm run start:dev

# 2. Start Web
cd apps/web
npm install
npm run dev

# 3. Create test images
mkdir test-images
# Add sample images to test-images/
```

### Quick Test Script (Bash)
```bash
#!/bin/bash
# quick-test.sh

BASE_URL="http://localhost:4000/api"
TOKEN="your-jwt-token-here"

# Test 1: Upload image
echo "Testing image upload..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${BASE_URL}/uploads/studios/images" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "images=@test-images/test1.jpg")

if [ $response -eq 200 ]; then
  echo "✅ Upload test passed"
else
  echo "❌ Upload test failed (HTTP $response)"
fi

# Test 2: Get image
echo "Testing image retrieval..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
  "${BASE_URL}/uploads/studios/studio-1234567890-123456789.jpg")

if [ $response -eq 200 ] || [ $response -eq 404 ]; then
  echo "✅ Retrieval test passed"
else
  echo "❌ Retrieval test failed (HTTP $response)"
fi

# Test 3: Path traversal protection
echo "Testing security..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
  "${BASE_URL}/uploads/studios/../../../etc/passwd")

if [ $response -eq 404 ]; then
  echo "✅ Security test passed"
else
  echo "❌ Security test failed (HTTP $response)"
fi
```

## Troubleshooting

### Common Issues

#### Images not uploading
- Check JWT token is valid
- Verify file size < 5MB
- Check file type is JPEG/PNG/WEBP
- Check network connectivity

#### Images not displaying
- Verify API server is running
- Check CORS configuration
- Verify image URLs are correct
- Check browser console for errors

#### Path traversal still working
- Verify latest code is deployed
- Check sanitization logic in uploads.controller.ts
- Review server logs for errors

### Debug Commands

```bash
# Check uploaded files
ls -lah apps/api/uploads/studios/

# Check file permissions
stat apps/api/uploads/studios/studio-*.jpg

# Monitor API logs
tail -f apps/api/logs/application.log

# Test with curl
curl -v http://localhost:4000/api/uploads/studios/studio-123.jpg
```

## Conclusion

This testing guide covers all critical functionality of the image management system. Execute all tests before deploying to production and maintain this document as the system evolves.

**Testing Checklist:**
- [ ] All functional tests passed
- [ ] Security tests passed
- [ ] Performance acceptable
- [ ] Edge cases handled
- [ ] Documentation updated
- [ ] Ready for production deployment
