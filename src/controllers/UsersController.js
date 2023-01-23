class UsersController {
  create(request, response) {
    const { name, email, password } = request.body

    return response.json({ name, email, password }, 201)
  }
}

module.exports = UsersController
