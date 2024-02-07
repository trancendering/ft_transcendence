const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

// Load environment variables from .env file, fallback to .env.development if not specified
const envPath = path.join(__dirname, `.env`);
const env = dotenv.config({ path: envPath }).parsed;

// Reduce the env variables to a nice object for DefinePlugin
const envKeys = env ? Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
}, {}) : {};

module.exports = {
	watch: true,
	mode: "development",
	entry: "./src/app.js",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	devServer: {
		static: path.resolve(__dirname, "dist"),
		compress: true,
		port: 8080,
		hot: true,
		historyApiFallback: true,
	},
	plugins: [
		new HtmlWebpackPlugin({ template: "./src/index.html" }),
		new webpack.DefinePlugin(envKeys),
		new FaviconsWebpackPlugin("./src/static/img/favicon.ico"),
	],
	module: {
		rules: [
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "static/img",
						},
					},
				],
			},
			{
				test: /\.json$/,
				type: "javascript/auto",
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "static/fonts",
						},
					},
				],
			},
			{
				test: /\.mp3$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "static/sounds",
						},
					},
				],
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.(scss)$/,
				use: [
					{
						// Adds CSS to the DOM by injecting a `<style>` tag
						loader: "style-loader",
					},
					{
						// Interprets `@import` and `url()` like `import/require()` and will resolve them
						loader: "css-loader",
					},
					{
						// Loader for webpack to process CSS with PostCSS
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: [autoprefixer],
							},
						},
					},
					{
						// Loads a SASS/SCSS file and compiles it to CSS
						loader: "sass-loader",
					},
				],
			},
		],
	},
};
