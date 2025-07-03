# CRM Internal

CRM Knotsync Internal is a robust, customizable CRM (Customer Relationship Management) solution built with Next.js, Tailwind CSS, Firebase, and MongoDB. Designed for modern sales and support teams, it provides seamless authentication, dashboard management, and data analytics in a scalable architecture.

## Features

- **Next.js**: Fast, modern React framework for server-side rendering and routing.
- **Firebase Authentication**: Secure, real-time authentication and user management.
- **MongoDB**: Flexible, document-based database for storing CRM data.
- **Tailwind CSS**: Rapid styling with utility-first CSS.
- **Radix UI**: Accessible and unstyled React primitives.
- **Data Visualization**: Integrated with Recharts for analytics.
- **Form Management**: React Hook Form and Zod for robust form validation.
- **CSV Import/Export**: Powered by PapaParse.
- **Theme Support**: Light and dark mode with next-themes.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aditi21Attri/CRM-Knotsync-Internal.git
   cd CRM-Knotsync-Internal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env.local` and fill in your Firebase and MongoDB credentials.

4. **Development**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:9002](http://localhost:9002).

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## File Structure

- `src/app/page.tsx`: Main entry page. Handles authentication and redirects users to the dashboard or login.
- `src/contexts/AuthContext.tsx`: Authentication logic (see actual file for implementation).
- `src/components/`: UI components.
- `docs/`: Project documentation.

## Scripts

| Command              | Description                        |
|----------------------|------------------------------------|
| npm run dev          | Start development server           |
| npm run build        | Build for production               |
| npm start            | Start production server            |
| npm run lint         | Lint codebase                      |
| npm run typecheck    | Type-check codebase                |

## Contributing

1. Fork this repo.
2. Create your branch: `git checkout -b feature/fooBar`
3. Commit your changes: `git commit -am 'Add some fooBar'`
4. Push to the branch: `git push origin feature/fooBar`
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

---

For more information, view the [project files](https://github.com/Aditi21Attri/CRM-Knotsync-Internal/tree/main) or check the `docs/` folder.
