const { hash, compare } = require('bcryptjs')
const AppError = require('../utils/AppError')

const UserRepository = require('../repositories/UserRepository')
const sqliteConnection = require('../database/sqlite')
const UserCreateService = require('../services/UserCreateService')
class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body

    const userRepository = new UserRepository()
    const userCreateService = new UserCreateService(userRepository)

    await userCreateService.execute({ name, email, password })

    return response.json()
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body
    const user_id = request.user.id

    const database = await sqliteConnection()
    const user = await database.get('SELECT * FROM users WHERE id = (?)', [user_id])

    if (!user) {
      throw new AppError('User not found')
    }

    const userWithUpdatedEmail = await database.get('SELECT * FROM users WHERE email = (?)', [email])

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError('This email is already in use.')
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if (password && !old_password) {
      throw new AppError('You need to enter the old password to set the new password!')
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError('The old password does not match.')
      }

      if (password === old_password) {
        throw new AppError('The new password must be different from the current one.')
      }

      user.password = await hash(password, 8)
    }

    await database.run(
      ` UPDATE users SET
        name = ?,
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?`,
      [user.name, user.email, user.password, user_id]
    )

    return response.json()
  }
}

module.exports = UsersController
