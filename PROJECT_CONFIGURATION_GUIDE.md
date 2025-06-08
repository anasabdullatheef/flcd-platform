# GitHub Project Configuration Guide

## ✅ Project Created Successfully!
**Project**: FLCD Platform Development  
**ID**: PVT_kwHOA727a84A6-r8  
**URL**: https://github.com/users/anasabdullatheef/projects/1

---

## 🔧 **Step-by-Step Configuration**

### **Step 1: Visit Your Project**
**URL**: https://github.com/users/anasabdullatheef/projects/1

### **Step 2: Configure Custom Fields**

#### **Add Sprint Field**
1. Click the **"+"** button in the column headers
2. Select **"Single select"**
3. **Field name**: `Sprint`
4. **Options**: 
   - `Sprint 1: Foundation (Days 1-3)`
   - `Sprint 2: Core Development (Days 4-7)`
   - `Sprint 3: Integration & Delivery (Days 8-10)`
5. Click **"Save"**

#### **Add Priority Field**
1. Click **"+"** → **"Single select"**
2. **Field name**: `Priority`
3. **Options**:
   - `High` (🔴 Red)
   - `Medium` (🟡 Yellow) 
   - `Low` (🟢 Green)
4. Click **"Save"**

#### **Add Component Field**
1. Click **"+"** → **"Single select"**
2. **Field name**: `Component`
3. **Options**:
   - `Backend`
   - `Frontend`
   - `Mobile`
   - `Database`
   - `Integration`
4. Click **"Save"**

#### **Add Estimate Field**
1. Click **"+"** → **"Number"**
2. **Field name**: `Estimate`
3. **Description**: `Story points (0.5, 1, 2, 3, 5 days)`
4. Click **"Save"**

#### **Add Developer Field**
1. Click **"+"** → **"Single select"**
2. **Field name**: `Developer`
3. **Options**:
   - `Developer 1 (Backend/Frontend)`
   - `Developer 2 (Mobile/Integration)`
   - `Both Developers`
4. Click **"Save"**

---

### **Step 3: Create Custom Views**

#### **View 1: Sprint Overview**
1. Click **"View 1"** dropdown → **"New view"**
2. **Name**: `Sprint Overview`
3. **Layout**: Table
4. **Group by**: `Sprint`
5. **Sort by**: `Priority` (High to Low)
6. **Fields to show**: Title, Assignee, Priority, Estimate, Status
7. Click **"Save changes"**

#### **View 2: Developer Workload**
1. **New view** → **Name**: `Developer Workload`
2. **Layout**: Board
3. **Group by**: `Developer`
4. **Sort by**: `Sprint`
5. **Fields to show**: Title, Sprint, Priority, Estimate, Component
6. Click **"Save changes"**

#### **View 3: Component Progress**
1. **New view** → **Name**: `Component Progress`
2. **Layout**: Table
3. **Group by**: `Component`
4. **Sort by**: `Sprint`
5. **Fields to show**: Title, Sprint, Developer, Priority, Status
6. Click **"Save changes"**

#### **View 4: Current Sprint Only**
1. **New view** → **Name**: `Current Sprint`
2. **Layout**: Board
3. **Filter**: `Sprint = "Sprint 1: Foundation (Days 1-3)"` (update as sprints progress)
4. **Group by**: `Status`
5. **Fields to show**: Title, Developer, Priority, Estimate
6. Click **"Save changes"**

---

### **Step 4: Set Up Automation Workflows**

#### **Access Workflows**
1. Click **"..."** (three dots) in top right
2. Select **"Settings"**
3. Click **"Workflows"** in left sidebar

#### **Enable Built-in Workflows**
1. **Auto-add to project**:
   - ✅ Enable "Item added to repository"
   - Repository: `anasabdullatheef/flcd-platform`

2. **Item closed**:
   - ✅ Enable "When item is closed"
   - Action: "Set status to Done"

3. **Pull request merged**:
   - ✅ Enable "When pull request is merged"
   - Action: "Set status to Done"

#### **Custom Automation Rules**
1. **When assigned to developer**:
   - Trigger: "Assignee changed"
   - Action: "Set status to In Progress"

2. **When PR created**:
   - Trigger: "Linked pull request opened"
   - Action: "Set status to In Review"

---

### **Step 5: Populate Project with Issues**

#### **Add Existing Issues**
1. Click **"Add item"** → **"Add from repository"**
2. Select issues #1 through #7
3. Click **"Add selected items"**

#### **Configure Each Issue**
For each issue, set the custom fields:

**Issue #1: Authentication & User Management**
- Sprint: `Sprint 1: Foundation (Days 1-3)`
- Priority: `High`
- Component: `Backend`
- Estimate: `2`
- Developer: `Developer 1 (Backend/Frontend)`

**Issue #2: Rider Management System**
- Sprint: `Sprint 2: Core Development (Days 4-7)`
- Priority: `High`
- Component: `Backend`
- Estimate: `3`
- Developer: `Developer 1 (Backend/Frontend)`

**Issue #3: Mobile App Core**
- Sprint: `Sprint 2: Core Development (Days 4-7)`
- Priority: `High`
- Component: `Mobile`
- Estimate: `4`
- Developer: `Developer 2 (Mobile/Integration)`

**Issue #4: Database Schema & Setup**
- Sprint: `Sprint 1: Foundation (Days 1-3)`
- Priority: `High`
- Component: `Database`
- Estimate: `1`
- Developer: `Developer 1 (Backend/Frontend)`

**Issue #5: Location & Safety Services**
- Sprint: `Sprint 3: Integration & Delivery (Days 8-10)`
- Priority: `High`
- Component: `Mobile`
- Estimate: `2`
- Developer: `Developer 2 (Mobile/Integration)`

**Issue #6: Vehicle Management**
- Sprint: `Sprint 3: Integration & Delivery (Days 8-10)`
- Priority: `Medium`
- Component: `Backend`
- Estimate: `1.5`
- Developer: `Developer 1 (Backend/Frontend)`

**Issue #7: Frontend Dashboard Setup**
- Sprint: `Sprint 1: Foundation (Days 1-3)`
- Priority: `High`
- Component: `Frontend`
- Estimate: `1`
- Developer: `Developer 2 (Mobile/Integration)`

---

### **Step 6: Board Column Configuration**

#### **Update Default Columns**
1. Rename/add columns to match workflow:
   - 📋 **Backlog** (Todo → Backlog)
   - 🔄 **Sprint Planning**
   - 🚀 **In Progress**
   - 👀 **In Review**
   - 🧪 **Testing**
   - ✅ **Done**

#### **Column Setup**
1. Click column header → **"Edit"**
2. Rename and add emoji
3. Configure column automation if available

---

## 🎯 **Final Checklist**

After completing all steps, verify:
- [ ] All 5 custom fields created (Sprint, Priority, Component, Estimate, Developer)
- [ ] All 4 views created (Sprint Overview, Developer Workload, Component Progress, Current Sprint)
- [ ] All 7 issues added to project with proper field values
- [ ] Automation workflows enabled
- [ ] Board columns configured with proper names

---

## 📱 **Quick Access URLs**

- **Main Project**: https://github.com/users/anasabdullatheef/projects/1
- **Project Settings**: https://github.com/users/anasabdullatheef/projects/1/settings
- **Repository Issues**: https://github.com/anasabdullatheef/flcd-platform/issues

---

**🚀 Your GitHub Project will be fully configured and ready for 10-day sprint development!**