/* 
 * Bar chart for rating shows, visible to all logged-in users.
 * Only the shows suitable for this user will be included in the
 * chart.
 */
import Layout from 'components/Layout'
import {withIronSessionSsr} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import useUser from 'lib/useUser'
import {useRouter} from 'next/router'
import {useRef, useEffect, useState} from 'react'
import 'zingchart/es6'    // CSR
//import 'zingchart'        // SSR
import ZingChart from 'zingchart-react'
import 'zingchart/modules-es6/zingchart-dragging.min.js'

import {getUsernames, getShowsAndRatingsForUsername, addRatingForUserAndShow, updateRating} from 'lib/database'

//export default function Ratings({shows}) {    // SSR
export default function Ratings() {   // CSR
  const {user} = useUser({redirectTo: '/login'})

  const chart = useRef(null)
  const router = useRouter()
  const username = router.query.username

  const [shows, setShows] = useState([])    // CSR
  const haveShows = shows.length > 0

  const min = -0.2        // lowest rating, not zero so we can still grab the bar

  const config = {
    type: "vbullet",
    options: {
      decimals: 2
    },
    title: {
      text: `${username}'s Ratings`,
    },
    subtitle: {
      text: "Drag the bars to enter your ratings",
    },
    scaleX: {
      labels: shows.map((x) => x.title),
      itemsOverlap: true,
      maxItems: shows.length,
      item: {
        angle: 15
      }
    },
    scaleY: {
      values: "0:5:1"
    },
    tooltip: {
      borderRadius: "3px",
      borderWidth: "0px",
      fontSize: "14px",
      shadow: true,
    },
    series: [
      {
        values: shows.map(x => x.ratings.length == 0 ? min : x.ratings[0].rating),
        dataDragging: true,
        rules: [
          {
            backgroundColor: "#ef5350",
            rule: "%v < 1",
          },
          {
            backgroundColor: "#ffca28",
            rule: "%v >= 1 && %v < 3",
          },
          {
            backgroundColor: "#81c784",
            rule: "%v >= 3",
          }
        ]
      }
    ]
  }

	/*
   * Retrieve the data (CSR)
   */
  async function getData(username) {
    setShows(await getShowsAndRatingsForUsername(username))
  }

  useEffect(() => getData(username))

  /*
   * Called when a drag is finished, store the ratings in the database.
   * We also adjust the data so that it doesn't exceed the top limit
   * and doesn't become exactly 0 (which makes it impossible to drag again).
   */
  function storeRatings() {
    const data = chart.current.getseriesdata()

    data[0].values = data[0].values.map(x => x > 5 ? 5 : (x < 0.1 ? min : x))
  
    chart.current.setseriesdata({data})

    // Now either add a new rating or update the existing rating for each show
    for(const index in shows) {
      if(shows[index].ratings.length == 0) 
        addRatingForUserAndShow(user.id, shows[index].id, data[0].values[index])
      else
        updateRating(shows[index].ratings[0].id, data[0].values[index])
    }
  }

  return (
    <Layout>
      <h1>{username}'s Ratings</h1>
      {!haveShows && (
        <h3>There are no shows suitable for your age group.</h3>
      )}
      {!user?.isLoggedIn && (
        <h2>You must be logged in to view this page.</h2>
      )}
      {haveShows && user?.isLoggedIn && (
        <>
        <h3>Enter your rating for each of the shows shown below, on a scale of 0 to 5.</h3>
        <ZingChart ref={chart} data={config} height='600px' modules='dragging' zingchart_plugins_dragging_complete={storeRatings} />
        <pre>
          {JSON.stringify(shows, null, 4)}
          <br />
          {JSON.stringify(user, null, 4)}
        </pre>
        </>
      )}
    </Layout>
  )
}

/*
 * Return a list of possible values for username,
 * folded into an array of params: objects.
 */
export async function SSRgetStaticPaths() {
  const users = await getUsernames()
  const paths = users.map(u => ({
    params: {
      username: u
    }
  }))

  return {
    paths,
    fallback: false
  }
}

/* 
 * Fetch the current ratings and shows for params.username
 */
export async function SSRgetStaticProps({params}) {
  const shows = await getShowsAndRatingsForUsername(params.username)

  return {
    props: {
      shows
    }
  }
}