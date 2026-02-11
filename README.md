# TMS Elite - Transport Management System

A comprehensive, full-stack Transport Management System built with React, Node.js, and PostgreSQL.

## Features

- **Dashboard**: Real-time fleet tracking map and performance analytics.
- **Fleet Management**: Complete CRUD operations for vehicles.
- **Order Management**: Create and track shipments.
- **Driver Management**: Manage driver profiles and performance.
- **Finance**: Track income and expenses with visual charts.
- **Real-time Simulation**: Automated script to simulate vehicle movement in Jakarta.
- **Advanced Analytics**: Weekly performance breakdown based on historical data.
- **Authentication**: Secure login system with role-based dashboard access.
- **Settings**: Admin profile management.
- **Mobile Responsive**: Fully adaptive layout for desktop and mobile devices.

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS, Lucide React, Recharts, Leaflet
- **Backend**: Node.js, Express, PostgreSQL (pg)
- **Database**: PostgreSQL

## Installation

1.  **Clone the repository** (or unzip the project folder).

2.  **Database Setup**:
    - Ensure PostgreSQL is installed and running.
    - Create a database named `tms_db`.
    - Run the schema scripts located in `tms-backend/` (e.g., `create_users_table.js`, `create_drivers_table.js`, etc.) if needed, or rely on the application to handle basic connections.
    - **Note**: The backend scripts assume a password of `admin123` for the postgres user. Update `server.js` if yours is different.

3.  **Backend Setup**:
    ```bash
    cd tms-backend
    npm install
    ```

4.  **Frontend Setup**:
    ```bash
    cd tms-frontend
    npm install
    ```

## Usage

1.  **Start the Backend**:
    ```bash
    cd tms-backend
    node server.js
    ```
    The server will run on `http://localhost:5000`.

2.  **Run the Simulation (Optional for Real-time Demo)**:
    Open a new terminal:
    ```bash
    cd tms-backend
    node simulate_movement.js
    ```

3.  **Start the Frontend**:
    Open a new terminal:
    ```bash
    cd tms-frontend
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

4.  **Login**:
    - Username: `admin`
    - Password: `password123` (or as configured in your database)

## Contributing

Feel free to submit issues and enhancement requests.
