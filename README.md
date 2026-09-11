# 🙏 Ganesh Chavithi Fund Manager

A modern full-stack web application designed to help Ganesh Chavithi festival committees manage **collections, team member contributions, payments, expenses, transactions, balances, reports, and financial records** in one place.

## 🚀 Live Demo

(https://ganesh-chavithi-fund-1td8.bolt.host)

## 📸 Screenshots

Add screenshots of:

* Login page
* Dashboard
* Collections page
* Expenses page
* Team Members page
* Member Payment History
* Transactions
* Reports
* PDF Report

---

# ✨ Features

## 🔐 Authentication

* Email + Password authentication
* Create Account
* Sign In
* Secure Logout
* Protected dashboard
* User-specific data

## 💰 Collection Management

Record money received from donors.

Each collection can contain:

* Donor name
* Amount
* Description
* Date
* Time

---

## 👥 Team Member Contributions

Manage festival team members and their contribution commitments.

Track:

* Member name
* Total promised contribution
* Total paid
* Remaining amount
* Payment status

### Automatic Status

🟢 **COMPLETED**

🟡 **PARTIALLY PAID**

🔴 **NOT PAID**

---

## 💵 Installment Payments

Team members can pay their contribution in multiple installments.

For example:

**Total Contribution: ₹10,000**

Payment 1: ₹3,000

Payment 2: ₹2,000

Payment 3: ₹5,000

Automatically:

**Total Paid: ₹10,000**

**Remaining: ₹0**

**Status: COMPLETED**

Every payment is stored separately in payment history.

---

# 🔴 Expense Management

Record festival expenses with:

* Expense name
* Category
* Amount
* Description
* Date
* Time

Supported categories include:

* Decoration
* Food
* Pooja
* Sound System
* Electricity
* Transportation
* Idol
* Cleaning
* Other

---

# 📊 Automatic Financial Calculations

The application automatically calculates:

### Total Money Received

**General Collections + Team Member Payments**

### Total Expenses

**Sum of all expenses**

### Remaining Balance

**Total Money Received - Total Expenses**

Calculated values cannot be manually edited.

---

# 📅 Daily Financial Tracking

View:

* Today's money received
* Today's expenses
* Today's net
* Daily transactions
* Date-wise financial summaries

---

# 📋 Transaction Management

View all financial transactions in one place.

Transaction types:

* 🟢 General Collection
* 🟢 Team Member Payment
* 🔴 Expense

Includes:

* Search
* Filters
* Date filtering
* Category filtering
* Transaction type filtering
* Edit
* Delete

---

# 📈 Dashboard & Charts

The dashboard provides a quick financial overview.

Includes:

* Total Money Received
* Total Expenses
* Remaining Balance
* Total Team Contributions
* Total Team Paid
* Total Team Pending
* Completed Members
* Total Transactions

Charts include:

* Collections vs Expenses
* Expenses by Day
* Expenses by Category
* Team Contributions

---

# 📄 PDF Financial Reports

Generate professional PDF reports containing:

* Festival information
* Financial summary
* Money received
* General collections
* Team member contributions
* Team payment history
* Expenses
* Daily summary
* Remaining balance
* Report generation date/time
* Page numbers

### PDF Color System

🟢 Money Received → Green

🔴 Expenses → Red

🟢 Remaining Balance → Green

🟢 Completed → Green

🟡 Partially Paid → Yellow/Orange

🔴 Not Paid → Red

PDF reports can be filtered by:

* Today
* Yesterday
* This Week
* This Month
* Custom Date Range
* All Festival Data

---

# 👤 User Data Isolation

Every user's financial data is completely separate.

For example:

**User A**

Can only see User A's:

* Collections
* Expenses
* Team Members
* Payments
* Transactions
* Reports

**User B**

Can only see User B's data.

A new user starts with:

**₹0**

and an empty dashboard.

No fake/demo financial data is automatically added to real accounts.

---

# 🔒 Security

The application uses:

* Secure authentication
* Protected routes
* Backend authorization
* Database security
* User-specific data ownership
* Row Level Security where supported
* Input validation
* Secure sessions
* Delete confirmations
* Duplicate submission protection

---

# 📱 Responsive Design

Designed to work across:

* 📱 Android
* 📱 iPhone
* 📱 Tablets
* 💻 Laptops
* 🖥️ Desktop

The interface is mobile-first and optimized for quick financial entries during festival preparations.

---

# 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js Server Actions / API Routes

### Database

* PostgreSQL
* Supabase

### Authentication

* Supabase Auth
* Email + Password

### Charts

* Recharts

### PDF

* PDF generation library such as `@react-pdf/renderer`, `jsPDF`, or `pdf-lib`

---

# 🗂️ Project Structure

A simplified structure:

```text
ganesh-chavithi-fund-manager/
│
├── app/
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── collections/
│   ├── expenses/
│   ├── team-members/
│   ├── transactions/
│   ├── reports/
│   └── settings/
│
├── components/
│   ├── dashboard/
│   ├── collections/
│   ├── expenses/
│   ├── team-members/
│   ├── transactions/
│   └── ui/
│
├── lib/
│   ├── supabase/
│   ├── database/
│   ├── calculations/
│   └── utils/
│
├── types/
│
├── public/
│
├── README.md
├── package.json
└── ...
```

The exact structure may vary depending on the implementation.

---

# 🧮 Example

Suppose the festival receives:

### General Collections

₹35,000

### Team Member Payments

₹20,000

### Expenses

₹17,000

The application calculates:

**Total Money Received**

₹35,000 + ₹20,000

= **₹55,000**

**Remaining Balance**

₹55,000 - ₹17,000

= **₹38,000**

No manual calculation is required.

---

# 👥 Team Member Example

### Ramesh Kumar

Total Contribution:

**₹10,000**

Payments:

₹3,000 + ₹2,000 + ₹5,000

Total Paid:

**₹10,000**

Remaining:

**₹0**

Status:

🟢 **COMPLETED**

---

### Suresh Kumar

Total Contribution:

**₹8,000**

Paid:

**₹5,000**

Remaining:

**₹3,000**

Status:

🟡 **PARTIALLY PAID**

---

### Mahesh Kumar

Total Contribution:

**₹5,000**

Paid:

**₹0**

Remaining:

**₹5,000**

Status:

🔴 **NOT PAID**

---

# 🎯 Project Goal

The goal of this project is to replace manual notebooks, calculators, and scattered financial records with a simple digital system.

Instead of asking:

> "How much money did we collect?"

> "How much did we spend?"

> "How much does Ramesh still need to pay?"

> "How much money is left?"

The committee can simply open the dashboard and see the complete financial picture.

---

# 🌟 Why I Built This

Ganesh Chavithi festival committees often manage collections and expenses using notebooks, spreadsheets, or WhatsApp messages.

This project provides a simple solution where:

**Collections + Team Contributions + Payments + Expenses + Reports**

are managed in one application.

---

# 🔮 Future Improvements

Possible future features:

* Multiple festival years
* Festival-wise financial history
* WhatsApp sharing
* Excel/CSV export
* Receipt generation
* Donation receipts
* QR-code payment integration
* Multiple Admins
* Committee member roles
* Expense receipt/image uploads
* Dark mode
* Telugu language support
* Cloud backup
* Advanced financial analytics

---

# ⚙️ Local Development

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Go into the project:

```bash
cd ganesh-chavithi-fund-manager
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
.env.local
```

Add the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🔐 Environment Variables

Never commit real secrets to GitHub.

Use:

```text
.env.local
```

and add it to `.gitignore`.

Example:

```text
.env.local
.env
```

Never upload:

* Supabase service-role keys
* Database passwords
* API keys
* Authentication secrets
* Private credentials

---

# 🧪 Testing

The application should be tested for:

* Account creation
* Sign In
* Logout
* New user empty dashboard
* Existing user data persistence
* User data isolation
* Adding collections
* Adding expenses
* Adding team members
* Adding installment payments
* Automatic calculations
* Editing records
* Deleting records
* Search
* Filters
* Charts
* PDF generation
* PDF colors
* Mobile responsiveness

---

# 📜 License

Choose an appropriate license for the project.

For an open-source portfolio project, **MIT License** is a simple option.

---

# 🙏 Ganesh Chavithi

Built to make festival financial management:

**Simple • Clear • Organized • Transparent**

> **“ప్రతి రూపాయి లెక్క… ఒకే చోట.”**

**Every rupee tracked. One place.**
