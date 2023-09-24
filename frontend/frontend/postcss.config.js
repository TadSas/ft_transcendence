const tailwindcss = require('tailwindcss')
const autoprefixer = require('tailwindcss')

module.exports = {
	plugins: [tailwindcss('./tailwind.config.js'), autoprefixer]
}