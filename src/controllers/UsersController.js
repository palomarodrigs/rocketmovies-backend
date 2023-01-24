const AppError = require('../utils/AppError')

class UsersController {
  create(request, response) {
    const { name, email, password } = request.body

    // if (!name) {
    //   throw new AppError('O nome é obrigatório!')
    // }

    return response.json({ name, email, password }, 201)
  }
}

module.exports = UsersController
