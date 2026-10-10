# Smart Car Hub — Eonix Tech Studio

Expo + React Native + TypeScript + Supabase automotive marketplace foundation.

## Important
This project is wired to a real Supabase backend. It cannot authenticate or save cloud data until you create a Supabase project, run `supabase/schema.sql`, create the `vehicle-images` storage bucket, and provide your project URL and **publishable/anon key** in `.env`. Never put a Supabase `service_role` key in a mobile app.

Some integrations require external setup before they can operate: email delivery/verification, push notifications, verified dealer/admin workflows, and real inspection providers. The app does not fabricate listings or successful bookings.

## Run
1. Install Node.js LTS and Git if needed.
2. Extract this folder and open a terminal inside it.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and fill in Supabase values.
5. In Supabase SQL Editor, run `supabase/schema.sql`.
6. In Supabase Storage, create a bucket named `vehicle-images`. For a simple public listing-image setup, set it public; do not store private documents in this bucket.
7. Run `npx expo start`, then scan the QR code using Expo Go.

## Included in this build
- Supabase email/password registration, login, session persistence and password reset email
- Home, search, filters, vehicle detail, favorites, compare up to four cars
- Create listing with image selection/upload, seller's listings, sold status
- Financing estimate calculator
- Profile editing and sign out
- Enquiry creation
- Test-drive/inspection request creation
- Persistent database schema with RLS for the core marketplace tables

## Configure before public launch
- Configure Supabase Auth email templates and site redirect URLs.
- Add a trusted server-side admin workflow; never grant admin based on user-editable profile data.
- Configure Expo push credentials and notification delivery.
- Configure moderation/review operations and a provider for inspections.
- Add automated tests, legal/privacy pages, abuse prevention/rate limits, and production monitoring.
- Verify all RLS policies against your real user roles before launch.

This is a functional foundation, not a claim that every optional third-party service is already deployed or production-certified.
