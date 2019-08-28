const bcrypt = require('bcryptjs');

module.exports = {
  register: async (req, res) => {
    const { username, password, isAdmin } = req.body
    const db = req.app.get('db')
    db.get_user(username)
      .then(async numUsers => {
        if (numUsers[0].count == 0) {
          const hash = await bcrypt.hash(password, 10)
          await db.register_user(username, hash)
          res.sendStatus(200)
        } else {
          res.status(409).json('Username taken, please choose a different one.')
        }
      })
      .catch(err => {
        this.setState({ username: '', password: '' })
        alert(err.response.request.response)
      })
    const hash = bcrypt.hashSync(password);
    const registeredUser = await db.register_user([isAdmin, username, hash]);
    const user = registeredUser[0];
    req.session.user = { isAdmin: user.is_admin, username: user.username, id: user.id };
    return res.status(201).send(req.session.user);
  },
  login: async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await req.app.get('db').get_user([username]);
    const user = foundUser[0];
    if (!user) {
      return res.status(401).send('User  not found. Please register as a new user before logging in.');
    }
    const isAuthenticated = bcrypt.compareSync(password, user.hash);
    if (!isAuthenticated) {
      return res.status(403).send('Incorrect password');
    }
    req.session.user = { isAdmin: user.is_admin, id: user.id, username: user.username };
    return res.send(req.session.user);
  },
  logout: (req, res) => {
    req.session.destroy();
    return res.sendStatus(200);
  }
}