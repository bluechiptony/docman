# Folder Required Documents - User Manual

## Overview

Folder Required Documents lets administrators create reusable folder configurations that define which document types are expected when creating folders.

This is useful when you want consistent folder intake requirements across teams (for example: applicant folders, onboarding folders, or audit folders).

---

## Table of Contents

1. [Accessing Folder Configuration](#accessing-folder-configuration)
2. [Before You Start](#before-you-start)
3. [Creating a Folder Config](#creating-a-folder-config)
4. [Editing an Existing Folder Config](#editing-an-existing-folder-config)
5. [Using a Folder Config During Folder Creation](#using-a-folder-config-during-folder-creation)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Accessing Folder Configuration

1. Sign in with an admin account
2. Go to **Dashboard → Settings**
3. Open the **Folder** tab
4. You will land on **Folder Required Documents**

---

## Before You Start

Make sure:

- Your organization already has document types created
- You know which document types should be **required** versus **optional**
- You have a clear configuration name (example: "Standard Applicant Documents")

---

## Creating a Folder Config

### Step-by-Step

1. In **Settings → Folder**, click **Add Folder Config**
2. In the **Create Folder Required Documents** modal:
   - Enter **Configuration Name**
   - Click **Select document types**
   - Choose one or more document types
3. For each selected type, choose whether it is:
   - **Required** (must be provided)
   - **Optional** (nice to have, not mandatory)
4. Click **Create**
5. Confirm the success message: "Configuration created successfully"

### Example Configuration

- Configuration Name: `Standard Applicant Documents`
- Required: `Passport`, `Resume`
- Optional: `Cover Letter`

---

## Editing an Existing Folder Config

1. In **Settings → Folder**, find the configuration card
2. Click **View Details**
3. Update selected document types and required/optional flags
4. Save changes

---

## Using a Folder Config During Folder Creation

Once configs exist, they appear in the folder creation modal.

1. Go to **Documents**
2. Click **New Folder** (or create a subfolder)
3. Fill in:
   - **Folder Name**
   - **Folder Type** (`Applicant` or `Document`)
4. In **Required Documents (Optional)**, pick a configuration
5. Click **Create Folder**

This links the folder to your chosen requirements setup.

---

## Best Practices

- Start with 1–3 baseline configurations before creating many
- Keep names specific to the process: `Applicant Intake`, `Vendor Onboarding`, `Audit Pack`
- Prefer reusable document types instead of creating near-duplicates
- Review configurations quarterly and remove unused ones

---

## Troubleshooting

### "No configurations found"

**Reason:** No folder configs exist yet.

**Fix:** Click **Add Folder Config** and create your first one.

---

### "Failed to load document types"

**Reason:** Document types are missing, or there is a temporary API/load issue.

**Fix:**

1. Verify document types in **Settings → Document Types**
2. Refresh the page
3. Try again

---

### "Please select at least one document type"

**Reason:** You tried to create a config without selecting types.

**Fix:** Select one or more document types before clicking **Create**.

---

### Folder config is not listed in New Folder modal

**Reason:** Configuration was not created successfully or organization context changed.

**Fix:**

1. Return to **Settings → Folder** and verify it exists
2. Refresh the Documents page
3. Make sure you are in the same organization

---

## Quick Reference Card

| Task          | Steps                                                         |
| ------------- | ------------------------------------------------------------- |
| Create Config | Settings → Folder → Add Folder Config → Select types → Create |
| Edit Config   | Settings → Folder → View Details → Update types/flags → Save  |
| Apply Config  | Documents → New Folder → Required Documents → Select config   |

---

**Folder Required Documents Feature | DocMan**  
_Last Updated: February 24, 2026_
