# 🚀 Enable GitHub Pages - Step by Step

Your code is on GitHub, but GitHub Pages needs to be manually enabled. Follow these exact steps:

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Go to Your Repository**
1. Open your browser
2. Go to: **https://github.com/prempp/ApraNova**
3. You should see your repository with all the code

---

### **Step 2: Open Settings**
1. Click the **"Settings"** tab (top right of the page)
2. You'll see a menu on the left side

---

### **Step 3: Navigate to Pages**
1. In the left sidebar, scroll down
2. Click **"Pages"** (under "Code and automation" section)

---

### **Step 4: Configure GitHub Pages**

You'll see a section called **"Build and deployment"**

1. **Source**:
   - Click the dropdown that says "None"
   - Select: **"GitHub Actions"** (NOT "Deploy from a branch")

2. That's it! No need to select branch or folder

---

### **Step 5: Wait for Deployment**

After selecting "GitHub Actions":
1. GitHub will automatically start building your site
2. Go to the **"Actions"** tab at the top of your repository
3. You'll see a workflow running: "Deploy Jekyll site to Pages"
4. Wait **2-5 minutes** for it to complete (green checkmark)
5. Go back to Settings → Pages
6. You'll see: "Your site is live at https://prempp.github.io/ApraNova/"

---

### **Step 6: Verify It's Working**

1. After the green box appears, click the **"Visit site"** button
2. OR go directly to: **https://prempp.github.io/ApraNova/**
3. You should see your documentation homepage!

---

## ✅ **What You Should See**

When GitHub Pages is enabled correctly, you'll see:

- ✅ In Settings → Pages: Source shows "GitHub Actions"
- ✅ In Actions tab: Green checkmark on "Deploy Jekyll site to Pages"
- ✅ In Settings → Pages: "Your site is live at https://prempp.github.io/ApraNova/"
- ✅ A "Visit site" button

---

## 🐛 **Troubleshooting**

### **If you see "404 - Site not found"**
- Wait 2-5 more minutes (first build takes time)
- Refresh the page
- Check Actions tab to see if build completed

### **If you don't see "GitHub Actions" option**
- Make sure the repository is **Public** (not Private)
- Go to Settings → General → Danger Zone → Change visibility → Public
- Free GitHub accounts can only use Pages with public repos

### **If the build fails**
- Go to the **"Actions"** tab in your repository
- Click on the failed workflow
- Check the error logs
- The workflow should build automatically after you select "GitHub Actions"

---

## 📚 **Your Documentation Pages**

Once enabled, these pages will be available:

- **Home**: https://prempp.github.io/ApraNova/
- **Architecture**: https://prempp.github.io/ApraNova/architecture
- **Authentication**: https://prempp.github.io/ApraNova/auth-flow
- **Workspace**: https://prempp.github.io/ApraNova/workspace-flow
- **API Docs**: https://prempp.github.io/ApraNova/api-documentation
- **Database**: https://prempp.github.io/ApraNova/database-schema
- **Payments**: https://prempp.github.io/ApraNova/payment-flow

---

## 🎯 **Quick Checklist**

- [ ] Go to https://github.com/prempp/ApraNova
- [ ] Click "Settings" tab
- [ ] Click "Pages" in left sidebar
- [ ] Source: Select "GitHub Actions"
- [ ] Go to "Actions" tab
- [ ] Wait for "Deploy Jekyll site to Pages" to complete (green checkmark)
- [ ] Go back to Settings → Pages
- [ ] Click "Visit site" or go to https://prempp.github.io/ApraNova/

---

## 📸 **Visual Guide**

### What the Settings → Pages should look like:

```
Build and deployment
├── Source: GitHub Actions
└── Custom domain: (leave empty)
```

After the workflow runs, you'll see:
```
✅ Your site is live at https://prempp.github.io/ApraNova/
```

---

## ✨ **After It's Working**

Your documentation will include:
- 📊 Interactive Mermaid diagrams
- 📝 Complete API documentation
- 🔐 Authentication flows
- 🐳 Docker workspace provisioning
- 💳 Payment integration docs
- 🗄️ Database schema with ERD

---

**Need help? The issue is likely just that GitHub Pages hasn't been enabled yet in Settings → Pages!**

