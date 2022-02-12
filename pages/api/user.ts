import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {getUserByName} from 'lib/database'

export type User = {
  isLoggedIn?: boolean
  id?: number
  username: string
  suitability: number
  admin: boolean
}

export default withIronSessionApiRoute(userRoute, sessionOptions)

async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  if (req.session.user) {
    const u = await getUserByName(req.session.user.username)
    if(u) {
      res.json({
        ...u,
        isLoggedIn: true
      })
    } else {
      res.json({
        ...req.session.user,
        isLoggedIn: true
      })
    }
  } else {
    res.json({
      isLoggedIn: false,
      username: '',
      suitability: 0,
      admin: false
    })
  }
}
