# Slot game example

## About

This "simple" slot game project was made in 3 days completely from scratch, using Babel JavaScript ES6 transpiler for syntax and WebPack for builds deployment. The complete game engine was made along with the game - it's an Entity Component System framework for architecture and WebGL API for rendering. Also the game server was made to provide ability to select symbols that will show on client application.

## Live demo:

[Online Slot game client](http://slots.psichix.io)

[Online Slot game admin panel](http://slots.psichix.io/api/admin)

## Installing and running

### Server:

```bash
cd ./backend
npm install
npm run build
node .
```

Admin panel for selecting symbols can be found at [http://localhost/api/admin](http://localhost/api/admin).

### Client:

```bash
cd ./frontend
npm install
npm run dev
```

Game client can be found at [http://localhost:8080](http://localhost:8080).
