import React from 'react'
import Layout from 'components/Layout'
import useUser from 'lib/useUser'
import useEvents from 'lib/useEvents'

export default function Profile() {
  const { user } = useUser({
    redirectTo: '/login',
  })
  const { events } = useEvents(user)

  return (
    <Layout>
      <h1>{user?.username}'s profile</h1>
      {user && (
        <>
          <span className="label">Username: </span>
          <span className="value">{user.username}</span>
          <br />
          <span className="label">Password: </span>
          <span className="value">{user.password ? 'set' : 'not set'}</span>
          <br />
          <span className="label">Administrator?: </span>
          <span className="value">{user.admin == 1 ? 'yes' : 'no'}</span>
          <br />
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      )}

      <style jsx>{`
        .label {
          font-size: 110%;
        }

        .value {
          font-size: 110%;
          font-weight: bold;
        }
      `}</style>
    </Layout>
  )
}
