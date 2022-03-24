/* 
 * Summary of ratings, visible to all users.
 */
import Layout from 'components/Layout'
import {withIronSessionSsr} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import useUser from 'lib/useUser'
import {useRef, useEffect, useState} from 'react'
import 'zingchart/es6'  
import ZingChart from 'zingchart-react'
import 'zingchart/modules-es6/zingchart-dragging.min.js'

import {getHasRated, getAvgRatings, getRatings} from 'lib/database'


// Set of colors for radar charts
const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'orange']

/* 
 * The Summary component
 */
export default function Summary() {  
  const {user} = useUser({redirectTo: '/login'})

  const chart = useRef(null)

  const [hasRated, setHasRated] = useState([]) 
  const [avgRatings, setAvgRatings] = useState([]) 
  const [ratings, setRatings] = useState({shows: [], users: []}) 

	// What percentage of users have entered ratings
  const percentRated = Math.round(hasRated.reduce((accum, x) => accum + (x.rated ? 1 : 0), 0) * 100 / hasRated.length)

  // Configuration for the multiple chart summary
  const config = {
    graphset: [
      gauge(percentRated, {
        height: '50%',
        width: '30%',
        x: '0%',
        y: '0%'
      }),
      barchart(avgRatings, {
        height: '100%',
        width: '70%',
        x: '30%',
        y: '0px'
      }),
      radar(ratings.shows, radarSeries(ratings.shows, ratings.users), {
        title: {
          text: 'Ratings'
        },
        height: '50%',
        width: '30%',
        x: '0%',
        y: '40%',
        legend: {
          align: 'center',
          verticalAlign: 'bottom'
        },
      })
    ]
  }

  // Configuration for the radar small multiples chart
  const smCols = 3
  const smRows = Math.ceil(ratings.users.length/smCols)
  const config2 = {
    layout: `${smRows}x${smCols}`,
    graphset: radarSMgraphset(ratings.shows, ratings.users)
  }

	/*
   * Retrieve the data (CSR)
   */
  async function getData() {
    setHasRated(await getHasRated())
    setAvgRatings(await getAvgRatings())
    setRatings(await getRatings())
  }

  useEffect(() => getData(), [])

  return (
    <Layout>
      <h1>Summary</h1>
      {!user?.isLoggedIn && (
        <h2>You must be logged in to view this page.</h2>
      )}
      {user?.isLoggedIn && (
        <>
        <ZingChart data={config} height="600px" />
        <br />
        <ZingChart data={config2} height="600px" />
        </>
      )}
    </Layout>
  )
}

/*
 * Given the percentage of people who have rated, return
 * the spec for the gauge.
 */
function gauge(raters, addons) {
  return {
    ...addons,
    type: 'gauge',      // gauge indicating how many users have entered ratings
    title: {
      text: 'Participation'
    },
    globals: {
      fontSize: 25
    },
    plotarea: {
      marginTop: 80
    },
    plot: {
      size: '100%',
      valueBox: {
        placement: 'center',
        text: '%v%',
        fontColor: '#666666',
        fontSize: 20,
        rules: [
          {
            rule: '%v >= 90',
            text: '%v%<br>Excellent'
          },
          {
            rule: '%v < 90 && %v > 50',
            text: '%v%<br>Good'
          },
          {
            rule: '%v < 50',
            text: '%v%<br>Not good'
          }
        ]
      }
    },
    tooltip: {
      borderRadius: 5
    },
    scaleR: {
      aperture: 180,
      minValue: 0,
      maxValue: 100,
      step: 10,
      center: {
        visible: false
      },
      tick: {
        visible: false
      },
      item: {
        offsetR: 0,
        rules: [
          {
            rule: '%i == 9',
            offsetX: 15
          }
        ]
      },
      labels: ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
      ring: {
        size: 50,
        rules: [
          {
            rule: '%v < 50',
            backgroundColor: '#E53935'
          },
          {
            rule: '%v >= 50 && %v < 70',
            backgroundColor: '#EF5350'
          },
          {
            rule: '%v >= 70 && %v < 90',
            backgroundColor: '#FFA726'
          },
          {
            rule: '%v >= 90',
            backgroundColor: '#29B6F6'
          }
        ]
      }
    },
    series: [
      {
        values: [raters],
        backgroundColor: 'black',
        indicator: [5, 5, 5, 5, 0.55]
      }
    ]
  }
}

/*
 * Given the average ratings data, return the barchart spec.
 */
function barchart(avgR, addons) {
  return {
    ...addons,
    type: "bar",
    title: {
      text: 'Average Ratings',
    },
    scaleX: {
      labels: avgR.map(x => x.show),
      itemsOverlap: true,
      maxItems: avgR.length,
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
        values: avgR.map(x => x.rating),
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
}

/*
 * Compute the series for the stacked radar chart given a list of
 * shows and the ratings by user.
 */
function radarSeries(shows, users) {
  if(!shows || !users) return []

  return users.map((u, index) => ({
    text: u.username,
    values: shows.map(s => u.ratings[s] || 0),
    backgroundColor: colors[index]
  }))
}

/*
 * Compute the graphset for the small multiple radar chart given a list of
 * shows and the ratings by user.
 */
function radarSMgraphset(shows, users) {
  return users.map((u, index) => radar(shows, [{
    text: u.username,
    values: shows.map(s => u.ratings[s] || 0),
    backgroundColor: colors[index]
  }], {
    title: {text: u.username}
  } ))
}

/*
 * Return a radar chart description given the list of shows
 * and the series. Used for both the stacked and small multiple
 * charts.
 */
function radar(shows, series, addons) {
  return {
    ...addons,
    type: 'radar',
    plot: {
      aspect: 'rose',
      tooltip: {
        text: "%kt: %v"
      }
    },
    scaleV: {
      values: '0:5:1',
      visible: false,
    },
    scaleK: {
      values: `0:${shows.length-1}:1`,
      labels: shows,
      aspect: 'circle',
      guide: {
        alpha: 0.3,
        lineColor: '#607D8B',
        lineStyle: 'solid',
      },
      item: {
        alpha: 0
      }
    },
    series: series
  }
}