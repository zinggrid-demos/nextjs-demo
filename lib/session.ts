// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import type { SessionOptions } from 'iron-session'
import type { User } from 'pages/api/user'

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'zinggrid-demos/nextjs-demo',
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    user?: User
  }
}
