# File Locks - Who's Working on What

**Purpose**: Prevent conflicts by reserving files during active development

---

## 🔒 **Currently Locked Files**

*No files currently locked*

---

## 📋 **How to Use File Locks**

### **Before Starting Work**
1. **Check this file** for existing locks
2. **Add your lock** if file is available  
3. **Commit and push** the lock immediately
4. **Start your work** on the file

### **Lock Format**
```markdown
- `path/to/file.ext` - DeveloperName (until 15:30 GMT) - Purpose: Brief description
```

### **Example Usage**
```markdown
## Currently Locked Files
- `flcd-backend/src/routes/auth.ts` - Anas (until 15:30 GMT) - Adding JWT endpoints
- `flcd-frontend/components/Layout.tsx` - Amina (until 16:00 GMT) - Creating nav structure
- `flcd-backend/prisma/schema.prisma` - Anas (until 14:45 GMT) - Adding new fields
```

---

## ⚡ **Quick Commands**

### **Lock a File**
```bash
# 1. Check current locks
cat FILE_LOCKS.md

# 2. Add your lock (replace with your details)
echo "- \`path/to/your/file\` - YourName (until $(date -d '+2 hours' '+%H:%M GMT')) - Purpose: What you're doing" >> FILE_LOCKS.md

# 3. Commit immediately
git add FILE_LOCKS.md
git commit -m "lock: Reserve [filename] for editing"  
git push origin master
```

### **Release a Lock**
```bash
# 1. Edit FILE_LOCKS.md to remove your entry
# 2. Commit the change
git add FILE_LOCKS.md
git commit -m "unlock: Release [filename] after completion"
git push origin master
```

---

## 🚨 **Conflict Resolution**

### **If File is Already Locked**
1. **Check lock time**: Is it expired?
2. **Contact developer**: Comment on their GitHub issue
3. **Coordinate timing**: "When will you be done with X file?"
4. **Work on different files**: Pick another task meanwhile

### **Emergency Override**
If developer is unreachable and lock is expired:
```bash
# Remove expired lock
# Edit FILE_LOCKS.md 
# Add comment explaining override
git commit -m "unlock: Override expired lock on [file] - developer unreachable"
```

---

## 📊 **Lock Statistics**

### **File Lock History**
*To be updated as locks are used*

### **Most Locked Files**
*Will track which files need coordination most*

---

## 🎯 **Best Practices**

### **Lock Duration**
- **Short edits**: 30 minutes max
- **Major features**: 2-4 hours max  
- **Refactoring**: 1-2 hours max
- **Update lock time** if you need longer

### **Lock Granularity**
- **Lock specific files**, not entire directories
- **Lock only files you're actively editing**
- **Don't lock files "just in case"**

### **Communication**
- **Update GitHub issue** when you lock files
- **Mention lock in commit messages**
- **Coordinate in advance** for shared files

---

**🔄 Remember: Update locks every time you start/finish work on files!**