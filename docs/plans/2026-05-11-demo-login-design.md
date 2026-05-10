# Demo Login Design

Goal: add an opt-in demo account helper to the login page.

Design:
- Show an "Akun Demo" panel only when `NEXT_PUBLIC_ENABLE_DEMO_LOGIN=true`.
- Provide four role buttons: Pelanggan, Admin, Super Admin, Partner.
- Clicking a role fills the login form with the seeded email and demo password.
- Demo password uses `NEXT_PUBLIC_DEMO_PASSWORD` when present, otherwise `Password123!`.
- The user still clicks "Masuk" manually; no automatic login.

Testing:
- Login page hides demo accounts by default.
- Login page shows role buttons when env flag is enabled.
- Clicking a demo role fills email and password fields.
