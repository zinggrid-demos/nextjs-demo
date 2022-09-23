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

The application should now be running on port 3000, view it in your browser at `localhost:3000`. 

## Using the application

The first page you'll see is the home page describing the app. Start by going to the `Login` page via the link in the
toolbar at the top of the page. You should see the login form, with a notice indicating that you are the first user.
The authentication in this app is very simple: the first time you log in you can enter any password, and that will be
stored as your account password. Since you are the first user, you will become the administrator. You will be able to
create additional users, and you can reset their passwords if needed.

Users are only authorized to see the shows allowed by their highest content rating. The default is `TV-Y`, you'll need
to change this before you can see any shows. Go to the `Users` page, there should be one entry for your user. Use the 
pencil icon to edit that row of the table and set your highest content rating to `TV-MA`. You should also create 
some more test users while you're on this page. Create some users with a lower content rating so you can see that
they're shown fewer shows to rate when you log in as them.

You can now go to the `Shows` page and see the list of shows available to be rated. Go to the `Your Ratings` page
to enter some ratings by dragging the bars on the bar chart.  Note that the rating page has a `randomize` button 
you can use to assign a random rating to each of the shows displayed, this is to avoid the tedium of having to 
enter ratings for each user during testing.

There are two versions of the summary page, both should show the same results. The `Summary SSR` page is rendered on the
server, while the `Summary CSR` is rendered on the client. Take a look at the source code to see the differences
between server-side and client-side rendering.

The summary pages show a curved bar chart indicating the percentage of participation (what portion of the users have
entered ratings). Log out and log in as the other test users you created to enter ratings for each of them. The summary
page will show the average ratings and a radial plot displaying all the ratings for all users, with plots of the individual
users' ratings further down on the page.