# Claude Team Coordination Protocol

## 🤖 **Multi-Developer Claude Workflow**

When multiple developers are using Claude on the same project, we need coordination to avoid conflicts and track progress.

---

## 📋 **Real-Time Status System**

### **1. Developer Status File**
Each developer maintains their current status in a shared file.

**File**: `DEVELOPER_STATUS.md` (updated every 30 minutes)

```markdown
# Developer Status - Live Updates

## Developer 1 (Anas)
- **Current Task**: Issue #1 - Authentication JWT middleware
- **Location**: flcd-backend/src/middleware/auth.ts
- **Status**: In Progress
- **ETA**: 2 hours
- **Last Update**: 2025-06-08 14:30 GMT

## Developer 2 (Amina)  
- **Current Task**: Issue #7 - Frontend dashboard setup
- **Location**: flcd-frontend/pages/
- **Status**: In Progress
- **ETA**: 3 hours
- **Last Update**: 2025-06-08 14:25 GMT

## Coordination Notes
- Anas: Working on auth endpoints - will notify when ready for frontend integration
- Amina: Setting up Next.js structure - will need auth integration later
```

### **2. File Lock System**
Before editing any file, check and claim it:

**File**: `FILE_LOCKS.md`

```markdown
# File Locks - Who's Working on What

## Currently Locked Files
- `flcd-backend/src/routes/auth.ts` - Anas (until 15:30 GMT)
- `flcd-frontend/components/Layout.tsx` - Amina (until 16:00 GMT)

## How to Use
1. Before editing a file, add it here with your name + time
2. Update GitHub issue when you start/finish
3. Remove lock when done
4. If conflict, coordinate in GitHub issue comments
```

---

## 🔄 **GitHub Issue Coordination**

### **Real-Time Issue Updates**
Each developer updates their assigned issue every 30 minutes:

```markdown
**[14:30] Anas**: Started JWT middleware implementation
- File: src/middleware/auth.ts
- Progress: 30% complete
- Next: OTP integration
- ETA: 2 hours

**[14:25] Amina**: Next.js project initialized
- Files: package.json, pages/_app.tsx
- Progress: 25% complete  
- Next: Tailwind setup
- ETA: 1 hour
```

### **Dependency Coordination**
Mark dependencies clearly:

```markdown
**⚠️ DEPENDENCY**: Issue #7 (Frontend) waits for Issue #1 (Auth endpoints)
**🔗 INTEGRATION POINT**: Auth context needs /api/auth/login endpoint
**📅 COORDINATION NEEDED**: When auth endpoints ready, ping @amina
```

---

## 🤖 **Claude-Specific Protocol**

### **Claude Context Sharing**
When working with Claude, share context through GitHub:

**1. Task Start Protocol**:
```markdown
**Claude Task Started**
- Developer: Anas
- Issue: #1 Authentication
- Claude Session: Started implementing JWT middleware
- Files Affected: src/middleware/auth.ts, src/routes/auth.ts
- Approach: Express middleware with passport-jwt strategy
```

**2. Progress Updates**:
```markdown
**Claude Progress Update**
- Task: 50% complete
- Files Modified: auth.ts (completed), middleware created
- Next with Claude: OTP SMS integration
- Integration Points: Frontend will need /api/auth/login endpoint
```

**3. Completion Protocol**:
```markdown
**Claude Task Completed**
- Issue: #1 Authentication - DONE
- Files: Committed and pushed
- Ready for Integration: Yes
- Next Developer Can: Start frontend auth integration
- Testing: All endpoints tested with curl
```

---

## 📱 **Communication Channels**

### **1. GitHub Issues (Primary)**
- **Real-time updates** in issue comments
- **@mentions** for urgent coordination
- **Labels** for status: in-progress, blocked, ready-for-integration

### **2. DEVELOPER_STATUS.md (Live Status)**
- **Updated every 30 minutes** by each developer
- **Current location** and **ETA** for tasks
- **Conflict prevention**

### **3. File Locks (Conflict Prevention)**
- **Claim files** before editing
- **Release locks** when done
- **Coordinate conflicts** through GitHub

---

## 🚨 **Conflict Resolution**

### **Git Conflicts**
```bash
# Before starting work
git pull origin master

# Before pushing
git pull origin master
git push origin master

# If conflict
git pull origin master
# Resolve conflicts
git commit -m "resolve: merge conflicts in [file]"
git push origin master
```

### **Claude Context Conflicts**
If both developers need to work on related files:

**1. Coordinate in GitHub Issue**:
```markdown
@amina I'm working on auth.ts, will you need this for frontend integration?
Can we coordinate timing? I'll be done by 15:30 GMT.
```

**2. Sequential Development**:
- Developer 1 completes task
- Commits and pushes
- Updates GitHub issue
- Developer 2 starts related task

**3. Parallel Safe Development**:
- Different modules/components
- Different directories
- Clear integration points defined

---

## 📊 **Anthropic's Recommended Approach**

Based on Anthropic's best practices for Claude team development:

### **1. Clear Task Boundaries**
- **Modular development**: Each developer owns specific modules
- **Clean interfaces**: Define integration points clearly
- **Independent testing**: Each module can be tested separately

### **2. Asynchronous Coordination**
- **GitHub as source of truth**: All communication through issues
- **Status files**: Real-time updates without interrupting work
- **Time-boxed integration**: Scheduled integration points

### **3. Claude Context Management**
- **Session documentation**: Share Claude approach in GitHub
- **Consistent patterns**: Follow established code patterns
- **Knowledge transfer**: Document decisions for other developers

---

## ⚡ **Quick Reference Commands**

### **Status Update (Every 30 minutes)**
```bash
# 1. Update your status
echo "## Developer X - $(date)" >> DEVELOPER_STATUS.md
echo "- Working on: Issue #X" >> DEVELOPER_STATUS.md
echo "- Progress: X% complete" >> DEVELOPER_STATUS.md

# 2. Commit status
git add DEVELOPER_STATUS.md
git commit -m "status: Update developer progress"
git push origin master

# 3. Update GitHub issue
gh issue comment [issue-number] --body "Progress update: X% complete, ETA: X hours"
```

### **File Lock (Before editing)**
```bash
# 1. Check locks
cat FILE_LOCKS.md

# 2. Add your lock
echo "- \`path/to/file\` - YourName (until $(date -d '+2 hours' '+%H:%M GMT'))" >> FILE_LOCKS.md

# 3. Commit lock
git add FILE_LOCKS.md && git commit -m "lock: Reserve file for editing" && git push
```

### **Task Completion**
```bash
# 1. Remove file locks
# Edit FILE_LOCKS.md to remove your entries

# 2. Update issue
gh issue comment [issue-number] --body "✅ COMPLETED: Task finished, ready for integration"

# 3. Update status
# Edit DEVELOPER_STATUS.md with "COMPLETED" status
```

---

## 🎯 **Success Metrics**

### **Coordination Success**:
- ✅ Zero git conflicts
- ✅ Real-time status visibility
- ✅ Clean integration points
- ✅ No duplicate work

### **Claude Efficiency**:
- ✅ Context shared between developers
- ✅ Consistent code patterns
- ✅ Knowledge transfer documented
- ✅ Parallel development without conflicts

---

**🚀 This protocol ensures smooth multi-developer Claude collaboration!**