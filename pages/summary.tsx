/* 
 * Summary of ratings, visible to all users.
 */
import Layout from 'components/Layout'
import {withIronSessionSsr} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import useUser from 'lib/useUser'
import {useRef, useEffect, useState} from 'react'
import 'zingchart/es6'    // CSR
//import 'zingchart'        // SSR
import ZingChart from 'zingchart-react'
import 'zingchart/modules-es6/zingchart-dragging.min.js'

import {getHasRated, getAvgRatings, getRatings} from 'lib/database'

/*
 * Compute the series for the radar chart given a list of
 * shows and the ratings by user.
 */
function radarSeries(shows, users) {
  if(!shows || !users) return []

  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'orange']

debugger
  return users.map((u, index) => ({
    text: u.username,
    values: shows.map(s => u.ratings[s] || 0),
    backgroundColor: colors[index]
  }))
}

/* 
 * The Summary component
 */
//export default function Summary({shows}) {    // SSR
export default function Summary() {   // CSR
  const {user} = useUser({redirectTo: '/login'})

  const chart = useRef(null)

  const [shows, setShows] = useState([])    // CSR
  const [hasRated, setHasRated] = useState([])  //CSR
  const [avgRatings, setAvgRatings] = useState([])  //CSR
  const [ratings, setRatings] = useState({})  //CSR

	// What percentage of users have entered ratings
  const percentRated = Math.round(hasRated.reduce((accum, x) => accum + (x.rated ? 1 : 0), 0) * 100 / hasRated.length)


  const config = {
    graphset: [
      {
        type: 'gauge',      // gauge indicating how many users have entered ratings
        height: '50%',
        width: '30%',
        x: '0%',
        y: '0%',
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
            fontSize: 35,
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
            values: [percentRated],
            backgroundColor: 'black',
            indicator: [10, 10, 10, 10, 0.75]
          }
        ]
      },
      {
        type: "bar",
        height: '100%',
        width: '70%',
        x: '30%',
        y: '0px',
        title: {
          text: 'Average Ratings',
        },
        scaleX: {
          labels: avgRatings.map(x => x.show),
          itemsOverlap: true,
          maxItems: avgRatings.length,
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
            values: avgRatings.map(x => x.rating),
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
      },
      {
        type: 'radar',
        height: '50%',
        width: '30%',
        x: '0%',
        y: '50%',
        plot: {
          aspect: 'area',
        },
        scaleV: {
          visible: false,
        },
        scaleK: {
          values: '0:5:1',
          labels: ratings.shows,
          guide: {
            alpha: 0.3,
            backgroundColor: '#c5c5c5 #718eb4',
            lineColor: '#607D8B',
            lineStyle: 'solid',
          },
          item: {
            backgroundColor: 'white',
            borderColor: '#aeaeae',
            borderRadius: '10px',
            borderWidth: '1px',
            fontColor: '#607D8B',
            padding: '5 10',
          },
          refLine: {
            lineColor: '#c10000',
          },
          tick: {
            lineColor: '#59869c',
            lineWidth: '2px',
            lineStyle: 'dotted',
            size: 20,
          },
        },
        series: radarSeries(ratings.shows, ratings.users)
      }
    ]
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
        <pre>
          hasRated:&nbsp;
          {JSON.stringify(hasRated, null, 4)}
          <br />
          avgRatings:&nbsp;
          {JSON.stringify(avgRatings, null, 4)}
          <br />
          ratings:&nbsp;
          {JSON.stringify(ratings, null, 4)}
        </pre>
        </>
      )}
    </Layout>
  )
}

/* 
 * Get the data needed to render this page.
 */
export const SSRgetServerSideProps = withIronSessionSsr(async function ({req, res}) {
  const users = await getUsers()

  return {
    props: {users}
  }
}, sessionOptions)