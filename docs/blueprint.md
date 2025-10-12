# **App Name**: Five Star Gym Manager

## Core Features:

- Aluno Management: Register and manage student data, including photo uploads to Firebase Storage.
- Matricula Management: Enroll students in plans, calculating expiration dates and updating enrollment status.
- Inadimplência Notifications: Check for overdue accounts every night, update status, and send out e-mail reminders.
- Pagamento Registration: Allows staff to log payments against overdue invoices. When staff enters payment data, use a tool to register the payments and activate the registration to calculate the new due date.
- Treino Management: Instructors create and save workout plans for students, including exercises, sets, and reps.
- Catraca Verification: An API endpoint checks the 'statusMatricula' of students from a biometric hash and unlocks turnstile, if applicable.
- Authentication and Authorization: Firebase Authentication ensures access and safety for student data.

## Style Guidelines:

- Primary color: Saturated blue (#42A5F5), to evoke trust, reliability, and health. It's suitable for a gym management application dealing with sensitive member data and fitness regimens.
- Background color: Light blue (#E3F2FD) which will provide a calm and clean background that doesn't distract from the main content.
- Accent color: Analogous hue shifted towards green (#4CAF50) and in a much more saturated color. Used to indicate success, healthy activity, and progress. For instance, used on approval buttons.
- Body and headline font: 'PT Sans' (sans-serif) combines a modern look with a little warmth or personality; suitable for both headlines and body text.
- Use clean, modern icons from Material-UI to represent different functionalities, like user management, payments, and workout creation.
- Use a grid-based layout with clear sections for easy navigation and content organization. Follow Material Design principles.
- Subtle transitions and animations to provide feedback on user actions and improve the overall user experience. For example, a loading animation when fetching data.