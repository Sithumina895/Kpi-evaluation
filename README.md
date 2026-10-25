# Nawaloka Hospitals PLC – Balanced Scorecard (BSC) KPI Evaluation System

A modern, responsive, and secure enterprise healthcare web application built for **Nawaloka Hospitals PLC, Colombo, Sri Lanka**. The system aligns clinical and non-clinical departmental strategic objectives with employee performance using a 5-pillar Balanced Scorecard (BSC) KPI evaluation model.

---

## 🏥 Architecture & Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion
- **UI Components:** Bespoke Tailwind components built in `src/components/ui/` (Button, Card, Dialog, Tabs, Input, Select, Table, Toast, Badge, Tooltip, Sheet)
- **Visuals & Charts:** `recharts` (Radar, Bar, Line charts)
- **Exports:** `jspdf` + `html2canvas` (PDF report generation) & `papaparse` (CSV roster bulk import and rankings export)
- **Data & Security Layer:** Dual architecture with clean interface `DataService`:
  1. **Demo Mode (`LocalDemoDataService`):** Browser `localStorage` persistence with automatic seed bootstrapping, full audit logging, and zero configuration.
  2. **Production Mode (`FirebaseDataService`):** Modular Firebase v10+ SDK (Firebase Authentication & Cloud Firestore) with Attribute-Based Access Control (ABAC).

---

## 🎨 Design & Balanced Scorecard Model

### Brand Color Palette
- **Hospital Primary Navy:** `#1F3A6E`
- **Clinical Departments Theme (8 departments):** Teal `#1A9BB0`
- **Non-Clinical Departments Theme (9 departments):** Orange `#E8821E`

### BSC Parameter Weights & Focus
1. **Financial (20% | Orange #E8821E):** H3 carbon reduction and departmental cost savings
2. **Customer (20% | Teal #1A9BB0):** Patient & client care experience, turnaround times
3. **Internal Process (25% | Blue #2F5FAF):** H1 ESG & H2 digital health, EMR adoption, infection control
4. **Learning & Growth (15% | Green #2E9E5B):** People capability, CPD training hours, QI projects
5. **Individual Performance (20% | Purple #6B3FA0):** Attendance & punctuality, Competency & skills, Behaviour & teamwork, Initiative & self-development

### Scoring Formula
$$\text{Category Score} = \left(\frac{\text{Average Rating (1 to 5)}}{5}\right) \times \text{Category Weight}$$
$$\text{Final Composite Score} = \sum_{i=1}^{5} \text{Category Score}_i \quad (\text{out of } 100)$$

### Performance Grade Bands (Configurable)
- **90 – 100:** Outstanding (Emerald)
- **80 – 89.99:** Exceeds Expectations (Teal)
- **70 – 79.99:** Meets Expectations (Blue)
- **60 – 69.99:** Needs Improvement (Amber)
- **Below 60:** Unsatisfactory (Rose)

---

## 🚀 Running in Demo Mode (Instant Evaluation)

When `src/firebase/config.ts` contains placeholder values, the app automatically runs in **Demo Mode**:
1. Open the web application.
2. You will see all 17 departments (8 clinical in teal, 9 non-clinical in orange) and a dismissible Demo Helper banner.
3. Click one of the 1-click test login buttons or select a department:
   - **Department Head (CD5 Pharmacy):** `pharmacy.head@nawaloka.lk` (password: `password123`)
   - **Super Administrator:** `admin@nawaloka.lk` (password: `password123`)
4. In Demo Mode, you can:
   - View live dashboards with Radar, Bar, and Line charts.
   - Edit strategic objectives and departmental KPI rubrics.
   - Evaluate staff members with live score calculations.
   - Save drafts, submit, approve, and reopen evaluations.
   - Print or export PDF evaluation certificates.
   - Bulk import employee rosters via CSV.
   - Customize grade boundaries and reset demo seed data from Settings.

---

## 🔥 Connecting a Real Firebase Project

To switch from Demo Mode to production Firebase:

### Step 1: Create a Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** and name it (e.g., `nawaloka-kpi-system`).
3. Add a **Web App** (`</>`) and register it.

### Step 2: Enable Firebase Authentication
1. In the Firebase console sidebar, navigate to **Build > Authentication**.
2. Click **Get Started**, choose **Email/Password**, enable the toggle, and click **Save**.

### Step 3: Create Cloud Firestore Database
1. Go to **Build > Firestore Database** and click **Create database**.
2. Select a location close to Sri Lanka (e.g., `asia-south1` Mumbai or `asia-southeast1` Singapore).
3. Start in **Production Mode**.

### Step 4: Paste Configuration
Open `src/firebase/config.ts` and replace the placeholder fields in `firebaseConfig`:
```typescript
export const firebaseConfig: FirebaseClientConfig = {
  apiKey: "AIzaSy...",
  authDomain: "nawaloka-kpi-system.firebaseapp.com",
  projectId: "nawaloka-kpi-system",
  storageBucket: "nawaloka-kpi-system.appspot.com",
  messagingSenderId: "123456789...",
  appId: "1:123456789:web:abcdef...",
  firestoreDatabaseId: "(default)",
};
```
Once real credentials are provided, `isFirebaseConfigured()` automatically activates `FirebaseDataService`.

### Step 5: Deploy Security Rules
Copy the rules from `firestore.rules` and paste them into the **Firestore Database > Rules** tab in the Firebase Console, then click **Publish**.

Key security protections enforced by `firestore.rules`:
- Roles are strictly verified from the separate `/userRoles/{uid}` collection (never self-assigned in user profiles).
- Departmental data isolation: evaluators and department heads can only access documents matching their assigned department.
- Immutability: submitted and approved evaluations cannot be tampered with unless unlocked by a Super Admin.
- `auditLog` is strictly append-only.

### Step 6: Create First Super Admin & Seed Data
1. Launch the application. The system will detect that no Super Administrator exists and display the **Initial System Provisioning** screen.
2. Enter the administrator's name, email, and master password.
3. Once logged in as Super Admin, go to **System & Grade Bands (Settings)** in the sidebar and click **Seed Demo Data** to populate all 17 Nawaloka departments, objectives, and KPI templates.
