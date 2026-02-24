# Documents Page - User Manual & Tutorial Script

## Overview

The Documents page is the heart of DocMan—your central hub for organizing, managing, and accessing all your files. Whether you're storing invoices, contracts, reports, or any other business documents, this page provides an intuitive interface to keep everything organized and easily searchable.

---

## Table of Contents

1. [Page Overview](#page-overview)
2. [Navigation & Breadcrumbs](#navigation--breadcrumbs)
3. [Creating Folders](#creating-folders)
4. [Folder Requirements Configuration (Admin)](#folder-requirements-configuration-admin)
5. [Uploading Documents](#uploading-documents)
6. [Upload Walkthrough: Complete Tutorial](#upload-walkthrough-complete-tutorial)
7. [Searching & Filtering](#searching--filtering)
8. [Managing Items](#managing-items)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Page Overview

### What You'll See

The Documents page is organized into several key sections:

**Header Section:**

- **Page Title**: Shows "Documents" when at the root level, or the current folder name when you've navigated into a folder
- **Action Buttons**:
  - "New Folder" button (folder icon) - Create a new folder to organize documents
  - "Upload" button (plus icon) - Add new documents to the current location

**Search Bar:**

- Allows you to quickly find documents and folders by name
- Real-time filtering as you type
- Works on the current folder level

**Main Grid Area:**

- Displays all documents and folders in the current location
- Shows folders first, then documents
- Visual distinction between folders and files
- Easy drag-and-drop reorganization

### Root vs. Subfolder Views

**Root Documents Page:**

- Shows your organization's main document repository
- Title displays "Documents"
- All top-level folders and documents appear here

**Inside a Folder:**

- Title changes to the folder name (e.g., "Q4 Reports")
- Breadcrumb navigation shows your path
- Can create subfolders to organize further

---

## Navigation & Breadcrumbs

### Understanding Breadcrumbs

**[Scene: User navigates into folders]**

**Narrator:**

> "The breadcrumb trail at the top shows your current location in the folder hierarchy."

**Example breadcrumb:**

```
Documents > Finance > 2025 > January
```

### How to Navigate

**Using Breadcrumbs:**

1. Click any breadcrumb level to jump back to that location
2. The most recent folder is highlighted at the far right
3. Click "Documents" to return to the root

**Using Folder Clicks:**

1. Double-click a folder to open it
2. Use the back button if your browser has one
3. Or click a breadcrumb to navigate

---

## Creating Folders

### Why Create Folders?

Folders help you:

- **Organize by category**: Separate invoices from contracts from reports
- **Organize by date**: Group documents by year, month, or quarter
  **[Scene: User is on the Documents page, inside a "Finance/2025-Q1" folder]**
- **Organize by department**: Finance, HR, Legal, etc.
- **Organize by project**: Group related project documents

### Step-by-Step Tutorial

#### Creating a Top-Level Folder

**[Scene: User is on the root Documents page]**

**Narrator:**

> "To create a new folder, click the 'New Folder' button in the top-right corner."

**[Scene: Folder creation dialog appears]**

**Narrator:**

> "A dialog box will appear asking for the folder name."

**[Scene: User types folder name]**

**Narrator:**

> "Enter a clear, descriptive name for your folder. For example, 'Invoices 2025' or 'Client Contracts'."

**Tips for naming folders:**

- Use clear, descriptive names
- Include dates if organizing by time: "2025-Q1", "January 2025"
- Use consistent formatting across folders
- Avoid special characters except hyphens and underscores
- Examples:
  - ✅ "Financial-Reports-2025"
  - ✅ "Client-Contracts"
  - ✅ "HR-Documents"
  - ❌ "Stuff", "Files", "Documents"

**[Scene: User presses Enter or clicks Create]**

**Narrator:**

> "Press Enter or click the 'Create' button. Your new folder is instantly created and ready to use."

**[Scene: Toast notification: "Folder created successfully"]**

**Narrator:**

> "You'll see a confirmation message. Your folder now appears in the documents grid."

#### Creating Subfolders

**[Scene: User navigates into a folder, then clicks "New Folder"]**

**Narrator:**

> "You can also create folders within folders—we call these subfolders. Simply navigate into a folder and click 'New Folder' again."

**[Scene: Dialog shows "Create Subfolder"]**

**Narrator:**

> "Notice the dialog title now says 'Create Subfolder', confirming you're creating a folder inside your current location."

**When to use subfolders:**

- **Inside date folders**: "2025" > "Q1" > "January"
- **Inside client folders**: "Acme Corp" > "Contracts" > "Active"
- **Inside department folders**: "Finance" > "Invoices" > "Paid"
- **Keep it shallow**: 3-4 levels is usually optimal; avoid going too deep

#### Folder Organization Best Practices

**Deep Folder Structure Example:**

```
Documents/
├── Finance/
│   ├── 2025/
│   │   ├── Q1/
│   │   │   ├── January/
│   │   │   ├── February/
│   │   │   └── March/
│   │   ├── Q2/
│   │   ├── Q3/
│   │   └── Q4/
│   ├── 2024/
│   ├── Invoices/
│   └── Expense-Reports/
├── HR/
│   ├── Employees/
│   ├── Contracts/
│   └── Benefits/
└── Legal/
    ├── Active-Contracts/
    ├── Agreements/
    └── Compliances/
```

---

## Folder Requirements Configuration (Admin)

Admins can create reusable folder requirement configurations and apply them during folder creation.

### Create the Configuration

1. Go to **Settings → Folder**
2. Click **Add Folder Config**
3. Enter a configuration name
4. Select one or more document types
5. Mark each selected type as **Required** or **Optional**
6. Click **Create**

### Apply It During Folder Creation

1. Open **Documents** and click **New Folder**
2. Enter **Folder Name**
3. Choose **Folder Type**
4. In **Required Documents (Optional)**, select a configuration
5. Click **Create Folder**

Use this when you want consistent document intake expectations across similar folders.

---

## Uploading Documents

### Before You Upload

**Prepare your file:**

1. Ensure the file is in the correct format (PDF, Word, Excel, etc.)
2. Give it a meaningful name
3. Note the file size (large files may take longer to upload)

### Upload Steps

**[Scene: User clicks "Upload" button]**

**Narrator:**

> "To add a document to the current folder, click the 'Upload' button."

**[Scene: Upload dialog/file picker appears]**

**Narrator:**

> "A file selector will open. Browse to your computer and choose the document you want to upload."

**[Scene: User selects a file]**

**Narrator:**

> "Select your file and click 'Open' or 'Choose'."

**[Scene: Upload progress bar appears]**

**Narrator:**

> "The file will begin uploading. You'll see a progress indicator showing the upload status."

**[Scene: Upload completes with success message]**

**Narrator:**

> "Once the upload is complete, your document will appear in the grid below."

### Upload with Document Type (Single File)

Use this mode when you want to classify a document as you upload it.

**[Scene: Upload dialog opens]**

**Narrator:**

> "At the top of the upload dialog, click 'With Document Type'."

**[Scene: Document type search box appears]**

**Narrator:**

> "Search and select a document type using the searchable list."

**Important:** This mode only accepts a single file per upload.

**Steps:**

1. Click 'Upload' to open the modal
2. Switch to 'With Document Type'
3. Search and select the appropriate document type
4. Click 'browse' (or drag-and-drop) to pick your file
5. Click 'Upload' to start the process

**Validation:** If no document type is selected, or more than one file is chosen, the upload button will be disabled.

### Upload Tips

✅ **Do's:**

- Upload documents with clear, descriptive names
- Use consistent naming conventions across files
- Organize into folders before uploading large batches
- Check file format compatibility

❌ **Don'ts:**

- Don't upload files without meaningful names
- Don't upload the same document multiple times
- Don't upload extremely large files without checking limits
- Don't upload extremely large files without checking limits
- Don't ignore folder organization during upload

---

## Upload Walkthrough: Complete Tutorial

### Scenario: Uploading with Document Type

**[Scene: User opens upload modal and selects 'With Document Type']**

**Narrator:**

> "Let's upload a single document and tag it with a Document Type so it's organized immediately."

**[Scene: User searches for 'Invoice' and selects it]**

**Narrator:**

> "Use the search box to find your document type quickly—like 'Invoice'—then select it."

**[Scene: User selects one file to upload]**

**Narrator:**

> "In this mode, only one file can be selected. Pick your file and proceed."

**[Scene: Progress bar and success toast appear]**

**Narrator:**

> "You'll see the upload progress and a confirmation when it's completed. Your document is now tagged with the selected type."

### Scenario: Uploading a Single Invoice

**[Scene: User is on the Documents page, inside a "Finance/2025-Q1" folder]**

**Narrator (Voiceover):**

> "Let's walk through uploading a document step by step. We're in the Finance folder, in the Q1 2025 section. This is where we'll upload our invoice."

**[Scene: User looks at the top-right corner]**

**Narrator:**

> "You can see two action buttons at the top right: 'New Folder' and 'Upload'. We're going to click the 'Upload' button."

**[Scene: User clicks Upload button]**

**[Scene: System opens file picker/browser dialog]**

**Narrator:**

> "Clicking Upload opens your computer's file browser. This is where you'll navigate to find the document you want to upload."

**[Scene: File browser shows various folders on computer]**

**Narrator:**

> "Navigate through your folders to find the document. In this case, we're looking for 'Invoice-January-2025.pdf'."

**[Scene: User navigates to Downloads folder]**

**Narrator:**

> "Users often store documents in their Downloads, Documents, or Desktop folders. Navigate to wherever your file is stored."

**[Scene: User sees file "Invoice-January-2025.pdf"]**

**Narrator:**

> "Here's our invoice file. Notice the filename is clear and descriptive, including the month and year. This makes it easy to find later."

**[Scene: User clicks on the file to select it]**

**Narrator:**

> "Click on the file to select it. You'll see it highlight to show it's selected."

**[Scene: User clicks "Open" or "Choose" button]**

**Narrator:**

> "Once selected, click the 'Open' or 'Choose' button at the bottom of the file browser. The button name may vary depending on your operating system."

**[Scene: Back to DocMan interface, upload progress bar appears]**

**Narrator:**

> "Now you're back in DocMan, and you'll see an upload progress bar. This shows the file is being transferred to the system."

**[Scene: Progress bar fills up (small file uploads quickly)]**

**Narrator:**

> "Depending on your file size and internet speed, this may take a few seconds to a few minutes. Larger files take longer to upload."

**[Scene: Progress completes, success message appears]**

**Narrator:**

> "Once the upload completes, you'll see a success confirmation message."

**[Scene: File appears in the documents grid]**

**Narrator:**

> "Your document now appears in the grid with the other files in this folder. It shows the file name, when it was uploaded, and file details."

**[Scene: User can see file in grid with metadata]**

**Narrator:**

> "You can immediately see your newly uploaded file in the grid. It's now part of your organized document system!"

### Scenario: Uploading Multiple Documents

**[Scene: User wants to upload 5 invoices at once]**

**Narrator:**

> "If you need to upload multiple documents, the process is similar—just repeat the steps for each file."

**Pro tip - Bulk organization:**

1. Create the folder structure first (e.g., "Finance/2025/Q1/January")
2. Navigate into the final folder
3. Click Upload and select the first file
4. Wait for completion
5. Repeat for each file

**Alternative approach - Batch upload:**

> "In future updates, DocMan may support selecting multiple files at once. For now, upload files one by one to ensure proper organization."

### Scenario: Upload Best Practices in Action

**[Scene: Comparison of good vs. bad uploads]**

#### ❌ Suboptimal Upload Flow

**[Scene: User is at root Documents level]**

**Narrator:**

> "Here's what NOT to do: Uploading a file to the root Documents folder without organizing it into any folder structure first."

**[Scene: User uploads "Document1.pdf" to root]**

**Narrator:**

> "This creates clutter and makes finding documents later difficult. The root folder becomes a mess of unsorted files."

#### ✅ Optimal Upload Flow

**[Scene: User starts by creating folder structure]**

**Narrator:**

> "The better approach: Start by creating your folder structure. Create a 'Finance' folder, then a '2025' subfolder, then 'Q1'."

**[Scene: Folder structure appears]**

**Narrator:**

> "Now, navigate into Finance > 2025 > Q1, then upload your file."

**[Scene: User navigates into Q1 folder]**

**Narrator:**

> "You can see in the breadcrumb that we're nested inside Finance > 2025 > Q1. This is the perfect location for our Q1 files."

**[Scene: User clicks Upload]**

**Narrator:**

> "Now when we upload the file, it automatically goes to the right place in our organized structure."

**[Scene: File appears in correct location]**

**Narrator:**

> "The file is now properly organized and easy to find later. This small investment in organization saves time when you need to locate documents."

### File Type Guide

**[Scene: User preparing different file types]**

**Narrator:**

> "DocMan supports many common file types. Here's what you can typically upload:"

**Supported formats:**

- **Office Documents**: Word (.docx, .doc), Excel (.xlsx, .xls), PowerPoint (.pptx)
- **PDFs**: .pdf (widely used, searchable, consistent formatting)
- **Images**: .jpg, .png, .gif, .bmp
- **Text**: .txt, .csv, .rtf
- **Archives**: .zip, .rar (useful for bundling multiple files)

**Tips for each format:**

**PDFs:**

- Best for official documents and records
- Maintains formatting across devices
- Can be searchable if OCR-processed

**Word Documents:**

- Good for contracts and agreements
- Allows collaboration and comments
- Can include tracked changes

**Excel Spreadsheets:**

- Perfect for financial data and reports
- Preserves formulas and calculations
- Easy to search and filter

**Images:**

- Use for scanned documents or photos
- Consider PDF conversion for consistency
- Large image files may take longer to upload

### Upload Troubleshooting

**[Scene: Common upload issues]**

**Issue: "File is too large"**

**Narrator:**

> "If you see this error, your file exceeds the size limit. Check your file size and consider compressing or splitting it."

**Solutions:**

- Compress the file using 7-Zip or WinRAR
- Split large documents into smaller sections
- Contact your administrator about size limits

**Issue: "File type not supported"**

**Narrator:**

> "Some file formats aren't supported. Try converting to a common format like PDF."

**Example conversions:**

- Image → PDF (scan to PDF)
- Any document → PDF (Print to PDF)
- Proprietary formats → Word or Excel

**Issue: Upload appears to hang**

**Narrator:**

> "If the upload seems stuck, check your internet connection and try again. Very large files on slow connections may appear to hang."

**Solutions:**

- Check internet connection
- Wait a bit longer (uploads take time)
- Try a smaller file to test
- Refresh the page and try again

**Issue: File uploaded but doesn't appear**

**Narrator:**

> "The file uploaded but you don't see it in the grid. You might be looking in the wrong folder."

**Solutions:**

- Check the breadcrumb—are you in the right folder?
- Use the search bar to find the file by name
- Navigate back to root and search across all folders
- Refresh the page

**Issue: "Invalid document type"**

**Narrator:**

> "When uploading with Document Type mode, you see this error if the selected document type doesn't exist or was deleted."

**Solutions:**

- Go to Settings → Document Types to verify the type exists
- Select a different document type and try again
- Switch to Standard upload mode if document type isn't critical
- Contact your administrator if document types are missing

**Issue: "Document type does not belong to organization"**

**Narrator:**

> "This error appears if you try to use a document type from a different organization."

**Solutions:**

- Verify you're logged into the correct organization
- Select a document type from your organization's list
- Contact support if you see document types that shouldn't be visible

**Issue: "Failed to finalize upload"**

**Narrator:**

> "The file uploaded successfully but couldn't be saved to your document library."

**Solutions:**

- Check that you have permission to upload documents
- Verify the folder you're uploading to exists
- Try uploading again
- Contact your administrator if the issue persists

---

## Searching & Filtering

### Using the Search Bar

**[Scene: User sees search bar at top of documents grid]**

**Narrator:**

> "The search bar lets you quickly find documents by typing part of the name."

**[Scene: User types in search box]**

**Narrator:**

> "As you type, the results filter in real-time. You don't need to press Enter—just start typing and watch the list update."

### Search Tips

**Search is case-insensitive:**

- "invoice" finds "Invoice", "INVOICE", "Invoice2025"

**Partial matches work:**

- Search for "inv" finds "Invoice", "Investigation", "Inventory"

**Current folder only:**

- Search only filters items in the current folder
- To search in a subfolder, navigate there first

**Example searches:**

- Search: "2025" → Finds all files with 2025 in the name
- Search: "contract" → Finds "Contract-ABC", "Client-Agreement", etc.
- Search: "Q1" → Finds "Q1-Report", "Q1-Financials"

---

## Managing Items

### Viewing Item Details

**[Scene: User hovers over or clicks a document/folder]**

**Narrator:**

> "Hover over any item to see its details—like when it was created, its size, or who created it."

### Common Actions

**Open a Folder:**

- Double-click to navigate into it
- Breadcrumbs update automatically

**View Document Details:**

- Click a document to see metadata
- Document preview may be available depending on file type

**Rename Items:**

- Right-click or use the actions menu to rename
- Useful if you notice a typo or need to organize

**Move Items:**

- Drag and drop to reorganize
- Move between folders easily

**Delete Items:**

- Use the delete/remove option when needed
- Some deleted items may be recoverable depending on system settings

---

## Best Practices

### 📋 Folder Organization Strategy

**✅ Recommended Approaches:**

1. **By Time Period:**

   ```
   Documents/
   ├── 2025/
   ├── 2024/
   └── 2023/
   ```

2. **By Department:**

   ```
   Documents/
   ├── Finance/
   ├── HR/
   ├── Legal/
   └── Operations/
   ```

3. **By Client/Project:**

   ```
   Documents/
   ├── Acme-Corp/
   ├── TechStart-Inc/
   └── Global-Ventures/
   ```

4. **Hybrid Approach (Recommended):**
   ```
   Documents/
   ├── Finance/
   │   ├── 2025/
   │   ├── 2024/
   │   └── Templates/
   ├── Clients/
   │   ├── Acme-Corp/
   │   └── TechStart-Inc/
   └── Archived/
   ```

### 🏷️ Naming Conventions

**For Folders:**

- Use descriptive names with hyphens: "Client-Contracts", "Q1-Reports"
- Include dates if time-sensitive: "2025-Q1", "January-2025"
- Capitalize first letter of each word
- Avoid special characters except hyphens and underscores

**For Documents:**

- Include document type: "Invoice-2025-001", "Contract-ABC-Draft"
- Add dates for version control: "Report-2025-01-15"
- Be specific: Not "Document.pdf" but "Invoice-January-2025.pdf"

### 🎯 Organization Tips

1. **Plan before you build**: Sketch out your folder structure before uploading documents
2. **Keep it shallow**: 2-3 levels is usually better than 5-6 levels
3. **Consistency is key**: Use the same naming and structure for similar documents
4. **Archive old items**: Move old documents to an "Archive" folder periodically
5. **Use Document Types**: Pair folder organization with document types for extra organization
6. **Document your structure**: Tell your team about the folder structure you've created
7. **Review quarterly**: Check for unused or redundant folders

---

## Troubleshooting

### "Folder name is required"

**Problem:** Dialog won't create a folder.

**Solution:**

- Make sure you've entered a folder name
- The name must contain at least one character
- Avoid using only spaces

---

### Upload failed

**Problem:** Your file won't upload.

**Causes & Solutions:**

- **File too large**: Check file size limits; try a smaller file first
- **Connection issue**: Check your internet connection and try again
- **Unsupported format**: Some file types may not be supported; try a common format like PDF
- **Permission issue**: Ensure you have permission to upload to this folder

---

### Can't find a document

**Problem:** You uploaded a document but can't locate it.

**Solutions:**

1. Check the current folder—make sure you're in the right location
2. Use the search bar to find it by name
3. Check if you might have uploaded it to a different folder
4. Check recently uploaded items (usually at the top)

---

### Search results are incomplete

**Problem:** Search isn't finding documents you know are there.

**Solution:**

- Remember: search only works in the current folder
- Navigate into the folder where the document should be
- Try searching with different keywords or partial names
- Search is case-insensitive, but check spelling

---

### Can't create a subfolder inside a folder

**Problem:** "New Folder" button seems disabled or doesn't work.

**Solutions:**

- Check that you have permission to create folders
- Verify the folder isn't read-only
- Try refreshing the page and trying again
- Contact your administrator if issues persist

---

## Quick Reference Card

| Task                    | Steps                                                         |
| ----------------------- | ------------------------------------------------------------- |
| **Create Folder**       | Click "New Folder" → Enter name → Press Enter or click Create |
| **Apply Folder Config** | New Folder → Required Documents → Select configuration        |
| **Create Subfolder**    | Navigate into folder → Click "New Folder" → Enter name        |
| **Upload Document**     | Click "Upload" → Select file → Wait for upload to complete    |
| **Search**              | Type in search bar → Results filter automatically             |
| **Navigate**            | Double-click folder or use breadcrumbs                        |
| **Rename**              | Right-click item or use actions menu → Edit name              |
| **Move Item**           | Drag and drop to new location                                 |

---

## Summary

The Documents page is designed to be intuitive and flexible. Whether you're uploading a single file or building an entire document management system:

1. **Start simple** – Create basic folders first
2. **Be consistent** – Use naming conventions across your team
3. **Use search** – Take advantage of the search feature for quick access
4. **Organize thoughtfully** – Consider your workflow when planning folder structure

**Ready to get started?**

1. Click "New Folder" to create your first folder
2. Name it based on your organization strategy (by date, client, or department)
3. Start uploading documents!

For more help or to report issues, contact your system administrator.

---

**Documents Page Feature | DocMan**
_Last Updated: February 24, 2026_
