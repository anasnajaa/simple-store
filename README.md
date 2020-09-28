# Simple-Store API and Admin panel
This is one of the three repositories that belong to the simple-store project.
This repository represents the backend/API side of the project.
The other two are:
 which represents the frontend project.
 which represents the (Android/iPhone) application project.

## What is the purpose of Simple-Store?
Simple-Store is a real life project of an e-commerce store used to demonstrate the usage of multiple technologies in a single project.
Real life projects get big and require writing clean and maintainable code.
In addition, they need to be flexible, extensible and scalable.

## Technologies/concepts used and demonstrated in this repository
- Version control to maintain a single source of truth, log/track changes and collaborate between team members
- Change publishing workflow with GitHub and Heroku
- API authentication with JWT (used for customers)
- Roles support in JWT authentications
- API endpoint for the main website and the Apps
- SQL database with Postgress SQL to store relational data
- NoSQL database with MongoDB to store session data and other non-relational data
- The usage of AWS S3 to store/delete files in the cloud and maintain their entry in SQL/NoSQL databases
- MVC architecture
- Stage variables for production and development
- Environment variables to store secrets
- Validation of all submitted data
- Sending emails for account verification, purchases and others
- Sending SMS for contact verification
- Usage of frontend UI libraries to build an admin panel with good user experience
- Usage of async/await instead of callbacks to reduce nesting and improve code tracing and readability
- Advanced SQL queries to perform required data retention
- Usage of SQL transactions to ensure data integrity
- Usage of Foreign Keys, Primary keys, Indexes to ensure data integrity
- Server load monitoring 
- Corn tasks for repeated tasks
- i18n in API, frontend and server-side rendered pages
