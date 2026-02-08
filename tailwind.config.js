/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                midnight: '#0B1120',
                slate: {
                    800: '#1E293B', // Widgets
                    900: '#0F172A',
                },
                gold: {
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                },
                neon: {
                    red: '#EF4444',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'gold': '0 0 15px rgba(245, 158, 11, 0.2)',
            }
        },
    },
    plugins: [],
}
