# Booking Service Backend

This is the backend service for the ConcertBook application, built using Go with the Fiber framework. It provides APIs for managing concert bookings, including authentication and CRUD operations.

## Prerequisites

- **Go**: Version 1.18 or higher (install from [golang.org](https://golang.org/dl/))
- **Docker**: For running the application with Docker Compose (install from [docker.com](https://www.docker.com/get-started))
- **Node.js and npm**: Required for the frontend (assumed to be in a separate directory), but not directly for the backend.
- **Git**: For cloning the repository.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd booking-service
   ```

2. **Install Dependencies**:
   - Ensure Go modules are initialized and dependencies are downloaded:
     ```bash
     go mod tidy
     ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory with the following content:
     ```
     JWT_SECRET=your-secure-secret-key
     PORT=8082
     ```
   - Replace `your-secure-secret-key` with a strong, unique secret for JWT signing.

## Running the Application

### Option 1: Using Docker Compose (Recommended)
1. **Build and Start the Services**:
   - Use Docker Compose to build and run the application:
     ```bash
     docker compose up -d --build
     ```
   - This will start the backend service on `http://localhost:8082`.

2. **Stop the Services**:
   - To stop the application:
     ```bash
     docker compose down
     ```
## Troubleshooting
- **Invalid Token Errors**: Ensure the `JWT_SECRET` in your `.env` matches the key used to sign the token.
- **CORS Issues**: If testing with a frontend, configure CORS in the `routes.go` file to allow your frontend origin.
- **Database**: This assumes an in-memory or mocked database. For a real database, configure a connection in `services/booking_service.go`.

## Contributing
Feel free to submit issues or pull requests. Ensure you follow the existing code style and update tests if applicable.