/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                myred: "#a4133c",
                shBlack: "#1a1a1a",
                grey:"#f1f1f1",
            },
            fontFamily: {
                mont: ["Montserrat"],
                montMedium: ["MontserratMedium"],
                montSemiBold: ["MontserratSemiBold"],
                montBold: ["MontserratBold"],
            },

        },
    },
    plugins: [],
};
