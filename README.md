# 📚 Classroom - Learning Management System

A professional, Google Classroom-inspired web application for teaching and learning. Built with Node.js, Express, and SQLite.

## Features

### For Teachers
- ✅ Create and manage classes
- ✅ Generate unique class codes for students
- ✅ Edit class details (name, description, subject, room)
- ✅ Create and manage assignments with due dates
- ✅ Post announcements to the class stream
- ✅ View student submissions
- ✅ Grade assignments and provide feedback
- ✅ Track class statistics (students, assignments)

### For Students
- ✅ Register as a student
- ✅ Join classes using class codes
- ✅ View class stream with announcements
- ✅ Submit assignments
- ✅ Track upcoming assignments
- ✅ View grades and feedback
- ✅ Responsive student dashboard

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: EJS templates, HTML5, CSS3, Vanilla JavaScript
- **Authentication**: bcryptjs for password hashing
- **Session Management**: express-session

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Georgebro99/Class.git
cd Class
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_secret_key_here
```

4. Start the application:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Default Usage

### Creating a Teacher Account
1. Click "Register"
2. Fill in your details
3. Select "Teacher" as your role
4. Click "Register"

### Creating a Student Account
1. Click "Register"
2. Fill in your details
3. Select "Student" as your role
4. Click "Register"

### Teacher Workflow
1. Login with teacher account
2. Go to Dashboard → Create New Class
3. Fill in class details and create
4. Share the class code with students
5. Create assignments and announcements
6. Manage student submissions

### Student Workflow
1. Login with student account
2. Go to Dashboard → Join a Class
3. Enter the class code from your teacher
4. View assignments and submit
5. Check announcements and grades

## Project Structure

```
Class/
├── config/
│   └── database.js          # Database initialization
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── index.js             # Main routes
│   ├── auth.js              # Auth routes (login, register)
│   ├── classes.js           # Class management routes
│   ├── assignments.js       # Assignment routes
│   ├── announcements.js     # Announcement routes
│   ├── student.js           # Student-specific routes
│   └── teacher.js           # Teacher-specific routes
├── views/
│   ├── layout.ejs           # Main layout
│   ├── index.ejs            # Home page
│   ├── auth/                # Authentication pages
│   ├── classes/             # Class pages
│   ├── assignments/         # Assignment pages
│   ├── announcements/       # Announcement pages
│   ├── student/             # Student pages
│   └── teacher/             # Teacher pages
├── public/
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   └── js/
│       └── main.js          # Client-side JavaScript
├── .env.example             # Environment variables example
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
├── server.js                # Main application file
└── README.md                # This file
```

## Database Schema

### Users Table
- Stores user information (teachers and students)
- Fields: id, email, password (hashed), first_name, last_name, role, created_at, updated_at

### Classes Table
- Stores class information
- Fields: id, name, description, code, teacher_id, subject, room, created_at, updated_at

### Enrollments Table
- Tracks student enrollment in classes
- Fields: id, user_id, class_id, joined_at

### Assignments Table
- Stores assignment details
- Fields: id, class_id, title, description, due_date, max_points, created_at, updated_at

### Submissions Table
- Stores student submissions
- Fields: id, assignment_id, user_id, submission_text, file_url, status, points, feedback, submitted_at, graded_at

### Announcements Table
- Stores class announcements
- Fields: id, class_id, teacher_id, title, content, created_at, updated_at

## Features in Detail

### Class Management
- Create classes with metadata (name, description, subject, room)
- Generate unique 6-character class codes
- Edit class details
- View enrolled students
- Track class statistics

### Assignments
- Create assignments with instructions and due dates
- Edit assignment details
- Set point values
- View all submissions
- Grade submissions with feedback
- Track submission status

### Announcements
- Post announcements to class stream
- Edit and delete announcements
- Chronological display
- View teacher information

### Student Features
- Join classes with codes
- Submit assignments
- View upcoming deadlines
- Track grades
- Access class stream

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Role-based access control
- SQL injection prevention with parameterized queries
- Environment variable configuration
- Password validation (minimum 6 characters)
- Email uniqueness validation

## Future Enhancements

- File upload support for assignments
- Email notifications
- Discussion/comment sections
- Grade books and GPA calculations
- Class calendar
- Real-time notifications
- Mobile app
- Two-factor authentication
- Integration with other LMS systems

## License

MIT License - feel free to use this project for educational purposes.

## Support

For issues or questions, please open an issue on GitHub.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.
