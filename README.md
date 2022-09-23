# Demo of using ZingGrid and ZingChart in a NextJS app

This project demonstrates using both ZingGrid and ZingChart in a NextJS application.
The application is meant to be used by a small group of people that watch TV together
to rate a collection of shows. The first user to log in becomes the administrator,
giving them priviledge to add other users and shows for them to rate. Each user has
a highest content rating (from TV-Y to TV-MA) and will only be shown shows appropriate 
for their age on their rating page.

## Prerequisites

For this app you'll need `node` and `npm` installed. We recommend running the server
locally, it will require `python` as well as `node` and `npm`.

## Starting the server

There's a simple [`tuql`](https://github.com/bradleyboy/tuql) server that supports this
app, you should install it and run it locally. The server is [here](https://github.com/zinggrid-demos/graphql-demo-server).
Download it, `cd` into its directory and 

1. `npm install`
2. `npm run reset`
3. `npm run start`

(See the README for the server for more details.)
This will start the server on port 4000. You can reset the database to its initial state with `npm run reset`.

## Starting the client

Download this repository and `cd` into the directory. Edit the file `lib/database.ts` and set the constant `database`
to thr URL for your instance of `graphql-demo-server` (probably `http://localhost:4000/graphql`, but you may have it 
running on a different host and port). Then run:

1. `npm install`
2. `npm run dev`

The application should now be running on port 3000, view it in your browser at `localhost:3000`. Start by creating the
first user and password, then play around adding new users, assigning them a highest content rating, and setting ratings
for each of the users. Note that the rating page has a `randomize` button you can use to assign a random rating to each
of the shows displayed, this is just to avoid the tedium of having to enter ratings for each user during testing.
