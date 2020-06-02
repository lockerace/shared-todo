# shared-todo-bot
Simple Discord Bot to serve shared todo list per channel

## Requirements
- Node.js version >10 installed

## Installation
- clone this repository
- copy/rename `.env-example` to `.env`
- edit `.env` with any text file editor (Please save it in UTF-8 encoding) and setup bot configuration (see Configuration below)
- run `npm install`
- run `npm start`
- invite Your Bot to your server

## Configuration
- TD_AUTH_TOKEN : Discord Bot Authentication Token (you get this from Discord Developer Portal) [required]
- TD_DB : DB Path to store todo list [default: `db/todos.json`]
- TD_PREFIX : Bot prefix (you need type this before any command) [default: `todos`]
- TD_COLOR : MessageEmbed color (color of bot responds) [default: `#0099ff`]
- TD_USERNAME : Bot Username (to match with your Discord Bot Username) [default: `Todo Bot`]

## Commands
- `<prefix> help` : Show all available commands. [example: `todos help`]
- `<prefix> add <description>` : Add a new todo. [example: `todos add task number 1`]
- `<prefix> remove <number>` : Complete a todo. [example: `todos remove 1`]
- `<prefix>` : Show current todos. [example: `todos`]

## Translation
You can edit file `messages.json` using any text file editor (Please save it in UTF-8 encoding)
