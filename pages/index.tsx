import Layout from 'components/Layout'
import Image from 'next/image'
import Link from 'next/link'
import useUser from 'lib/useUser'

export default function Home() {
  const {user} = useUser()

  return (
    <Layout>
      <h1>
        <span style={{ marginRight: '.3em', verticalAlign: 'middle' }}>
          <Image src="/GitHub-Mark-32px.png" width="32" height="32" alt="" />
        </span>
        <a href="https://github.com/zinggrid-demos/nextjs-demo" target="_blank" rel="noreferer">nextjs-demo</a> -
        ZingChart/ZingGrid example
      </h1>

      <p>
        Login with a username and password. If there are no users, you will
        create a new user and will become the administrator. Only the administrator
        can create new users. New users are created with no password, the password
        they enter the first time they log in will be used for subsequent logins.
      </p>

      <p>
        The administrator can add and remove TV shows to be rated. TV parental
        guideline ratings can be set for each show. Users also have a maximum
        content rating set. When a user logs into to rate shows, only those shows
        with suitable content are presented.
      </p>

      <p>
        A <Link href="/summary"><a>summary page</a></Link> shows the average ratings
        along with charts of the percentage of users who have rated shows and each of
        their individual ratings.
      </p>

			<h2>Links</h2>

      <ul>
        {(!user || user?.isLoggedIn === false) && (
          <li>
            <Link href="/login">
              <a>Login</a>
            </Link>
          </li>
        )}
        {user?.isLoggedIn === true && (
          <li>
            <Link href="/profile-sg">
              <a>
                <span
                  style={{
                    marginRight: '.3em',
                    verticalAlign: 'middle',
                    overflow: 'hidden',
                  }}
                >
                {user.username}
                </span>
              </a>
            </Link>
          </li>
        )}
        {user?.isLoggedIn === true && (
          <li>
            <Link href="/profile-ssr">
              <a>Profile (SSR)</a>
            </Link>
          </li>
        )}
      </ul>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  )
}
