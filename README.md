# BioLabX

BioLabX is a clean, responsive React + Vite + Tailwind CSS MVP foundation for an AI-powered virtual biotechnology lab platform. It includes a public homepage, public experiment discovery, Supabase-ready authentication, and protected dashboard areas.

## Features

- Home page for the BioLabX platform
- Student Dashboard with learning progress and AI guidance
- Experiments catalog with simulated biotechnology activities
- Gel Electrophoresis Simulator interface
- Teacher Dashboard with class insights
- Inventory page for lab materials and equipment
- Supabase authentication pages for login, signup, and password reset
- Protected Student Dashboard, Teacher Dashboard, and Inventory routes
- Role-ready structure for student, teacher, lab assistant, and admin users
- Professional academic light theme
- Mobile responsive navigation and layouts

## Tech Stack

- React
- Vite
- Tailwind CSS
- Lucide React icons
- Supabase

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/Jd144/BioLab-x.git
   cd BioLab-x
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Add your Supabase project values to `.env.local`:

   ```bash
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Build for production:

   ```bash
   npm run build
   ```

## Supabase Setup

1. Create a new project in Supabase.
2. Open the SQL Editor.
3. Run the schema in `supabase/schema.sql`.
4. In Authentication settings, configure your site URL and redirect URLs for local and deployed environments.
5. Copy your project URL and anon public key into `.env.local`.

## Vercel Environment Variables

Add these variables in your Vercel project settings before deployment:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Authentication Notes

- Home, Experiments, and Gel Electrophoresis are public.
- Student Dashboard, Teacher Dashboard, and Inventory require login.
- Signup stores role metadata for future role-based access: `student`, `teacher`, `lab_assistant`, and `admin`.
- Gel Electrophoresis is prepared for future progress saving through the `student_progress` table.

## Notes

- Existing dashboards still use dummy display data while the Supabase foundation is added.
- Real experiment saving, admin controls, and AI integrations can be added in future iterations.
