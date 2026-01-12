# Help & How-Tos Directory Structure

This folder organizes user manuals, tutorials, and how-to guides for each feature in DocMan.

## Structure

```
Help/
├── how-tos/
│   ├── settings/
│   │   ├── document-types/
│   │   │   └── USER_MANUAL.md
│   │   ├── users/
│   │   └── appearance/
│   ├── documents/
│   ├── folders/
│   ├── dashboard/
│   └── ...
└── README.md (this file)
```

## Adding New Manuals

For each new feature or major functionality:

1. Create a folder path following the app structure: `Help/how-tos/[section]/[feature]/`
2. Add a `USER_MANUAL.md` file with:

   - Feature overview
   - Step-by-step instructions
   - Tutorial scripts (for video/training content)
   - Best practices
   - Troubleshooting section
   - Quick reference card

3. Update this README if creating a new top-level section

## Naming Convention

- Folders: lowercase with hyphens (e.g., `document-types`, `user-management`)
- Files: UPPERCASE with underscores (e.g., `USER_MANUAL.md`, `TUTORIAL_SCRIPT.md`)

## Current Manuals

- ✅ `documents/` - Documents page overview and folder creation
- ✅ `settings/document-types/` - Document Types management
- ✅ `documents/exshare/` - External Share (email + OTP) usage guide

## Upcoming Manuals

- `[ ]` Folders - Folder-specific operations (within documents)
- `[ ]` Upload - Document upload guide
- `[ ]` Dashboard overview
- `[ ]` Users - Add & manage team members
- `[ ]` Activity Log
- `[ ]` Search & filtering
- `[ ]` Settings - General
- `[ ]` Settings - Appearance
- `[ ]` Settings - Access & Permissions

---

**Last Updated:** December 15, 2025
