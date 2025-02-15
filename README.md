# HomeSphere

**HomeSphere** is a comprehensive household management tool designed to streamline daily tasks, enhance organization, and improve communication within households. With a focus on simplicity and usability, HomeSphere provides families with an all-in-one solution for task management, financial tracking, inventory management, and more.

## Project Overview

**Start Date:** November 8, 2024  
**End Date:** February 7, 2025  

**Project Lead:** Linus Wörndle
**Project Team Member 1** Christian Schallner
**Project Team Member 2** Fabian Lampert

## Features

1. **Family Calendar**  
   - Sync events with iCloud and other calendar services to keep everyone updated.

2. **To-Do List**  
   - Manage tasks for individuals and families to ensure chores are completed.

3. **Shared Shopping List**  
   - Create a unified shopping list accessible to all household members.

4. **Household Inventory**  
   - Keep track of all household items with detailed records and optional barcode scanning.

5. **Task Assignment**  
   - Assign tasks to specific family members for accountability.

6. **Points & Rewards System**  
   - Motivate family members with a points-based reward system.

7. **Penalties**  
   - Set consequences for uncompleted tasks to maintain household discipline.

8. **Financial Management**  
   - Track household finances with a simple budgeting tool.

9. **Family Chat**  
   - Communicate instantly with all family members in one place.

10. **ChatBot Assistance**  
    - AI-powered assistant to help with household management.

11. **Smart Home Integration** (optional)  
    - Control and monitor smart home devices within the app.

12. **Trash Collection Notifications**  
    - Receive reminders for trash disposal schedules.

13. **Recurring Task Log**  
    - Monitor recurring tasks like maintenance and repairs.

14. **AI-Suggested Appointments**  
    - Get reminders for medical check-ups, vaccinations, and more.

15. **Barcode Scanner** (optional)  
    - Quickly add and manage items in the inventory with barcode scanning (using Open EAN/GTIN Database).

16. **AI Integration**  
    - Utilize AI services like Rasa for enhanced household assistance.

17. **User Feedback**  
    - Easily provide feedback on features for continuous improvement.

## Non-Goals

HomeSphere is not intended to be:
- A complex accounting software
- A comprehensive home automation hub
- A specialized security system
- A social network
- A replacement for specialized applications
- A professional maintenance service provider
- A full ERP solution
- A specialized finance software

## Key Success Factors

- **User-Friendliness:** Intuitive and easy to use for all family members.
- **Reliability:** Consistent performance and dependability.
- **Data Protection & Security:** Prioritizes data privacy and household safety.
- **Scalability:** Available on computers, websites, and mobile apps.
- **High Performance:** Efficient and responsive, even with multiple users.
- **User Feedback Integration:** Responsive to user suggestions and needs.

---

HomeSphere is designed to simplify household management while offering flexibility and robust functionality for modern families. Enjoy a more organized, collaborative, and connected home experience with HomeSphere!

## Technical Stack

- **Backend:** Node.js with Express.js
- **Frontend:** Web-based interface
- **Database:** TBD
- **AI Integration:** Rasa for chatbot functionality
- **External Services:**
  - iCloud Calendar integration
  - Open EAN/GTIN Database for barcode scanning

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/MasterLini/HomeSphere.git
   cd HomeSphere
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Development Setup

1. Ensure you have all prerequisites installed
2. Fork the repository
3. Create a new branch for your feature
4. Make your changes
5. Submit a pull request

## Contributing

We welcome contributions to HomeSphere! Please follow these steps:

1. Check the issue tracker for open issues
2. Discuss major changes in an issue before starting
3. Follow the coding style of the project
4. Write clear commit messages
5. Submit a pull request with a clear description of changes

## License

This project is private and proprietary. All rights reserved.

# HomeSphere User Management

## Features

### User Profile Management
- View and edit user profile information
- Upload profile images
- Update password
- Real-time validation and error handling

### Family Management
- View family members
- Add new family members
- Change member roles (admin/parent/child/guest)
- Remove family members
- Role-based access control

### User Search
- Search users by name or username
- Real-time search results
- Add users to family

## API Endpoints

### User Management
- GET /users/me - Get authenticated user info
- PUT /users/me - Update user profile
- PUT /users/me/password - Update user password
- POST /users/me/profile-image - Upload profile image
- GET /users/search - Search users

### Family Management
- GET /users/family/:familyId - Get family members
- POST /family/members - Add family member
- PUT /family/members/:userId/role - Update member role
- DELETE /family/members/:userId - Remove family member

## Setup and Usage

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
cd src/backend
npm start
```

3. Start the frontend development server:
```bash
cd src/interface_page
npm run serve
```

4. Access the application at http://localhost:8080

## Error Handling
- Loading states for all operations
- Error messages for failed operations
- Success notifications
- Input validation
- Role-based access control

## Technologies Used
- Vue.js for frontend
- Express.js for backend
- MongoDB for database
- JWT for authentication
