/* 
 * Bar chart for rating shows, visible to all logged-in users.
 * Only the shows suitable for this user will be included in the
 * chart.
 */
import Layout from 'components/Layout'
import useUser from 'lib/useUser'
import {useRouter} from 'next/router'
import {useRef, useEffect, useState} from 'react'
import 'zingchart/es6'
import ZingChart from 'zingchart-react'
import 'zingchart/modules-es6/zingchart-dragging.min.js'

import {getUsernames, getShowsAndRatingsForUsername, addRatingForUserAndShow, updateRating} from 'lib/database'

export default function Ratings() {  
  const {user} = useUser({redirectTo: '/login'})

  const chart = useRef(null)
  const router = useRouter()
  const username = router.query.username    

  const [shows, setShows] = useState([])  
  const [readonly, setReadonly] = useState(false)

  const haveShows = shows.length > 0

  const min = -0.2        // lowest rating, not zero so we can still grab the bar
  const subtitle = readonly ? '' : 'Drag the bars to enter your ratings'

  const config = {
    type: "vbullet",
    options: {
      decimals: 2
    },
    title: {
      text: `${username}'s Ratings`,
    },
    subtitle: {
      text: subtitle,
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
        dataDragging: !readonly,
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

  useEffect(() => {
    getData(username)
  })

  /*
   * Called when a drag is finished, store the ratings in the database.
   * We also adjust the data so that it doesn't exceed the top limit
   * and doesn't become exactly 0 (which makes it impossible to drag again).
   */
  function dragComplete() {
    const data = chart.current.getseriesdata()

    data[0].values = data[0].values.map(x => x > 5 ? 5 : (x < 0.1 ? min : x))
  
    chart.current.setseriesdata({data})
    storeRatings(data[0].values)
  }

  /*
   * Compute a random value for each rating.
   * Note that we round each value to 2 decimal places.
   */
  function shuffle() {
    const data = chart.current.getseriesdata()
  
    for(const i in data[0].values)
      data[0].values[i] = Math.round(((Math.random() * 4.5) + 0.3) * 100)/100
  
    chart.current.setseriesdata({data})
    storeRatings(data[0].values)
  }

  /*
   * Either add a new rating or update the existing rating for each show.
   * This will only be called if !readonly, so we know the user is the
   * logged in user.
   */
  function storeRatings(values) {
    for(const index in shows) {
      if(shows[index].ratings.length == 0) 
        addRatingForUserAndShow(user.id, shows[index].id, values[index])
      else
        updateRating(shows[index].ratings[0].id, values[index])
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
      {haveShows && user?.isLoggedIn && readonly && (
        <h3>Rated on a scale of 0 to 5</h3>
      )}
      {haveShows && user?.isLoggedIn && !readonly && (
        <h3>Enter your rating for each of the shows shown below, on a scale of 0 to 5 <button onClick={shuffle}>Randomize</button></h3>
      )}
      {haveShows && user?.isLoggedIn && (
        <ZingChart ref={chart} data={config} height='600px' modules='dragging' zingchart_plugins_dragging_complete={dragComplete} />
      )}
    </Layout>
  )
}