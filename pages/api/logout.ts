import { getIronSession } from 'iron-session'
import { sessionOptions } from 'lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import type { User } from 'pages/api/user'

export default logoutRoute

async function logoutRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  let session = await getIronSession(req, res, sessionOptions)

  session.destroy()
  res.json({ isLoggedIn: false, login: '', avatarUrl: '' })
}
