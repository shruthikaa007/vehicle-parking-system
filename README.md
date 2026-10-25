# 🚗 Vehicle Parking and Campus Access Management System

A web-based application designed to simplify vehicle registration, parking slot management, reservations, and campus vehicle access.

## 📌 About the Project

The **Vehicle Parking and Campus Access Management System** aims to make campus parking more organized, efficient, and secure. It provides a centralized platform for students, staff, and administrators to manage vehicle information and parking activities.

The system is designed to reduce manual parking management, improve slot utilization, and support convenient vehicle access monitoring within a campus.

## 🎯 Objectives

- Digitize vehicle registration and document submission.
- Manage parking slots and their availability.
- Support parking reservation management.
- Provide a dashboard for parking-related information.
- Help authorized personnel monitor campus vehicle entry and exit.
- Support parking violation tracking and notifications.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Building the user interface |
| JavaScript | Frontend functionality |
| HTML5 | Web page structure |
| CSS3 | Styling and layout |
| Bootstrap 5 | Responsive UI components |
| PHP | Backend logic and API development |
| MySQL / MariaDB | Database management |
| XAMPP | Local Apache, PHP, and database environment |
| Git and GitHub | Version control and source code hosting |
| Visual Studio Code | Code editing and development |

## ✨ Key Modules

### 1. User Authentication
Provides account registration, login, and role-based access where implemented.

### 2. Vehicle Registration
Allows users to submit vehicle details and upload supporting documents for verification.

### 3. Parking Slot Management
Displays parking slot information and availability.

### 4. Parking Reservations
Supports the process of reserving available parking slots.

### 5. Campus Access Management
Designed to record vehicle entry and exit activities.

### 6. Violation Management
Designed to support recording parking violations, such as unauthorized parking and overstaying.

### 7. Dashboard
Displays parking-related summaries and information relevant to the logged-in user.

### 8. Notifications
Provides a place for users to view relevant parking updates and notifications.

## 🏗️ System Architecture

The application follows a frontend–backend–database architecture.

1. **Frontend — React.js:** Displays pages, forms, dashboards, and user interactions.
2. **Backend — PHP:** Processes requests, validates inputs, applies application logic, and communicates with the database.
3. **Database — MySQL/MariaDB:** Stores user, vehicle, parking, reservation, and related records.
4. **Local Server — XAMPP:** Provides the environment to run the PHP backend and database locally.

**Request flow:**

`React.js → PHP API → MySQL Database → PHP API → React.js`

## 📂 Project Structure

```text
vehicle-parking-system/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── index.html
├── backend/
│   ├── config/
│   ├── auth/
│   ├── vehicles/
│   ├── parking/
│   ├── reservations/
│   └── ...
├── database/
│   └── campus_parking.sql
└── README.md
```

*Note: This is an illustrative structure. Adjust it to match the actual files and folders in your repository.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following tools:

- [Node.js and npm](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd vehicle-parking-system
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### Step 2: Configure the Database

1. Open XAMPP Control Panel.
2. Start **Apache** and **MySQL**.
3. Open `http://localhost/phpmyadmin`.
4. Create the database `campus_parking`, or import the supplied SQL file if it creates the database itself.
5. Import `database/campus_parking.sql` if that file exists in the repository.
6. Configure the database credentials in the PHP database connection file.

### Step 3: Configure the PHP Backend

Place the project in the XAMPP web directory if required by your setup. For example:

```text
C:\xampp\htdocs\vehicle-parking-system
```

Ensure the PHP API files are accessible through Apache and update the frontend API base URL to match the actual backend location.

### Step 4: Run the React Frontend

Open a terminal in VS Code:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal, usually:

`http://localhost:5173`

Keep the XAMPP services running while using features that require the PHP backend or database.

## 🔐 Security Considerations

- Validate user input on the server.
- Use password hashing for account credentials.
- Use prepared statements for database queries.
- Enforce authentication and authorization on protected API endpoints.
- Validate uploaded documents and restrict permitted file types and sizes.
- Do not commit passwords, database secrets, session tokens, or private user documents to GitHub.

## 🚀 Future Enhancements

- QR-code-based vehicle entry and exit.
- Real-time parking availability updates.
- Email or SMS notifications.
- Parking analytics and utilization reports.
- Improved reservation conflict prevention.
- Enhanced security monitoring and audit trails.

## 🎓 Project Information

**Project Title:** Vehicle Parking and Campus Access Management System  
**Domain:** Web Development  
**Frontend:** React.js  
**Backend:** PHP  
**Database:** MySQL / MariaDB  
**Development Environment:** Visual Studio Code and XAMPP

## 👩‍💻 Author

**Sri Shruthikaa S.**

Computer Science and Engineering Student

## 📄 License

This project was developed for educational and academic purposes. Add a license such as the MIT License only if you intend to publish the project under those terms.
