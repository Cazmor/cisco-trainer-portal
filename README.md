# Cisco Trainer Progress Tracking System

A comprehensive progress tracking system for Cisco training centers.

## Features

- Multi-center management
- Student progress tracking
- Attendance management
- Performance analytics
- Lab equipment inventory
- Class scheduling
- Report generation
- KPI scorecard
- AI-powered assistant

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15 (via Docker)

## Installation

1. Clone the repository:
git clone <repository-url>
cd instructor-portal

2. Install dependencies:
npm install

3. Start PostgreSQL database:
docker-compose -f docker/docker-compose.yml up -d

4. Setup database schema and seed data:
npm run db-setup

5. Start the application:
npm run dev

6. Open http://localhost:3000 in your browser

## Default Login Credentials

- Super Admin: admin@cisco.com / admin123
- Centre Admin (Nairobi): nairobi.admin@cisco.com / admin123
- Centre Admin (Mombasa): mombasa.admin@cisco.com / admin123
- Centre Admin (Kisumu): kisumu.admin@cisco.com / admin123
- Instructor (Nairobi): instructor1.nairobi@cisco.com / instructor123

## License

ISC
