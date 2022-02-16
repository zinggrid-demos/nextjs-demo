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
import 'zingchart/es6'
import ZingChart from 'zingchart-react'
import 'zingchart/modules-es6/zingchart-dragging.min.js'

import {getUsernames, getShowsAndRatingsForUsername} from 'lib/database'
  

//export default function Ratings({shows}) {    SSR
export default function Ratings() {
  const {user} = useUser({redirectTo: '/login'})

  const chart = useRef(null)
  const router = useRouter()
  const username = router.query.username

  const [shows, setShows] = useState([])    // CSR
  const haveShows = shows.length > 0

  const config = {
    type: "vbullet",
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
        values: shows.map(x => x.ratings.length == 0 ? 0.2 : x.ratings[0].rating),
        dataDragging: true,
        rules: [
          {
            backgroundColor: "#81c784",
            rule: "%v < 1",
          },
          {
            backgroundColor: "#ef5350",
            rule: "%v < 4",
          },
          {
            backgroundColor: "#ffca28",
            rule: "%v >= 4",
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
   * Called when a drag is finished, store the ratings in the database
   */
  function storeRatings() {
    const data = chart.current.getseriesdata()
    console.log(JSON.stringify(data, null, 4))
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