# Real-time Collaborative IDE

A collaborative code editor that allows multiple users to edit code simultaneously in the same file in real-time.

## Features

- **Real-time Code Collaboration**: Multiple users can edit code simultaneously with cursor tracking
- **User Authentication**: Secure login and registration system with JWT
- **Project Management**: Create, edit, and manage coding projects
- **Syntax Highlighting**: Support for multiple programming languages
- **Version History**: Track changes with version control
- **Role-based Access Control**: Define who can edit or view your projects
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React.js with Hooks and Context API
- CodeMirror 6 for the code editor
- Material-UI for responsive design
- Socket.IO client for real-time communication
- Axios for API requests

### Backend
- Node.js with Express
- Socket.IO for real-time bidirectional communication
- MongoDB for database storage
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/collaborative-ide.git
cd collaborative-ide
```

2. Install dependencies
```
npm run install-all
```

3. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/collaborative-ide
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

4. Run the development server
```
npm run dev
```

This will start both the backend server (on port 5000) and the frontend development server (on port 3000).

## Usage

1. Register a new account or login
2. Create a new project or open an existing one
3. Share the project URL with collaborators
4. Start coding together in real-time

## Project Structure

```
collaborative-ide/
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   └── src/
│       ├── components/     # Reusable components
│       ├── context/        # Context providers
│       ├── pages/          # Page components
│       ├── reducers/       # State reducers
│       └── utils/          # Utility functions
├── server/                 # Backend Node.js application
│   ├── config/             # Configuration files
│   ├── controllers/        # Request controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   └── routes/             # API routes
└── .env                    # Environment variables
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgements

- [CodeMirror](https://codemirror.net/)
- [Socket.IO](https://socket.io/)
- [Material-UI](https://mui.com/)
