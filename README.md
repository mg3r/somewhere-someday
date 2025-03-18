# Somewhere Someday

A mysterious website for a series of pop-up events. Features a glowing triangle that reveals details about the event when the correct password is entered.

## Features

- Minimalist design with a pulsing, glowing triangle
- Hidden chat interface that appears on click
- Secret password protection (password: 333)
- Event details revealed upon correct password entry

## Setup and Deployment

### Local Development

1. Clone this repository:
   ```
   git clone https://github.com/your-username/somewhere-someday.git
   cd somewhere-someday
   ```

2. Open `index.html` in your browser to test locally

### Deployment to Vercel

#### Option 1: Using Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```
   vercel
   ```

3. Follow the prompts to complete deployment

#### Option 2: Using GitHub Integration

1. Push your project to GitHub:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/somewhere-someday.git
   git push -u origin main
   ```

2. Import your repository on Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings (default options work fine)
   - Click "Deploy"

## Customization

- Edit event details in `scripts/main.js`
- Modify the triangle's appearance in `styles/main.css`
- Change the password in `scripts/main.js`

## License

MIT