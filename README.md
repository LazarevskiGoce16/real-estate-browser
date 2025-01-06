# Real Estate App - Internet Programming Final Project

This is a simple real estate application built using Angular. It allows users to view and interact with available apartments in various buildings. The app is designed with Angular for the frontend and uses a mock backend served via `json-server` to simulate a RESTful API for buildings and bookings.

## Features

- Display a list of buildings and their apartments.
- Show booking information, including book price and buy price.
- Book an apartment or mark it as available.
- Updates apartment status dynamically when booked or marked available.

## Technologies Used

- **Frontend**: Angular
- **Backend**: JSON-server (simulating a REST API with `db.json`)
- **CSS**: For styling

## Setup Instructions

### Instructions for Use:
1. **Clone the repository**: This command clones the project to your local machine.
2. **Install dependencies**: `npm install` installs all necessary packages for both the frontend and backend.
3. **Start backend (json-server)**: `json-server --watch db.json --port 3000` will start a mock REST API at `localhost:3000`.
4. **Start Angular frontend**: Run `ng serve` to launch the Angular application on `localhost:4200`.
5. **Open the app**: Navigate to `http://localhost:4200` to view the real estate app.

Let me know if this works for you or if there are any further adjustments!

### Clone the repository

Clone this repository to your local machine:

```bash
git clone https://github.com/yourusername/real-estate-app.git
cd real-estate-app
